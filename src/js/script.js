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
  window.addEventListener("load", () => {
    const root = document.querySelector("#testimonials .testimonials-carousel");
    if (!root) return;

    const viewport = root.querySelector(".carousel-viewport");
    const track = root.querySelector(".carousel-track");
    if (!viewport || !track) return;

    // Clone une seule fois
    if (!track.dataset.cloned) {
      [...track.children].forEach((n) => track.appendChild(n.cloneNode(true)));
      track.dataset.cloned = "true";
    }

    // Desktop : auto-scroll
    const vw = window.innerWidth;

const SPEED =
  vw >= 1800 ? 150 :   // écrans très larges (27", 32")
  vw >= 1400 ? 120 :   // desktop standard
  vw >= 1024 ? 28 :   // laptop
  18;                 // fallback (ne sera pas utilisé sur mobile si auto-scroll off)

    let lastTs = null;
    let rafId = null;
    let paused = false;
    let resumeTimer = null;

    function tick(ts) {
      if (paused) {
        rafId = null;
        return;
      }

      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      const half = track.scrollWidth / 2;
      viewport.scrollLeft += SPEED * dt;

      if (viewport.scrollLeft >= half) {
        viewport.scrollLeft -= half;
      }

      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (rafId) return;
      paused = false;
      lastTs = null;
      rafId = requestAnimationFrame(tick);
    }

    function pauseTemporarily() {
      paused = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(start, 1500);
    }

    // Interactions
    viewport.addEventListener("wheel", pauseTemporarily, { passive: true });
    viewport.addEventListener("touchstart", pauseTemporarily, {
      passive: true,
    });

    // Pause au hover uniquement (sans bloquer si tu veux juste survoler)
    // viewport.addEventListener("mouseenter", pauseTemporarily);

    // Drag-to-scroll (grab)
    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;

    viewport.addEventListener("pointerdown", (e) => {
      // uniquement bouton principal souris / touch / pen
      if (e.pointerType === "mouse" && e.button !== 0) return;

      isDown = true;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add("is-dragging");

      startX = e.clientX;
      startScrollLeft = viewport.scrollLeft;

      paused = true;
      clearTimeout(resumeTimer);
    });

    viewport.addEventListener("pointermove", (e) => {
      if (!isDown) return;

      const dx = e.clientX - startX;
      viewport.scrollLeft = startScrollLeft - dx;
    });

    function endDrag(e) {
      if (!isDown) return;
      isDown = false;

      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch (_) {}

      viewport.classList.remove("is-dragging");

      // Reprend après un court délai
      resumeTimer = setTimeout(start, 600);
    }

    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("pointerleave", endDrag);

    start();
  };);

  // BLOQUER CLIC DROIT
  // document.addEventListener("contextmenu", (e) => e.preventDefault());

  // Empêcher CTRL+C, CTRL+U, F12
  // document.addEventListener("keydown", function (e) {
  //   if (e.ctrlKey && ["u", "U", "c", "C", "s", "S"].includes(e.key)) {
  //     e.preventDefault();
  //   }
  // });
});
