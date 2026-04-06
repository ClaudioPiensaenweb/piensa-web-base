/* =============================================
   CONFIG — editar por proyecto
   ============================================= */

// URL del CMS Directus
// Local:      'http://localhost:8055'
// Producción: 'https://cms.tudominio.com'
var CMS_URL = 'http://localhost:8055';

// Idiomas activos — añadir 'en' para bilingüe
var IDIOMAS = ['es'];

// Detectar idioma según pathname
var SITE_LANG = (IDIOMAS.includes('en') && window.location.pathname.startsWith('/en')) ? 'en' : 'es';
var LANG_PREFIX = SITE_LANG === 'en' ? '/en' : '';
