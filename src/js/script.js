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
  // ===== CAROUSEL MARQUEE (Option B – compatible Apple) =====
  window.addEventListener("load", () => {
    const track = document.querySelector(
      "#testimonials .carousel-track.marquee",
    );
    if (!track) return;

    // Dupliquer le contenu UNE fois pour boucle infinie
    if (!track.dataset.cloned) {
      track.innerHTML += track.innerHTML;
      track.dataset.cloned = "true";
    }

    // Pause / reprise sur mobile (tap)
    let paused = false;

    track.addEventListener("pointerdown", () => {
      paused = !paused;
      track.style.animationPlayState = paused ? "paused" : "running";
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
};);
