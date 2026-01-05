document.addEventListener("DOMContentLoaded", () => {
  // MENU FLOTTANT + BOUTONS FIXES
  const fixedMail = document.querySelector(".fixed-btn .fixed-mail");
  const fixedHome = document.querySelector(".fixed-btn .fixed-home");
  const floatingNav = document.querySelector(".floating-nav");
  // const footer = document.querySelector("#footer");

  // Seuil d’apparition
  let scrollThreshold = window.innerWidth > 500 ? 700 : 1050;

  function toggleFixedButtons() {
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    const isAtBottom = scrollY + windowHeight >= docHeight - 200;
    const isAtContact = scrollY + windowHeight >= docHeight - 1000;

    const shouldShow = scrollY > scrollThreshold && !isAtBottom;
    const shouldShowMail = scrollY > scrollThreshold && !isAtContact;
    const shouldShowHome = scrollY > scrollThreshold;

    fixedMail.classList.toggle("fixed-hidden", !shouldShowMail);
    fixedHome.classList.toggle("fixed-hidden", !shouldShowHome);
    floatingNav.classList.toggle("fixed-hidden", !shouldShow);
  }

  window.addEventListener("scroll", toggleFixedButtons);
  window.addEventListener("resize", toggleFixedButtons);

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

  // BLOQUER CLIC DROIT
  // document.addEventListener("contextmenu", (e) => e.preventDefault());

  // Empêcher CTRL+C, CTRL+U, F12
  // document.addEventListener("keydown", function (e) {
  //   if (e.ctrlKey && ["u", "U", "c", "C", "s", "S"].includes(e.key)) {
  //     e.preventDefault();
  //   }
  // });
});
