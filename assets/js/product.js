document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;

    /*
     * Si el usuario prefiere menos movimiento,
     * mostramos todo sin animaciones.
     */
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
        return;
    }

    root.classList.add("reveal-ready");

    /*
     * Elementos principales del Hero.
     */
    const heroContent = document.querySelector(
        ".product-hero__content"
    );

    const heroVisual = document.querySelector(
        ".product-hero__visual"
    );

    if (heroContent) {
        heroContent.classList.add(
            "neo-reveal",
            "neo-reveal--left"
        );

        heroContent.style.setProperty(
            "--reveal-delay",
            "100ms"
        );
    }

    if (heroVisual) {
        heroVisual.classList.add(
            "neo-reveal",
            "neo-reveal--right"
        );

        heroVisual.style.setProperty(
            "--reveal-delay",
            "220ms"
        );
    }

    /*
     * Encabezados y contenidos generales.
     */
    const individualSelectors = [
        ".product-section__grid > div",
        ".section-heading",
        ".product-cta__inner > div",
        ".product-cta__inner > a"
    ];

    individualSelectors.forEach((selector) => {
        document
            .querySelectorAll(selector)
            .forEach((element, index) => {
                element.classList.add("neo-reveal");

                element.style.setProperty(
                    "--reveal-delay",
                    `${Math.min(index * 90, 270)}ms`
                );
            });
    });

    /*
     * Grupos de tarjetas con entrada escalonada.
     */
    const staggerGroups = [
        ".product-process",
        ".product-benefits",
        ".product-use-cases"
    ];

    staggerGroups.forEach((groupSelector) => {
        const group = document.querySelector(groupSelector);

        if (!group) {
            return;
        }

        const children = Array.from(group.children);

        children.forEach((child, index) => {
            child.classList.add(
                "neo-reveal",
                "neo-reveal--scale"
            );

            child.style.setProperty(
                "--reveal-delay",
                `${index * 110}ms`
            );
        });
    });

    /*
     * Todos los elementos preparados para animación.
     */
    const revealElements = document.querySelectorAll(
        ".neo-reveal"
    );

    if (!revealElements.length) {
        return;
    }

    /*
     * El Hero aparece inmediatamente.
     */
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (heroContent) {
                heroContent.classList.add("is-visible");
            }

            if (heroVisual) {
                heroVisual.classList.add("is-visible");
            }
        });
    });

    /*
     * El resto aparece conforme entra al viewport.
     */
    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");

                /*
                 * Cada elemento se anima una sola vez.
                 */
                currentObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.16,
            rootMargin: "0px 0px -60px 0px"
        }
    );

    revealElements.forEach((element) => {
        /*
         * El Hero ya se controla directamente.
         */
        if (
            element === heroContent ||
            element === heroVisual
        ) {
            return;
        }

        observer.observe(element);
    });
});