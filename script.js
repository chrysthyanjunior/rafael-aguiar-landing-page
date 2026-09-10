/* Componentes independentes: uma seção pode ser removida sem afetar as demais. */
document.addEventListener("DOMContentLoaded", () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 1000px)");
    const menuButton = document.querySelector(".menu-mobile");
    const nav = document.querySelector(".nav-links");

    if (menuButton && nav) {
        document.body.classList.add("menu-ready");
        const setMenu = (open, restoreFocus = false) => {
            nav.classList.toggle("active", open);
            document.body.classList.toggle("menu-open", open);
            menuButton.textContent = open ? "✕" : "☰";
            menuButton.setAttribute("aria-expanded", String(open));
            menuButton.setAttribute("aria-label", `${open ? "Fechar" : "Abrir"} menu de navegação`);
            if (restoreFocus) menuButton.focus();
        };
        menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
        nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
            setMenu(false);
            const target = document.querySelector(link.hash);
            if (target) {
                target.setAttribute("tabindex", "-1");
                target.focus({ preventScroll: true });
            }
        }));
        document.addEventListener("keydown", event => {
            if (!nav.classList.contains("active")) return;
            if (event.key === "Escape") setMenu(false, true);
            if (event.key === "Tab") {
                const links = [...nav.querySelectorAll("a")];
                const first = links[0];
                const last = links[links.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault(); menuButton.focus();
                } else if (!event.shiftKey && document.activeElement === menuButton) {
                    event.preventDefault(); first?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault(); menuButton.focus();
                } else if (event.shiftKey && document.activeElement === menuButton) {
                    event.preventDefault(); last?.focus();
                }
            }
        });
        document.addEventListener("click", event => {
            if (!event.target.closest(".navbar")) setMenu(false);
        });
        mobile.addEventListener("change", () => { if (!mobile.matches) setMenu(false); });
    }

    document.querySelectorAll(".carousel").forEach(carousel => {
        const track = carousel.querySelector(".carousel-track");
        const cards = [...carousel.querySelectorAll(".property-card")];
        const previous = carousel.querySelector(".carousel-prev");
        const next = carousel.querySelector(".carousel-next");
        const dots = carousel.parentElement.querySelector(".carousel-dots");
        const status = carousel.parentElement.querySelector(".carousel-status");
        if (!track || !cards.length || !previous || !next || !dots) return;
        carousel.classList.add("carousel-ready");
        let current = 0, max = 0, visible = 1;
        const step = () => cards[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).gap) || 0);
        const update = () => {
            previous.disabled = current === 0;
            next.disabled = current === max;
            [...dots.children].forEach((dot, index) => {
                dot.classList.toggle("active", index === current);
                dot.setAttribute("aria-current", index === current ? "true" : "false");
            });
            if (status) status.textContent = `Imóveis ${current + 1} a ${Math.min(cards.length, current + visible)} de ${cards.length}`;
        };
        const go = (index, instant = false) => {
            current = Math.max(0, Math.min(index, max));
            track.scrollTo({ left: step() * current, behavior: instant || reducedMotion.matches ? "instant" : "smooth" });
            update();
        };
        const configure = () => {
            const gap = parseFloat(getComputedStyle(track).gap) || 0;
            visible = Math.max(1, Math.round((track.clientWidth + gap) / step()));
            max = Math.max(0, cards.length - visible);
            if (dots.children.length !== max + 1) {
                dots.replaceChildren();
                for (let index = 0; index <= max; index++) {
                    const dot = document.createElement("button");
                    dot.type = "button";
                    dot.className = "dot";
                    dot.setAttribute("aria-label", `Mostrar imóveis a partir de ${index + 1}`);
                    dot.setAttribute("aria-controls", track.id);
                    dot.addEventListener("click", () => go(index));
                    dots.appendChild(dot);
                }
            }
            go(current, true);
        };
        previous.addEventListener("click", () => go(current - 1));
        next.addEventListener("click", () => go(current + 1));
        track.addEventListener("keydown", event => {
            if (event.target !== track) return;
            const destination = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: max }[event.key];
            if (destination !== undefined) { event.preventDefault(); go(destination); }
        });
        let scrollTimer, resizeTimer;
        track.addEventListener("scroll", () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                current = Math.max(0, Math.min(max, Math.round(track.scrollLeft / step())));
                update();
            }, 120);
        }, { passive: true });
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(configure, 150);
        });
        configure();
    });

    const video = document.querySelector(".hero-video");
    const videoButton = document.querySelector(".video-toggle");
    if (video && videoButton) {
        const smallScreen = window.matchMedia("(max-width: 700px)");
        let pausedByUser = false;
        const syncLabel = () => {
            videoButton.textContent = video.paused ? "Reproduzir vídeo" : "Pausar vídeo";
        };
        const syncVideo = () => {
            const staticHero = reducedMotion.matches || smallScreen.matches || navigator.connection?.saveData;
            videoButton.hidden = Boolean(staticHero);
            if (staticHero || document.hidden || pausedByUser) { video.pause(); return; }
            const source = video.querySelector("source[data-src]");
            if (source && !source.hasAttribute("src")) { source.src = source.dataset.src; video.load(); }
            video.play().catch(syncLabel);
        };
        videoButton.addEventListener("click", () => {
            pausedByUser = !video.paused;
            if (pausedByUser) video.pause(); else syncVideo();
        });
        video.addEventListener("play", syncLabel);
        video.addEventListener("pause", syncLabel);
        smallScreen.addEventListener("change", syncVideo);
        reducedMotion.addEventListener("change", syncVideo);
        document.addEventListener("visibilitychange", syncVideo);
        syncVideo();
    }

    const year = document.querySelector("#current-year");
    if (year) year.textContent = new Date().getFullYear();
    // Conteúdo permanece visível sem JavaScript, sem observer ou com movimento reduzido.
    if ("IntersectionObserver" in window && !reducedMotion.matches) {
        const observer = new IntersectionObserver(entries => entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        }), { threshold: 0.05 });
        document.querySelectorAll(".section-header, .sobre-imagem, .sobre-content").forEach(element => {
            element.classList.add("reveal");
            observer.observe(element);
        });
    }
});
