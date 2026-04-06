/* =============================================
   SCRIPT — animaciones y comportamiento global
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

    // ── Lenis Smooth Scroll ──────────────────
    if (window.Lenis) {
        var lenis = new Lenis({
            duration: 1.2,
            easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        });

        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);

        if (window.gsap && window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0, 0);
        }
    }

    // ── GSAP — fade-up al hacer scroll ──────
    if (window.gsap && window.ScrollTrigger) {
        gsap.utils.toArray('.fade-up').forEach(function (el) {
            gsap.fromTo(el,
                { y: 40, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' }
                }
            );
        });

        gsap.utils.toArray('.fade-in').forEach(function (el) {
            gsap.fromTo(el,
                { y: 20, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
                    scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
                }
            );
        });
    }

    // ── Scroll to footer (botón Contacto) ───
    document.querySelectorAll('.scroll-to-footer').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            var footer = document.getElementById('footer-section');
            if (footer) {
                e.preventDefault();
                if (window.lenis) {
                    lenis.scrollTo(footer);
                } else {
                    footer.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

});
