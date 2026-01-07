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
    { threshold: 0.6 }
  );

  counters.forEach((counter) => observer.observe(counter));

  // ===== Testimonials carousel (auto-scroll + interaction directe sur cartes) =====
  (() => {
    const root = document.querySelector("#testimonials .testimonials-carousel");
    if (!root) return;

    const viewport = root.querySelector(".carousel-viewport");
    const track = root.querySelector(".carousel-track");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Config
    const SPEED_PX_PER_SEC = 18; // défilement lent
    const RESUME_AFTER_MS = 3500; // reprise après inactivité
    const DRAG_THRESHOLD = 6; // px

    // State
    let rafId = null;
    let lastTs = null;
    let resumeTimer = null;
    let isHardPaused = false; // pause "fixe" si on clique/tap volontairement

    // Drag state
    let isPointerDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = false;

    // Clone for infinite loop
    const originals = Array.from(track.children);
    originals.forEach((node) => track.appendChild(node.cloneNode(true)));

    function clearResumeTimer() {
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = null;
    }

    function stopAuto() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      lastTs = null;
    }

    function startAuto() {
      if (prefersReducedMotion) return;
      if (isHardPaused) return;
      if (rafId) return;
      rafId = requestAnimationFrame(tick);
    }

    function scheduleResume() {
      clearResumeTimer();
      if (prefersReducedMotion) return;
      if (isHardPaused) return;
      resumeTimer = window.setTimeout(() => startAuto(), RESUME_AFTER_MS);
    }

    function userInteracted({ hard = false } = {}) {
      stopAuto();
      clearResumeTimer();
      if (hard) {
        isHardPaused = true; // pause jusqu’au prochain click/tap
        return;
      }
      scheduleResume();
    }

    function tick(ts) {
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      const halfScrollWidth = track.scrollWidth / 2;
      viewport.scrollLeft += SPEED_PX_PER_SEC * dt;

      if (viewport.scrollLeft >= halfScrollWidth) {
        viewport.scrollLeft -= halfScrollWidth;
      }

      rafId = requestAnimationFrame(tick);
    }

    // Toggle hard pause on click/tap anywhere in the viewport (direct interaction)
    function toggleHardPause() {
      isHardPaused = !isHardPaused;
      if (isHardPaused) {
        stopAuto();
        clearResumeTimer();
      } else {
        startAuto();
      }
    }

    // Pause on hover (desktop) and resume after mouse leaves
    viewport.addEventListener("mouseenter", () =>
      userInteracted({ hard: false })
    );
    viewport.addEventListener("mouseleave", () =>
      userInteracted({ hard: false })
    );

    // Wheel / touch / focus interactions => temporary pause + resume
    viewport.addEventListener("wheel", () => userInteracted({ hard: false }), {
      passive: true,
    });
    viewport.addEventListener("focusin", () => userInteracted({ hard: false }));

    // Pointer drag to scroll (mouse + touch + pen)
    viewport.addEventListener("pointerdown", (e) => {
      isPointerDown = true;
      moved = false;
      startX = e.clientX;
      startScrollLeft = viewport.scrollLeft;
      viewport.setPointerCapture(e.pointerId);

      userInteracted({ hard: false });
    });

    viewport.addEventListener("pointermove", (e) => {
      if (!isPointerDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > DRAG_THRESHOLD) moved = true;
      viewport.scrollLeft = startScrollLeft - dx;
    });

    viewport.addEventListener("pointerup", (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;

      // Si c'était un "tap" (pas un drag), toggle pause/play
      if (!moved) toggleHardPause();
      else scheduleResume();

      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch {}
    });

    viewport.addEventListener("pointercancel", () => {
      isPointerDown = false;
      scheduleResume();
    });

    // Keyboard (viewport focus): Space/Enter toggle pause, flèches scroll
    viewport.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleHardPause();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        userInteracted({ hard: false });
        viewport.scrollBy({ left: -320, behavior: "smooth" });
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        userInteracted({ hard: false });
        viewport.scrollBy({ left: 320, behavior: "smooth" });
      }
    });

    // Init
    startAuto();
  })();

  // BLOQUER CLIC DROIT
  // document.addEventListener("contextmenu", (e) => e.preventDefault());

  // Empêcher CTRL+C, CTRL+U, F12
  // document.addEventListener("keydown", function (e) {
  //   if (e.ctrlKey && ["u", "U", "c", "C", "s", "S"].includes(e.key)) {
  //     e.preventDefault();
  //   }
  // });
});
