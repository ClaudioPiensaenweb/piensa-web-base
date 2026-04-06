/* =============================================
   DYNAMIC STYLES — carga marca desde Directus
   No editar — los valores vienen del CMS
   ============================================= */

(function () {

    // 1. Colección `estilo` → CSS variables + Google Fonts
    fetch(CMS_URL + '/items/estilo')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            var s = data.data;
            if (!s) return;

            // Google Fonts dinámicos
            var fonts = [];
            if (s.font_titles) fonts.push(s.font_titles.replace(/ /g, '+') + ':wght@700');
            if (s.font_body)   fonts.push(s.font_body.replace(/ /g, '+') + ':wght@400;500;700');
            if (fonts.length) {
                var link = document.createElement('link');
                link.rel  = 'stylesheet';
                link.href = 'https://fonts.googleapis.com/css2?family=' + fonts.join('&family=') + '&display=swap';
                document.head.appendChild(link);
            }

            // CSS variables
            var css = ':root {\n';

            // Tipografía
            css += '  --font-titles: "' + (s.font_titles || 'Newsreader') + '", serif;\n';
            css += '  --font-body:   "' + (s.font_body   || 'Plus Jakarta Sans') + '", sans-serif;\n';
            css += '  --font-size-body: ' + (s.font_size_body || 16) + 'px;\n';

            // Tamaños de título — móvil vertical (base)
            css += '  --titulo-hero: ' + (s.titulo_hero_mv || 42) + 'px;\n';
            css += '  --titulo-1:    ' + (s.titulo_1_mv   || 34) + 'px;\n';
            css += '  --titulo-2:    ' + (s.titulo_2_mv   || 28) + 'px;\n';
            css += '  --titulo-3:    ' + (s.titulo_3_mv   || 22) + 'px;\n';
            css += '  --titulo-4:    ' + (s.titulo_4_mv   || 18) + 'px;\n';

            // Colores
            css += '  --color-primary:       ' + (s.color_primary       || '#3B82F6') + ';\n';
            css += '  --color-primary-hover: ' + (s.color_primary_hover || '#2563EB') + ';\n';
            css += '  --color-title:         ' + (s.color_title         || '#111827') + ';\n';
            css += '  --color-text:          ' + (s.color_text          || '#374151') + ';\n';
            css += '  --color-bg-body:       ' + (s.color_bg_body       || '#FFFFFF') + ';\n';
            css += '  --color-bg-alt:        ' + (s.color_bg_section_alt|| '#F9FAFB') + ';\n';
            css += '  --color-footer-bg:     ' + (s.color_footer_bg     || '#111827') + ';\n';

            // Botones
            var primary      = s.color_primary       || '#3B82F6';
            var primaryHover = s.color_primary_hover || '#2563EB';
            var custom       = s.btn_custom_colors;

            css += '  --btn-radius:          ' + (s.btn_border_radius || 8)  + 'px;\n';
            css += '  --btn-font-size:       ' + (s.btn_font_size     || 16) + 'px;\n';
            css += '  --btn-padding:         ' + (s.btn_padding_y || 12) + 'px ' + (s.btn_padding_x || 28) + 'px;\n';
            css += '  --btn-uppercase:       ' + (s.btn_uppercase ? 'uppercase' : 'none') + ';\n';
            css += '  --btn-border-width:    ' + (s.btn_border_width || 2) + 'px;\n';
            css += '  --btn-filled-bg:       ' + (custom ? (s.btn_filled_bg       || primary)      : primary)      + ';\n';
            css += '  --btn-filled-text:     ' + (custom ? (s.btn_filled_text     || '#FFFFFF')     : '#FFFFFF')    + ';\n';
            css += '  --btn-filled-bg-hover: ' + (custom ? (s.btn_filled_bg_hover || primaryHover)  : primaryHover) + ';\n';
            css += '  --btn-outline-border:  ' + (custom ? (s.btn_outline_border  || primary)      : primary)      + ';\n';
            css += '  --btn-outline-text:    ' + (custom ? (s.btn_outline_text    || primary)      : primary)      + ';\n';
            css += '  --btn-outline-bg-hover:   ' + (custom ? (s.btn_outline_bg_hover   || primary)    : primary)    + ';\n';
            css += '  --btn-outline-text-hover: ' + (custom ? (s.btn_outline_text_hover || '#FFFFFF')  : '#FFFFFF')  + ';\n';
            css += '}\n';

            // Responsive
            css += '@media (min-width: 479px) { :root {\n';
            css += '  --titulo-hero: ' + (s.titulo_hero_mh || 46) + 'px;\n';
            css += '  --titulo-1:    ' + (s.titulo_1_mh   || 38) + 'px;\n';
            css += '  --titulo-2:    ' + (s.titulo_2_mh   || 30) + 'px;\n';
            css += '  --titulo-3:    ' + (s.titulo_3_mh   || 24) + 'px;\n';
            css += '  --titulo-4:    ' + (s.titulo_4_mh   || 19) + 'px;\n';
            css += '}}\n';

            css += '@media (min-width: 768px) { :root {\n';
            css += '  --titulo-hero: ' + (s.titulo_hero_tb || 50) + 'px;\n';
            css += '  --titulo-1:    ' + (s.titulo_1_tb   || 40) + 'px;\n';
            css += '  --titulo-2:    ' + (s.titulo_2_tb   || 34) + 'px;\n';
            css += '  --titulo-3:    ' + (s.titulo_3_tb   || 24) + 'px;\n';
            css += '  --titulo-4:    ' + (s.titulo_4_tb   || 20) + 'px;\n';
            css += '}}\n';

            css += '@media (min-width: 992px) { :root {\n';
            css += '  --titulo-hero: ' + (s.titulo_hero_dk || 60) + 'px;\n';
            css += '  --titulo-1:    ' + (s.titulo_1_dk   || 48) + 'px;\n';
            css += '  --titulo-2:    ' + (s.titulo_2_dk   || 38) + 'px;\n';
            css += '  --titulo-3:    ' + (s.titulo_3_dk   || 27) + 'px;\n';
            css += '  --titulo-4:    ' + (s.titulo_4_dk   || 21) + 'px;\n';
            css += '}}\n';

            // Aplicar clases base
            css += 'body { font-family: var(--font-body); color: var(--color-text); background-color: var(--color-bg-body); font-size: var(--font-size-body); }\n';
            css += '.titulo-hero { font-family: var(--font-titles); color: var(--color-title); font-size: var(--titulo-hero); }\n';
            css += '.titulo-1    { font-family: var(--font-titles); color: var(--color-title); font-size: var(--titulo-1); }\n';
            css += '.titulo-2    { font-family: var(--font-titles); color: var(--color-title); font-size: var(--titulo-2); }\n';
            css += '.titulo-3    { font-family: var(--font-titles); color: var(--color-title); font-size: var(--titulo-3); }\n';
            css += '.titulo-4    { font-family: var(--font-titles); color: var(--color-title); font-size: var(--titulo-4); }\n';
            css += '.btn { border-radius: var(--btn-radius); font-size: var(--btn-font-size); padding: var(--btn-padding); text-transform: var(--btn-uppercase); font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all .2s; text-decoration: none; }\n';
            css += '.btn-filled  { background-color: var(--btn-filled-bg); color: var(--btn-filled-text); border: var(--btn-border-width) solid var(--btn-filled-bg); }\n';
            css += '.btn-filled:hover  { background-color: var(--btn-filled-bg-hover); border-color: var(--btn-filled-bg-hover); }\n';
            css += '.btn-outline { border: var(--btn-border-width) solid var(--btn-outline-border); color: var(--btn-outline-text); background: transparent; }\n';
            css += '.btn-outline:hover { background-color: var(--btn-outline-bg-hover); color: var(--btn-outline-text-hover); border-color: var(--btn-outline-bg-hover); }\n';

            var style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        })
        .catch(function () { /* CMS no disponible — usa valores por defecto del CSS */ });


    // 2. Colección `empresa` → logo y favicon
    fetch(CMS_URL + '/items/empresa?fields=favicon,logotipo')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            var e = data.data;
            if (!e) return;
            if (e.favicon) {
                var link = document.querySelector('link[rel="icon"]');
                if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
                link.href = CMS_URL + '/assets/' + e.favicon + '?width=32&height=32';
            }
            if (e.logotipo) {
                document.querySelectorAll('.logo-img').forEach(function (img) {
                    img.src = CMS_URL + '/assets/' + e.logotipo;
                });
            }
        })
        .catch(function () {});


    // 3. Colección `seo` → meta title y description por página
    var slug = window.location.pathname.replace(/\/$/, '') || '/';
    fetch(CMS_URL + '/items/seo?filter[slug][_eq]=' + encodeURIComponent(slug) + '&limit=1')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            var seo = data.data && data.data[0];
            if (!seo) return;
            if (seo.meta_title) document.title = seo.meta_title;
            var meta = document.querySelector('meta[name="description"]');
            if (meta && seo.meta_description) meta.setAttribute('content', seo.meta_description);
        })
        .catch(function () {});

})();
