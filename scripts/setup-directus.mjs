/**
 * setup-directus.mjs
 * Crea las colecciones base y datos de ejemplo en Directus.
 * Idempotente — se puede ejecutar varias veces sin errores.
 *
 * Uso: node scripts/setup-directus.mjs
 */

const CMS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN   = process.env.DIRECTUS_TOKEN || 'dev-admin-token';

const H = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

async function api(path, opts = {}) {
    const res = await fetch(`${CMS_URL}${path}`, { headers: H, ...opts });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
}

async function exists(collection) {
    const { ok } = await api(`/collections/${collection}`);
    return ok;
}

async function createCollection(payload) {
    if (await exists(payload.collection)) {
        console.log(`  ✓ Ya existe: ${payload.collection}`);
        return;
    }
    const { ok, data } = await api('/collections', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    console.log(ok ? `  ✓ Creada: ${payload.collection}` : `  ✗ Error ${payload.collection}: ${JSON.stringify(data.errors)}`);
}

async function createField(collection, payload) {
    const { ok } = await api(`/fields/${collection}/${payload.field}`);
    if (ok) return; // ya existe
    await api(`/fields/${collection}`, { method: 'POST', body: JSON.stringify(payload) });
}

async function createRelation(payload) {
    await api('/relations', { method: 'POST', body: JSON.stringify(payload) });
}

// ── Permisos públicos (Directus v11 usa policies) ────────────────────────────

async function setPublicRead(collections) {
    const { data: policiesData } = await api('/policies');
    const pub = (policiesData.data || []).find(p => p.name === '$t:public_label' || p.icon === 'public');
    if (!pub) { console.log('  ✗ Policy pública no encontrada'); return; }

    for (const collection of collections) {
        const { data: check } = await api(
            `/permissions?filter[collection][_eq]=${collection}&filter[policy][_eq]=${pub.id}&filter[action][_eq]=read`
        );
        if (check.data?.length > 0) continue;
        await api('/permissions', {
            method: 'POST',
            body: JSON.stringify({ policy: pub.id, collection, action: 'read', fields: ['*'] }),
        });
        console.log(`  ✓ Lectura pública: ${collection}`);
    }
}

// ── Esperar a Directus ───────────────────────────────────────────────────────

async function waitForDirectus() {
    console.log('Esperando a Directus...');
    for (let i = 0; i < 30; i++) {
        try {
            const res = await fetch(`${CMS_URL}/server/health`);
            if (res.ok) { console.log('✓ Directus listo\n'); return; }
        } catch (_) {}
        await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error('Directus no responde. ¿Está arrancado? npx directus start');
}

// ── Colecciones ───────────────────────────────────────────────────────────────

async function createCollections() {
    console.log('Creando colecciones...');

    // MARCA — estilo (singleton)
    await createCollection({
        collection: 'estilo',
        meta: { icon: 'palette', note: 'Design system del sitio', singleton: true },
        schema: {},
        fields: [
            { field: 'id',              type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
            // Tipografía
            { field: 'font_titles',     type: 'string',  meta: { interface: 'input', width: 'half', note: 'Nombre exacto de Google Fonts (ej: Playfair Display)' } },
            { field: 'font_body',       type: 'string',  meta: { interface: 'input', width: 'half', note: 'Nombre exacto de Google Fonts (ej: Plus Jakarta Sans)' } },
            { field: 'font_size_body',  type: 'integer', meta: { interface: 'input', width: 'half', note: 'Tamaño base en px (ej: 16)' } },
            // Tamaños títulos — mobile vertical
            { field: 'titulo_hero_mv', type: 'integer', meta: { interface: 'input', width: 'quarter' } },
            { field: 'titulo_1_mv',    type: 'integer', meta: { interface: 'input', width: 'quarter' } },
            { field: 'titulo_2_mv',    type: 'integer', meta: { interface: 'input', width: 'quarter' } },
            { field: 'titulo_3_mv',    type: 'integer', meta: { interface: 'input', width: 'quarter' } },
            { field: 'titulo_4_mv',    type: 'integer', meta: { interface: 'input', width: 'quarter' } },
            // Tamaños títulos — desktop
            { field: 'titulo_hero_dk', type: 'integer', meta: { interface: 'input', width: 'quarter' } },
            { field: 'titulo_1_dk',    type: 'integer', meta: { interface: 'input', width: 'quarter' } },
            { field: 'titulo_2_dk',    type: 'integer', meta: { interface: 'input', width: 'quarter' } },
            { field: 'titulo_3_dk',    type: 'integer', meta: { interface: 'input', width: 'quarter' } },
            { field: 'titulo_4_dk',    type: 'integer', meta: { interface: 'input', width: 'quarter' } },
            // Colores
            { field: 'color_primary',        type: 'string', meta: { interface: 'select-color', width: 'half' } },
            { field: 'color_primary_hover',  type: 'string', meta: { interface: 'select-color', width: 'half' } },
            { field: 'color_title',          type: 'string', meta: { interface: 'select-color', width: 'half' } },
            { field: 'color_text',           type: 'string', meta: { interface: 'select-color', width: 'half' } },
            { field: 'color_bg_body',        type: 'string', meta: { interface: 'select-color', width: 'half' } },
            { field: 'color_bg_section_alt', type: 'string', meta: { interface: 'select-color', width: 'half' } },
            { field: 'color_footer_bg',      type: 'string', meta: { interface: 'select-color', width: 'half' } },
            // Botones
            { field: 'btn_border_radius', type: 'integer', meta: { interface: 'input', width: 'quarter', note: 'Radio en px (0 = cuadrado, 50 = pill)' } },
            { field: 'btn_font_size',     type: 'integer', meta: { interface: 'input', width: 'quarter' } },
            { field: 'btn_padding_x',     type: 'integer', meta: { interface: 'input', width: 'quarter' } },
            { field: 'btn_padding_y',     type: 'integer', meta: { interface: 'input', width: 'quarter' } },
            { field: 'btn_uppercase',     type: 'boolean', meta: { interface: 'boolean', width: 'half' } },
            { field: 'btn_border_width',  type: 'integer', meta: { interface: 'input', width: 'half' } },
            { field: 'btn_custom_colors', type: 'boolean', meta: { interface: 'boolean', width: 'half', note: 'Activar para personalizar colores de botones manualmente' } },
        ],
    });

    // MARCA — empresa (singleton)
    await createCollection({
        collection: 'empresa',
        meta: { icon: 'business', note: 'Datos de la empresa', singleton: true },
        schema: {},
        fields: [
            { field: 'id',          type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
            { field: 'nombre',      type: 'string',  meta: { interface: 'input', width: 'half', required: true } },
            { field: 'slogan',      type: 'string',  meta: { interface: 'input', width: 'half' } },
            { field: 'descripcion', type: 'text',    meta: { interface: 'input-multiline', width: 'full' } },
            { field: 'logotipo',    type: 'uuid',    meta: { interface: 'file-image', width: 'half' } },
            { field: 'favicon',     type: 'uuid',    meta: { interface: 'file-image', width: 'half' } },
            { field: 'email',       type: 'string',  meta: { interface: 'input', width: 'half' } },
            { field: 'telefono',    type: 'string',  meta: { interface: 'input', width: 'half' } },
            { field: 'direccion',   type: 'string',  meta: { interface: 'input', width: 'full' } },
            { field: 'instagram',   type: 'string',  meta: { interface: 'input', width: 'half' } },
            { field: 'facebook',    type: 'string',  meta: { interface: 'input', width: 'half' } },
            { field: 'linkedin',    type: 'string',  meta: { interface: 'input', width: 'half' } },
            { field: 'youtube',     type: 'string',  meta: { interface: 'input', width: 'half' } },
        ],
    });

    // Relaciones de archivos para empresa
    await createRelation({ collection: 'empresa', field: 'logotipo', related_collection: 'directus_files' });
    await createRelation({ collection: 'empresa', field: 'favicon',  related_collection: 'directus_files' });

    // SEO
    await createCollection({
        collection: 'seo',
        meta: { icon: 'search', note: 'SEO por página — una fila por URL' },
        schema: {},
        fields: [
            { field: 'id',               type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
            { field: 'slug',             type: 'string',  meta: { interface: 'input', width: 'half', required: true, note: 'URL exacta (ej: /, /servicios, /quienes-somos)' }, schema: { is_unique: true, is_nullable: false } },
            { field: 'meta_title',       type: 'string',  meta: { interface: 'input', width: 'full', note: 'Máx. 60 caracteres' } },
            { field: 'meta_description', type: 'text',    meta: { interface: 'input-multiline', width: 'full', note: 'Máx. 160 caracteres' } },
            { field: 'og_image',         type: 'uuid',    meta: { interface: 'file-image', width: 'half' } },
            { field: 'canonical_url',    type: 'string',  meta: { interface: 'input', width: 'half' } },
        ],
    });

    // BLOG — categories
    await createCollection({
        collection: 'categories',
        meta: { icon: 'category', note: 'Categorías del blog', sort_field: 'sort' },
        schema: {},
        fields: [
            { field: 'id',   type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
            { field: 'name', type: 'string',  meta: { interface: 'input', required: true, width: 'half' }, schema: { is_nullable: false } },
            { field: 'slug', type: 'string',  meta: { interface: 'input', width: 'half' }, schema: { is_unique: true, is_nullable: false } },
            { field: 'sort', type: 'integer', meta: { hidden: true, interface: 'input' } },
        ],
    });

    // BLOG — posts
    await createCollection({
        collection: 'posts',
        meta: { icon: 'article', note: 'Entradas del blog', sort_field: 'sort' },
        schema: {},
        fields: [
            { field: 'id',             type: 'integer',   meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
            { field: 'status',         type: 'string',    meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Publicado', value: 'published' }, { text: 'Borrador', value: 'draft' }] }, width: 'half', required: true }, schema: { default_value: 'draft', is_nullable: false } },
            { field: 'title',          type: 'string',    meta: { interface: 'input', required: true, width: 'full' }, schema: { is_nullable: false } },
            { field: 'slug',           type: 'string',    meta: { interface: 'input', width: 'half', note: 'Se genera desde el título' }, schema: { is_unique: true, is_nullable: false } },
            { field: 'excerpt',        type: 'text',      meta: { interface: 'input-multiline', width: 'full', note: 'Resumen para listados y SEO (máx. 160 caracteres)' } },
            { field: 'date_published', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
            { field: 'featured_image', type: 'uuid',      meta: { interface: 'file-image', width: 'full' } },
            { field: 'content',        type: 'text',      meta: { interface: 'input-rich-text-html', width: 'full' } },
            { field: 'sort',           type: 'integer',   meta: { hidden: true, interface: 'input' } },
        ],
    });

    await createRelation({ collection: 'posts', field: 'featured_image', related_collection: 'directus_files' });

    // BLOG — posts_categories (junction M2M)
    await createCollection({
        collection: 'posts_categories',
        meta: { hidden: true, icon: 'import_export' },
        schema: {},
        fields: [
            { field: 'id',            type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
            { field: 'posts_id',      type: 'integer', meta: { hidden: true } },
            { field: 'categories_id', type: 'integer', meta: { hidden: true } },
        ],
    });

    await createRelation({ collection: 'posts_categories', field: 'posts_id',      related_collection: 'posts',      meta: { one_field: 'categories', junction_field: 'categories_id' }, schema: { on_delete: 'SET NULL' } });
    await createRelation({ collection: 'posts_categories', field: 'categories_id', related_collection: 'categories', meta: { one_field: 'posts',       junction_field: 'posts_id'      }, schema: { on_delete: 'SET NULL' } });

    await api('/fields/posts', {
        method: 'POST',
        body: JSON.stringify({ field: 'categories', type: 'alias', meta: { interface: 'list-m2m', special: ['m2m'], options: { template: '{{categories_id.name}}' }, display: 'related-values', display_options: { template: '{{categories_id.name}}' } } }),
    });

    console.log('');
}

// ── Seed de datos de ejemplo ─────────────────────────────────────────────────

async function seedData() {
    // Verificar si ya hay datos
    const { data } = await api('/items/posts?limit=1');
    if (data.data?.length > 0) { console.log('✓ Datos ya existentes — omitiendo seed\n'); return; }

    console.log('Creando datos de ejemplo...');

    // Datos de empresa
    await api('/items/empresa', { method: 'POST', body: JSON.stringify({
        nombre: 'Nombre del cliente',
        slogan: 'El eslogan del cliente',
        email: 'hola@cliente.com',
        telefono: '+34 600 000 000',
    })});

    // Datos de estilo (valores por defecto)
    await api('/items/estilo', { method: 'POST', body: JSON.stringify({
        font_titles: 'Newsreader',
        font_body:   'Plus Jakarta Sans',
        font_size_body: 16,
        titulo_hero_mv: 42, titulo_hero_dk: 60,
        titulo_1_mv:    34, titulo_1_dk:    48,
        titulo_2_mv:    28, titulo_2_dk:    38,
        titulo_3_mv:    22, titulo_3_dk:    27,
        titulo_4_mv:    18, titulo_4_dk:    21,
        color_primary:       '#3B82F6',
        color_primary_hover: '#2563EB',
        color_title:         '#111827',
        color_text:          '#374151',
        color_bg_body:       '#FFFFFF',
        color_bg_section_alt:'#F9FAFB',
        color_footer_bg:     '#111827',
        btn_border_radius: 8,
        btn_font_size: 16,
        btn_padding_x: 28,
        btn_padding_y: 12,
        btn_uppercase: false,
        btn_border_width: 2,
    })});

    // SEO básico
    const pages = [
        { slug: '/',              meta_title: 'Nombre del cliente', meta_description: 'Descripción del cliente para SEO.' },
        { slug: '/servicios',     meta_title: 'Servicios — Nombre del cliente', meta_description: 'Nuestros servicios.' },
        { slug: '/quienes-somos', meta_title: 'Quiénes somos — Nombre del cliente', meta_description: 'Conoce al equipo.' },
        { slug: '/blog',          meta_title: 'Blog — Nombre del cliente', meta_description: 'Últimas noticias.' },
    ];
    for (const p of pages) {
        await api('/items/seo', { method: 'POST', body: JSON.stringify(p) });
    }

    // Categorías
    const cats = await Promise.all([
        api('/items/categories', { method: 'POST', body: JSON.stringify({ name: 'Noticias',   slug: 'noticias'  }) }),
        api('/items/categories', { method: 'POST', body: JSON.stringify({ name: 'Consejos',   slug: 'consejos'  }) }),
        api('/items/categories', { method: 'POST', body: JSON.stringify({ name: 'Novedades',  slug: 'novedades' }) }),
    ]);
    const [c1, c2, c3] = cats.map(c => c.data.data?.id);

    // Posts de ejemplo
    const posts = [
        { title: 'Lorem ipsum dolor sit amet consectetur adipiscing', slug: 'lorem-ipsum-dolor', status: 'published', date_published: new Date().toISOString(), excerpt: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames.', categories: [{ categories_id: c1 }], content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p><p>Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.</p>' },
        { title: 'Vestibulum tortor quam feugiat vitae ultricies', slug: 'vestibulum-tortor-quam', status: 'published', date_published: new Date(Date.now() - 86400000).toISOString(), excerpt: 'Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est.', categories: [{ categories_id: c2 }], content: '<p>Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.</p>' },
        { title: 'Pellentesque habitant morbi tristique senectus', slug: 'pellentesque-habitant', status: 'published', date_published: new Date(Date.now() - 172800000).toISOString(), excerpt: 'Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi.', categories: [{ categories_id: c3 }], content: '<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.</p>' },
    ];

    for (const post of posts) {
        await api('/items/posts', { method: 'POST', body: JSON.stringify(post) });
    }

    console.log('✓ Datos de ejemplo creados\n');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    try {
        await waitForDirectus();
        await createCollections();
        await setPublicRead(['estilo', 'empresa', 'seo', 'posts', 'categories', 'posts_categories', 'directus_files']);
        console.log('Configurando permisos...');
        await seedData();

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Setup completado');
        console.log('');
        console.log('  Admin:  http://localhost:8055/admin');
        console.log('  Login:  admin@piensaenweb.com');
        console.log('  Pass:   Admin.123');
        console.log('');
        console.log('  Web:    npx serve public (en otra terminal)');
        console.log('          → http://localhost:3000');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (err) {
        console.error('\n✗ Error en el setup:', err.message);
        process.exit(1);
    }
}

main();
