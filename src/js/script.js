document.addEventListener("DOMContentLoaded", () => {
  // ===== HERO : EFFET CLAVIER TYPING =====
  const text = "Robin Borreil.";
  const target = document.getElementById("typed-name");

  let index = 0;
  const speed = 100; // ms entre chaque lettre

  function typeWriter() {
    if (index < text.length) {
      target.textContent += text.charAt(index);
      index++;
      setTimeout(typeWriter, speed);
    }
  }

  typeWriter();

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
  // Wrapped in IIFE so early returns don’t kill accordion/carousel init below
  (() => {
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
    const SPEED_PX_PER_FRAME = 0.20;

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
  })();

  // ========== ACCORDIONS (FAQ + Accordion Cards) ==========

  const DURATION = 260;
  const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cancelAnims = (el) => {
    if (!el) return;
    el.getAnimations?.().forEach((a) => a.cancel());
  };

  function getContentEl(details) {
    return details.querySelector(".faq-content") || details.querySelector(".accordion-content");
  }

  function measureContentHeight(content) {
    // Temporarily let content size naturally so we get an accurate measurement
    const prevHeight = content.style.height;
    const prevOverflow = content.style.overflow;
    content.style.height = "auto";
    content.style.overflow = "hidden";
    const h = content.scrollHeight;
    content.style.height = prevHeight;
    content.style.overflow = prevOverflow;
    return h;
  }

  function animateOpen(details) {
    const content = getContentEl(details);
    if (!content) return;
    if (!content.firstElementChild) return;

    cancelAnims(content);
    details.open = true;

    // Start collapsed
    content.style.overflow = "hidden";
    content.style.height = "0px";
    content.style.opacity = "0";

    const target = measureContentHeight(content);

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
      content.style.height = "auto";
      content.style.opacity = "1";
    };
  }

  function animateClose(details) {
    const content = getContentEl(details);
    if (!content) return;

    cancelAnims(content);

    // Freeze current height before animating
    const start = content.getBoundingClientRect().height;
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

  // FAQ items: close others within FAQ
  const faqItems = document.querySelectorAll("#faq details.faq-item");
  function closeFaqOthers(current) {
    faqItems.forEach((d) => {
      if (d !== current && d.open) animateClose(d);
    });
  }

  function toggleFaq(details) {
    if (details.open) {
      animateClose(details);
    } else {
      closeFaqOthers(details);
      animateOpen(details);
    }
  }

  faqItems.forEach((details) => {
    const summary = details.querySelector("summary");
    if (!summary) return;

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      toggleFaq(details);
    });
    details.addEventListener("click", (e) => {
      if (e.target.closest("summary")) return;
      if (e.target.closest("a, button, input, textarea, select, label")) return;
      toggleFaq(details);
    });
    if (!details.hasAttribute("tabindex")) details.setAttribute("tabindex", "0");
    details.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (e.target.closest("summary, a, button, input, textarea, select, label")) return;
      e.preventDefault();
      toggleFaq(details);
    });
  });

  // Accordion cards: independent (no close-others)
  const accordionCards = document.querySelectorAll("details.accordion-card");

  function toggleAccordion(details) {
    if (details.open) {
      animateClose(details);
    } else {
      animateOpen(details);
    }
  }

  accordionCards.forEach((details) => {
    const summary = details.querySelector("summary");
    if (!summary) return;

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      toggleAccordion(details);
    });
    details.addEventListener("click", (e) => {
      if (e.target.closest("summary")) return;
      if (e.target.closest("a, button, input, textarea, select, label")) return;
      toggleAccordion(details);
    });
    if (!details.hasAttribute("tabindex")) details.setAttribute("tabindex", "0");
    details.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (e.target.closest("summary, a, button, input, textarea, select, label")) return;
      e.preventDefault();
      toggleAccordion(details);
    });

    // If already open (e.g., featured tarif), ensure content is visible
    if (details.open) {
      const content = getContentEl(details);
      if (content) {
        content.style.height = "auto";
        content.style.opacity = "1";
      }
    }
  });

  // ========== CAROUSEL 3D (PROJETS) ==========

  const ring = document.querySelector(".carousel-ring");
  const cells = document.querySelectorAll(".carousel-cell");
  const prevBtn = document.querySelector(".carousel-prev");
  const nextBtn = document.querySelector(".carousel-next");

  if (ring && cells.length > 0) {
    const n = cells.length;
    const theta = 360 / n;

    // Compute radius based on cell width
    function getRadius() {
      const cellWidth = cells[0].offsetWidth;
      return Math.round(cellWidth / (2 * Math.tan(Math.PI / n)));
    }

    let radius = getRadius();
    let currentAngle = 0;

    function positionCells() {
      radius = getRadius();
      cells.forEach((cell, i) => {
        cell.style.transform = `rotateY(${i * theta}deg) translateZ(${radius}px)`;
      });
      ring.style.transform = `translateZ(-${radius}px) rotateY(${currentAngle}deg)`;
    }

    function rotateTo(angle) {
      currentAngle = angle;
      ring.style.transform = `translateZ(-${radius}px) rotateY(${angle}deg)`;
    }

    positionCells();

    if (prevBtn) {
      prevBtn.addEventListener("click", () => rotateTo(currentAngle + theta));
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => rotateTo(currentAngle - theta));
    }

    // Touch / drag support — track distance to distinguish drag from tap/click
    let startX = 0;
    let dragging = false;
    let didDrag = false; // true if pointer moved enough to count as a drag
    const DRAG_THRESHOLD = 8; // px — below this we treat it as a tap
    const scene = document.querySelector(".carousel-scene");

    if (scene) {
      scene.addEventListener("pointerdown", (e) => {
        dragging = true;
        didDrag = false;
        startX = e.clientX;
        ring.style.transition = "none";
      });

      window.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const diff = e.clientX - startX;
        if (Math.abs(diff) > DRAG_THRESHOLD) didDrag = true;
        const dragAngle = currentAngle + (diff / 3);
        ring.style.transform = `translateZ(-${radius}px) rotateY(${dragAngle}deg)`;
      });

      window.addEventListener("pointerup", (e) => {
        if (!dragging) return;
        dragging = false;
        ring.style.transition = "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
        const diff = e.clientX - startX;
        if (Math.abs(diff) > 40) {
          const steps = Math.round(diff / 100) || (diff > 0 ? 1 : -1);
          rotateTo(currentAngle + steps * theta);
        } else {
          rotateTo(currentAngle);
        }
      });

      // Block link navigation if the user dragged instead of tapping
      scene.addEventListener("click", (e) => {
        if (didDrag) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true); // capture phase — fires before the <a> handles the click
    }

    // Keyboard support
    document.querySelector(".carousel-3d")?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") rotateTo(currentAngle + theta);
      if (e.key === "ArrowRight") rotateTo(currentAngle - theta);
    });

    // Reposition on resize
    window.addEventListener("resize", positionCells);

    // Auto-rotate (slow)
    let autoRotateId = null;
    let autoRotatePaused = false;

    function autoRotate() {
      if (!autoRotatePaused) {
        rotateTo(currentAngle - theta);
      }
      autoRotateId = setTimeout(autoRotate, 4000);
    }
    autoRotateId = setTimeout(autoRotate, 5000);

    const carousel3d = document.querySelector(".carousel-3d");
    if (carousel3d) {
      carousel3d.addEventListener("mouseenter", () => (autoRotatePaused = true));
      carousel3d.addEventListener("mouseleave", () => (autoRotatePaused = false));
      carousel3d.addEventListener("pointerdown", () => (autoRotatePaused = true));
      carousel3d.addEventListener("pointerup", () => {
        setTimeout(() => (autoRotatePaused = false), 2000);
      });
    }
  }

  // BLOQUER CLIC DROIT
  // document.addEventListener("contextmenu", (e) => e.preventDefault());

  // Empêcher CTRL+C, CTRL+U, F12
  // document.addEventListener("keydown", function (e) {
  //   if (e.ctrlKey && ["u", "U", "c", "C", "s", "S"].includes(e.key)) {
  //     e.preventDefault();
  //   }
  // });
});
