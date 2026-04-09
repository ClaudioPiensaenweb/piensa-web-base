#!/usr/bin/env node
/**
 * maintenance.mjs — Herramientas de mantenimiento para Directus
 *
 * Uso:
 *   node scripts/maintenance.mjs health           → health check
 *   node scripts/maintenance.mjs snapshot         → exportar schema como JSON
 *   node scripts/maintenance.mjs permissions      → auditar permisos públicos
 *   node scripts/maintenance.mjs export-content   → exportar contenido base como JSON
 *
 * Variables de entorno:
 *   DIRECTUS_URL    URL de Directus (default: http://localhost:8055)
 *   DIRECTUS_TOKEN  Token de administrador (requerido)
 */

const CMS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN   = process.env.DIRECTUS_TOKEN || process.env.ADMIN_TOKEN;

if (!TOKEN) {
    console.error('❌  Define DIRECTUS_TOKEN o ADMIN_TOKEN en el entorno');
    console.error('    Ejemplo: DIRECTUS_TOKEN=xxx node scripts/maintenance.mjs health');
    process.exit(1);
}

const H = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
};

async function api(path, opts = {}) {
    const res = await fetch(`${CMS_URL}${path}`, { headers: H, ...opts });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
}

// ── Comandos ──────────────────────────────────────────────────────────────────

async function health() {
    console.log(`🔍  Checking ${CMS_URL}...\n`);
    try {
        const res = await fetch(`${CMS_URL}/server/health`);
        const body = await res.json();
        if (body.status === 'ok') {
            console.log('✅  Directus operativo');
        } else {
            console.log('⚠️   Directus con problemas:', JSON.stringify(body, null, 2));
        }

        // Versión
        const infoRes = await fetch(`${CMS_URL}/server/info`, { headers: H });
        if (infoRes.ok) {
            const info = await infoRes.json();
            console.log(`    Versión: ${info.data?.directus?.version || 'desconocida'}`);
        }

        // Verificar acceso público básico
        console.log('\n📋  Verificando acceso público...');
        const publicChecks = ['estilo', 'empresa', 'seo'];
        for (const col of publicChecks) {
            const r = await fetch(`${CMS_URL}/items/${col}?limit=1`);
            const icon = r.ok ? '✅' : '❌';
            console.log(`    ${icon}  ${col} → ${r.status}`);
        }
    } catch (e) {
        console.error(`❌  Directus no responde: ${e.message}`);
        process.exit(1);
    }
}

async function snapshot() {
    console.log('📸  Exportando schema...\n');
    const { ok, data } = await api('/schema/snapshot');
    if (!ok) {
        console.error('❌  Error al obtener snapshot:', JSON.stringify(data));
        process.exit(1);
    }

    const { writeFileSync, mkdirSync } = await import('fs');
    const { join } = await import('path');

    const dir = join(process.cwd(), 'cms', 'snapshots');
    mkdirSync(dir, { recursive: true });

    const ts = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
    const filename = join(dir, `${ts}-schema.json`);
    writeFileSync(filename, JSON.stringify(data.data, null, 2));

    const { collections = [], fields = [], relations = [] } = data.data || {};
    console.log(`✅  Schema exportado: ${filename}`);
    console.log(`    Colecciones: ${collections.length}`);
    console.log(`    Campos:      ${fields.length}`);
    console.log(`    Relaciones:  ${relations.length}`);
    console.log('\n💡  Commitea el snapshot:');
    console.log(`    git add cms/snapshots/ && git commit -m "chore: schema snapshot ${ts}"`);
}

