// PM2 ecosystem — Directus en producción
// Uso: pm2 start ecosystem.config.cjs --env production
//
// IMPORTANTE: script apunta al binario real, nunca a npx
// Requiere: npm install (sin --production para que exista .bin/directus)

module.exports = {
  apps: [
    {
      name: 'cms-piensa',          // cambiar por nombre del proyecto
      script: './node_modules/.bin/directus',
      args: 'start',
      interpreter: 'node',
      cwd: '/var/www/vhosts/dominio.com/cms',   // ajustar ruta real
      env_production: {
        NODE_ENV: 'production',
        PORT: 8055,
      },
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/err.log',
      out_file:   './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      // Reinicio automático si el proceso cae
      autorestart: true,
      restart_delay: 3000,
    },
  ],
};
