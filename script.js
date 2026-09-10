document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. MENU MOBILE
    ===================================================== */

    const menuButton = document.querySelector(".menu-mobile");
    const navLinks = document.querySelector(".nav-links");
    const navItems = document.querySelectorAll(".nav-links a");

    function openMenu() {

        navLinks.classList.add("active");
        document.body.classList.add("menu-open");

        menuButton.textContent = "✕";
        menuButton.setAttribute("aria-expanded", "true");
    }


    function closeMenu() {

        navLinks.classList.remove("active");
        document.body.classList.remove("menu-open");

        menuButton.textContent = "☰";
        menuButton.setAttribute("aria-expanded", "false");
    }


    function toggleMenu() {

        const menuIsOpen =
            navLinks.classList.contains("active");

        if (menuIsOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }


    menuButton.addEventListener("click", toggleMenu);


    /* Fecha o menu quando um link é clicado */

    navItems.forEach((link) => {

        link.addEventListener("click", () => {

            if (window.innerWidth <= 1000) {
                closeMenu();
            }

        });

    });


    /* Fecha pressionando ESC */

    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            navLinks.classList.contains("active")
        ) {
            closeMenu();
        }

    });


    /* Corrige o menu caso a tela seja redimensionada */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 1000) {
            closeMenu();
        }

    });



    /* =====================================================
       2. CARROSSEL DE IMÓVEIS
    ===================================================== */

    const carousels = document.querySelectorAll(".carousel");

    carousels.forEach((carousel) => {

        const track =
            carousel.querySelector(".carousel-track");

        const cards =
            Array.from(
                carousel.querySelectorAll(".property-card")
            );

        const previousButton =
            carousel.querySelector(".carousel-prev");

        const nextButton =
            carousel.querySelector(".carousel-next");

        const dotsContainer =
            carousel.parentElement.querySelector(".carousel-dots");


        let currentIndex = 0;

        let maxIndex = 0;


        /* ---------------------------------------------
           Descobre o espaço entre os cards
        --------------------------------------------- */

        function getGap() {

            const style =
                window.getComputedStyle(track);

            return parseFloat(style.gap) || 0;
        }


        /* ---------------------------------------------
           Descobre quanto precisamos mover
        --------------------------------------------- */

        function getCardStep() {

            if (!cards.length) {
                return 0;
            }

            return (
                cards[0].getBoundingClientRect().width
                +
                getGap()
            );
        }


        /* ---------------------------------------------
           Descobre quantos cards estão aparecendo
        --------------------------------------------- */

        function getVisibleCards() {

            const step = getCardStep();

            if (step === 0) {
                return 1;
            }

            const visible =
                Math.round(
                    (track.clientWidth + getGap())
                    /
                    step
                );

            return Math.max(1, visible);
        }


        /* ---------------------------------------------
           Atualiza os botões
        --------------------------------------------- */

        function updateButtons() {

            previousButton.disabled =
                currentIndex === 0;

            nextButton.disabled =
                currentIndex === maxIndex;
        }


        /* ---------------------------------------------
           Atualiza qual indicador está ativo
        --------------------------------------------- */

        function updateDots() {

            const dots =
                dotsContainer.querySelectorAll(".dot");

            dots.forEach((dot, index) => {

                dot.classList.toggle(
                    "active",
                    index === currentIndex
                );

            });

        }


        /* ---------------------------------------------
           Cria os indicadores dinamicamente
        --------------------------------------------- */

        function createDots() {

            dotsContainer.innerHTML = "";

            for (
                let index = 0;
                index <= maxIndex;
                index++
            ) {

                const dot =
                    document.createElement("button");

                dot.classList.add("dot");

                dot.setAttribute(
                    "aria-label",
                    `Ir para posição ${index + 1}`
                );


                if (index === currentIndex) {
                    dot.classList.add("active");
                }


                dot.addEventListener("click", () => {

                    goToSlide(index);

                });


                dotsContainer.appendChild(dot);
            }

        }


        /* ---------------------------------------------
           Move o carrossel
        --------------------------------------------- */

        function goToSlide(index) {

            currentIndex =
                Math.max(
                    0,
                    Math.min(index, maxIndex)
                );


            const movement =
                getCardStep() * currentIndex;


            track.scrollTo({

                left: movement,

                behavior: "smooth"

            });


            updateDots();
            updateButtons();
        }


        /* ---------------------------------------------
           Botão próximo
        --------------------------------------------- */

        nextButton.addEventListener("click", () => {

            goToSlide(currentIndex + 1);

        });


        /* ---------------------------------------------
           Botão anterior
        --------------------------------------------- */

        previousButton.addEventListener("click", () => {

            goToSlide(currentIndex - 1);

        });


        /* ---------------------------------------------
           Detecta arraste manual do usuário
        --------------------------------------------- */

        let scrollTimeout;


        track.addEventListener("scroll", () => {

            clearTimeout(scrollTimeout);


            scrollTimeout = setTimeout(() => {

                const step = getCardStep();

                if (step === 0) {
                    return;
                }


                const index =
                    Math.round(
                        track.scrollLeft / step
                    );


                currentIndex =
                    Math.max(
                        0,
                        Math.min(index, maxIndex)
                    );


                updateDots();
                updateButtons();

            }, 100);

        });


        /* ---------------------------------------------
           Configuração inicial do carrossel
        --------------------------------------------- */

        function configureCarousel() {

            const visibleCards =
                getVisibleCards();


            maxIndex =
                Math.max(
                    0,
                    cards.length - visibleCards
                );


            currentIndex =
                Math.min(
                    currentIndex,
                    maxIndex
                );


            createDots();

            goToSlide(currentIndex);
        }


        configureCarousel();


        /* Reconfigura quando a tela muda */

        let resizeTimeout;


        window.addEventListener("resize", () => {

            clearTimeout(resizeTimeout);


            resizeTimeout = setTimeout(() => {

                configureCarousel();

            }, 200);

        });

    });



    /* =====================================================
       3. ANO AUTOMÁTICO NO FOOTER
    ===================================================== */

    const yearElement =
        document.querySelector("#current-year");


    if (yearElement) {

        yearElement.textContent =
            new Date().getFullYear();

    }



    /* =====================================================
       4. ANIMAÇÕES QUANDO O USUÁRIO ROLA A PÁGINA
    ===================================================== */

    const animatedElements =
        document.querySelectorAll(`
            .autoridade .container,
            .section-header,
            .carousel,
            .sobre-imagem,
            .sobre-content,
            .diferenciais-grid,
            .manifesto .container,
            .cta .container,
            .social-links,
            .footer-container
        `);


    animatedElements.forEach((element) => {

        element.classList.add("reveal");

    });


    const observer =
        new IntersectionObserver(

            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "is-visible"
                        );


                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },

            {
                threshold: 0.15
            }

        );


    animatedElements.forEach((element) => {

        observer.observe(element);

    });

});