async function permissions() {
    console.log('🔐  Auditando permisos públicos...\n');

    // Buscar policy pública
    const { data: policiesData } = await api('/policies');
    const pub = (policiesData.data || []).find(
        p => p.name === '$t:public_label' || p.icon === 'public'
    );
    if (!pub) {
        console.error('❌  Policy pública no encontrada — ¿está configurada?');
        return;
    }

    const { data: permsData } = await api(
        `/permissions?filter[policy][_eq]=${pub.id}&limit=-1`
    );
    const perms = permsData.data || [];
    console.log(`    Policy pública ID: ${pub.id}`);
    console.log(`    Permisos totales:  ${perms.length}\n`);

    // Agrupar por colección
    const byCollection = {};
    for (const p of perms) {
        if (!byCollection[p.collection]) byCollection[p.collection] = [];
        byCollection[p.collection].push(p.action);
    }

    const SENSITIVE = [
        'directus_users', 'directus_settings', 'directus_permissions',
        'directus_roles', 'directus_activity',
    ];
    const REQUIRED = ['estilo', 'empresa', 'seo', 'directus_files'];

    const warnings = [];

    for (const [col, actions] of Object.entries(byCollection).sort()) {
        const isSensitive = SENSITIVE.includes(col);
        const icon = isSensitive ? '⚠️ ' : '  ';
        console.log(`${icon}  ${col.padEnd(35)} ${actions.join(', ')}`);
        if (isSensitive) warnings.push(`${col} tiene acceso público (${actions.join(', ')})`);
    }

    // Verificar colecciones requeridas
    console.log('\n📋  Colecciones requeridas:');
    for (const col of REQUIRED) {
        const found = byCollection[col]?.includes('read');
        console.log(`    ${found ? '✅' : '❌'}  ${col}`);
        if (!found) warnings.push(`${col} NO tiene lectura pública — dynamic-styles.js puede fallar`);
    }

    if (warnings.length > 0) {
        console.log('\n⚠️   ADVERTENCIAS:');
        warnings.forEach(w => console.log(`    - ${w}`));
    } else {
        console.log('\n✅  Permisos correctos');
    }
}

async function exportContent() {
    console.log('📦  Exportando contenido...\n');

    const { writeFileSync } = await import('fs');
    const collections = [
        { name: 'posts',      query: '?limit=-1&filter[status][_eq]=published' },
        { name: 'categories', query: '?limit=-1' },
        { name: 'estilo',     query: '' },
        { name: 'empresa',    query: '' },
        { name: 'seo',        query: '?limit=-1' },
    ];

    const result = {};
    for (const { name, query } of collections) {
        const { ok, data } = await api(`/items/${name}${query}`);
        if (ok) {
            result[name] = data.data;
            const count = Array.isArray(data.data) ? `${data.data.length} ítems` : '1 singleton';
            console.log(`    ✅  ${name.padEnd(15)} ${count}`);
        } else {
            console.log(`    ❌  ${name.padEnd(15)} error ${data.errors?.[0]?.message || 'desconocido'}`);
        }
    }

    const ts = new Date().toISOString().slice(0, 10);
    const filename = `content-export-${ts}.json`;
    writeFileSync(filename, JSON.stringify(result, null, 2));
    console.log(`\n✅  Exportado: ${filename}`);
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const COMMANDS = {
    health,
    snapshot,
    permissions,
    'export-content': exportContent,
};

const cmd = process.argv[2];

if (!cmd || !COMMANDS[cmd]) {
    console.log(`Mantenimiento de Directus — piensa-web-base

Uso:
  node scripts/maintenance.mjs <comando>

Comandos:
  health          Verificar que Directus está operativo y acceso público
  snapshot        Exportar schema actual (guarda en cms/snapshots/)
  permissions     Auditar permisos públicos — detecta colecciones expuestas
  export-content  Exportar contenido de colecciones base como JSON

Variables de entorno:
  DIRECTUS_URL    URL de Directus (default: http://localhost:8055)
  DIRECTUS_TOKEN  Token de admin (requerido — usa ADMIN_TOKEN local)

Ejemplos:
  # Local
  DIRECTUS_TOKEN=dev-admin-token node scripts/maintenance.mjs health

  # Producción
  DIRECTUS_URL=https://cms.dominio.com DIRECTUS_TOKEN=xxx node scripts/maintenance.mjs permissions
`);
    process.exit(0);
}

COMMANDS[cmd]().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
