/* =============================================
   TEMPLATES — header y footer compartidos
   Editar navegación y enlaces aquí
   ============================================= */

var i18n = {
    es: {
        home:       'Inicio',
        services:   'Servicios',
        about:      'Quiénes somos',
        blog:       'Blog',
        contact:    'Contacto',
        legal:      'Aviso legal',
        privacy:    'Política de privacidad',
        cookies:    'Política de cookies',
        madeBy:     'Desarrollo web por Piensaenweb',
        homeHref:       '/',
        servicesHref:   '/servicios',
        aboutHref:      '/quienes-somos',
        blogHref:       '/blog',
        legalHref:      '/aviso-legal',
        privacyHref:    '/politica-de-privacidad',
        cookiesHref:    '/politica-de-cookies',
    }
    // Añadir 'en' aquí si el proyecto es bilingüe
};

var t = i18n[SITE_LANG] || i18n['es'];

/* ── Header ────────────────────────────────── */

function renderHeader() {
    var header = document.getElementById('main-header');
    if (!header) return;

    var navLink = 'nav-link';
    var mobLink = 'mob-link';

    header.innerHTML =
        '<div class="header-inner">' +
            '<a href="' + t.homeHref + '" class="logo-link">' +
                '<img src="/marca/logo.png" alt="Logo" class="logo-img" />' +
            '</a>' +

            '<nav class="main-nav">' +
                '<a href="' + t.homeHref     + '" class="' + navLink + '">' + t.home     + '</a>' +
                '<a href="' + t.servicesHref + '" class="' + navLink + '">' + t.services + '</a>' +
                '<a href="' + t.aboutHref    + '" class="' + navLink + '">' + t.about    + '</a>' +
                '<a href="' + t.blogHref     + '" class="' + navLink + '">' + t.blog     + '</a>' +
            '</nav>' +

            '<div class="header-actions">' +
                '<a href="#footer-section" class="btn btn-filled scroll-to-footer">' + t.contact + '</a>' +
                '<button id="mobile-toggle" class="mobile-toggle" aria-label="Menú">' +
                    '<i data-lucide="menu" class="icon-open"></i>' +
                    '<i data-lucide="x"    class="icon-close hidden"></i>' +
                '</button>' +
            '</div>' +
        '</div>' +

        '<div id="mobile-menu" class="mobile-menu">' +
            '<a href="' + t.homeHref     + '" class="' + mobLink + '">' + t.home     + '</a>' +
            '<a href="' + t.servicesHref + '" class="' + mobLink + '">' + t.services + '</a>' +
            '<a href="' + t.aboutHref    + '" class="' + mobLink + '">' + t.about    + '</a>' +
            '<a href="' + t.blogHref     + '" class="' + mobLink + '">' + t.blog     + '</a>' +
            '<a href="#footer-section" class="' + mobLink + ' scroll-to-footer">' + t.contact + '</a>' +
        '</div>';

    // Lucide icons
    if (window.lucide) lucide.createIcons();

    // Toggle móvil
    var toggle = document.getElementById('mobile-toggle');
    var menu   = document.getElementById('mobile-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            var isOpen = menu.classList.contains('open');
            menu.classList.toggle('open', !isOpen);
            toggle.querySelector('.icon-open').classList.toggle('hidden', !isOpen);
            toggle.querySelector('.icon-close').classList.toggle('hidden', isOpen);
        });
        // Cerrar al hacer clic en un link del menú
        menu.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                menu.classList.remove('open');
                toggle.querySelector('.icon-open').classList.remove('hidden');
                toggle.querySelector('.icon-close').classList.add('hidden');
            });
        });
    }

    // Header scrolled
    window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}


/* ── Footer ────────────────────────────────── */

function renderFooter() {
    var footer = document.getElementById('footer-section');
    if (!footer) return;

    // Cargar datos de empresa para el footer
    fetch(CMS_URL + '/items/empresa?fields=nombre,email,telefono,instagram,facebook,linkedin')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            var e = data.data || {};

            footer.innerHTML =
                '<div class="footer-inner">' +
                    '<div class="footer-brand">' +
                        '<img src="/marca/logo.png" alt="Logo" class="logo-img footer-logo" />' +
                        (e.email    ? '<a href="mailto:' + e.email + '" class="footer-contact">' + e.email + '</a>' : '') +
                        (e.telefono ? '<a href="tel:'    + e.telefono.replace(/\s/g,'') + '" class="footer-contact">' + e.telefono + '</a>' : '') +
                        '<div class="footer-social">' +
                            (e.instagram ? '<a href="' + e.instagram + '" target="_blank" rel="noopener" aria-label="Instagram"><i data-lucide="instagram"></i></a>' : '') +
                            (e.facebook  ? '<a href="' + e.facebook  + '" target="_blank" rel="noopener" aria-label="Facebook"><i data-lucide="facebook"></i></a>'  : '') +
                            (e.linkedin  ? '<a href="' + e.linkedin  + '" target="_blank" rel="noopener" aria-label="LinkedIn"><i data-lucide="linkedin"></i></a>'  : '') +
                        '</div>' +
                    '</div>' +

                    '<div class="footer-links">' +
                        '<a href="' + t.legalHref   + '">' + t.legal   + '</a>' +
                        '<a href="' + t.privacyHref + '">' + t.privacy + '</a>' +
                        '<a href="' + t.cookiesHref + '">' + t.cookies + '</a>' +
                    '</div>' +

                    '<div class="footer-bottom">' +
                        '<span>' + t.madeBy + '</span>' +
                    '</div>' +
                '</div>';

            if (window.lucide) lucide.createIcons();
        })
        .catch(function () {
            // Fallback sin datos de empresa
            footer.innerHTML = '<div class="footer-inner"><div class="footer-links">' +
                '<a href="' + t.legalHref   + '">' + t.legal   + '</a>' +
                '<a href="' + t.privacyHref + '">' + t.privacy + '</a>' +
                '<a href="' + t.cookiesHref + '">' + t.cookies + '</a>' +
                '</div></div>';
        });
}
