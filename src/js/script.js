document.addEventListener("DOMContentLoaded", () => {
  // MENU FLOTTANT + BOUTONS FIXES
  const fixedMail = document.querySelector(".fixed-btn .fixed-mail");
  const fixedHome = document.querySelector(".fixed-btn .fixed-home");
  const floatingNav = document.querySelector(".floating-nav");
  const hero = document.querySelector("#hero");

  // Seuils d’apparition / disparition
  function getThreshold() {
    if (!hero) return 300; // fallback sécurité
    return hero.getBoundingClientRect().bottom + window.pageYOffset;
  }

  function getTop(el) {
    return el.getBoundingClientRect().top + window.pageYOffset;
  }

  function toggleFixedButtons() {
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const viewportBottom = scrollY + windowHeight;
    const scrollThreshold = getThreshold();

    const contact = document.querySelector("#contact");
    const footer = document.querySelector("#footer");

    // “on est au contact” dès que le bas du viewport atteint le haut de la section contact
    const isAtContact = contact ? viewportBottom >= getTop(contact) : false;
    // “on est en bas” dès que le bas du viewport atteint le footer
    const isAtBottom = footer ? viewportBottom >= getTop(footer) : false;

    const shouldShow = scrollY > scrollThreshold && !isAtBottom;
    const shouldShowMail = scrollY > scrollThreshold && !isAtContact;
    // const shouldShowHome = scrollY > scrollThreshold;

    fixedMail.classList.toggle("fixed-hidden", !shouldShowMail);
    fixedHome.classList.toggle("fixed-hidden", !shouldShow);
    floatingNav.classList.toggle("fixed-hidden", !shouldShow);
  }

  window.addEventListener("scroll", toggleFixedButtons);
  window.addEventListener("resize", toggleFixedButtons);

  // TEST PARALLAX SECONDAIRE

  // CHIFFRES - COMPTEUR

  const counters = document.querySelectorAll(".number");

  const animateCounter = (el) => {
    const target = +el.dataset.value;
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1200;
    const start = performance.now();

    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = `${prefix}${value}${suffix}`;

      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = `${prefix}${target}${suffix}`;
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 },
  );

  counters.forEach((counter) => observer.observe(counter));

  // ===== TEMOIGNAGES - CAROUSEL (auto-scroll + interaction directe sur cartes) =====
  // ===== CAROUSEL SWIPER =====

  const el = document.querySelector(
    "#testimonials .testimonials-carousel.swiper",
  );
  if (!el || !window.Swiper) return;

  const wrapper = el.querySelector(".swiper-wrapper");
  if (!wrapper) return;

  // Dupliquer pour assurer l’infini (important)
  const base = Array.from(wrapper.children);
  const MIN = 28; // plus c’est grand, plus c’est smooth
  if (base.length && wrapper.children.length < MIN) {
    let i = 0;
    while (wrapper.children.length < MIN) {
      wrapper.appendChild(base[i % base.length].cloneNode(true));
      i++;
    }
  }

  if (el.swiper) el.swiper.destroy(true, true);

  const swiper = new Swiper(el, {
    loop: true,
    slidesPerView: "auto",
    spaceBetween: 24,
    freeMode: { enabled: true, momentum: false, sticky: false },
    watchSlidesProgress: true,
    grabCursor: true,
  });

  // --- Ticker continu ---
  let rafId = null;
  let paused = false;

  // px par frame (à 60fps). Ajuste pour vitesse.
  const SPEED_PX_PER_FRAME = 0.15;

  const tick = () => {
    if (!paused) {
      // translate diminue => ça avance vers la gauche
      const next = swiper.translate - SPEED_PX_PER_FRAME;

      swiper.setTranslate(next);
      swiper.updateProgress();
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();

      // Important : maintient le loop propre
      if (swiper.loopFix) swiper.loopFix();
    }
    rafId = requestAnimationFrame(tick);
  };

  const stop = () => (paused = true);
  const start = () => (paused = false);

  // Pause sur hover + interaction tactile
  el.addEventListener("mouseenter", stop);
  el.addEventListener("mouseleave", start);
  swiper.on("touchStart", stop);
  swiper.on("touchEnd", start);

  document.addEventListener("visibilitychange", () => {
    paused = document.hidden ? true : false;
  });

  // Démarrage après layout
  requestAnimationFrame(() => {
    swiper.update();
    tick();
  });

  window.__swiper = swiper;

  // ========== FAQ (clic partout + anim) ==========

  const items = document.querySelectorAll("#faq details.faq-item");
  const DURATION = 260;
  const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getContent = (details) => details.querySelector(".faq-content");
  const getInner = (details) => details.querySelector(".faq-content > *"); // p

  const cancelAnims = (el) => {
    if (!el) return;
    el.getAnimations?.().forEach((a) => a.cancel());
  };

  function closeOthers(current) {
    items.forEach((d) => {
      if (d !== current && d.open) {
        animateClose(d);
      }
    });
  }

  function animateOpen(details) {
    const content = getContent(details);
    const inner = getInner(details);
    if (!content || !inner) return;

    cancelAnims(content);

    // Ouvrir pour que les dimensions existent
    details.open = true;

    // Partir de 0
    content.style.overflow = "hidden";
    content.style.height = "0px";
    content.style.opacity = "0";

    const target = inner.scrollHeight; // hauteur réelle du <p>

    if (prefersReduced) {
      content.style.height = "auto";
      content.style.opacity = "1";
      return;
    }

    const anim = content.animate(
      [
        { height: "0px", opacity: 0 },
        { height: `${target}px`, opacity: 1 },
      ],
      { duration: DURATION, easing: EASING, fill: "forwards" },
    );

    anim.onfinish = () => {
      content.style.height = "auto"; // laisse vivre si le texte wrap différemment
      content.style.opacity = "1";
    };
  }

  function animateClose(details) {
    const content = getContent(details);
    const inner = getInner(details);
    if (!content || !inner) return;

    cancelAnims(content);

    // Figer hauteur actuelle (si auto)
    const start = inner.getBoundingClientRect().height;
    content.style.overflow = "hidden";
    content.style.height = `${start}px`;
    content.style.opacity = "1";

    if (prefersReduced) {
      details.open = false;
      content.style.height = "0px";
      content.style.opacity = "0";
      return;
    }

    const anim = content.animate(
      [
        { height: `${start}px`, opacity: 1 },
        { height: "0px", opacity: 0 },
      ],
      { duration: DURATION, easing: EASING, fill: "forwards" },
    );

    anim.onfinish = () => {
      details.open = false;
      content.style.height = "0px";
      content.style.opacity = "0";
    };
  }

  function toggle(details) {
    if (details.open) {
      animateClose(details);
    } else {
      closeOthers(details); // 👈 NOUVEAU
      animateOpen(details);
    }
  }

  items.forEach((details) => {
    const summary = details.querySelector("summary");
    if (!summary) return;

    // Remplace le toggle natif par notre anim
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      toggle(details);
    });

    // Clic n’importe où dans la card
    details.addEventListener("click", (e) => {
      if (e.target.closest("summary")) return;
      if (e.target.closest("a, button, input, textarea, select, label")) return;
      toggle(details);
    });

    // Focus clavier sur toute la card
    if (!details.hasAttribute("tabindex"))
      details.setAttribute("tabindex", "0");
    details.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (
        e.target.closest("summary, a, button, input, textarea, select, label")
      )
        return;
      e.preventDefault();
      toggle(details);
    });
  });

  // BLOQUER CLIC DROIT
  // document.addEventListener("contextmenu", (e) => e.preventDefault());

  // Empêcher CTRL+C, CTRL+U, F12
  // document.addEventListener("keydown", function (e) {
  //   if (e.ctrlKey && ["u", "U", "c", "C", "s", "S"].includes(e.key)) {
  //     e.preventDefault();
  //   }
  // });
});
