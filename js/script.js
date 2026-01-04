// SCROLL TO TOP
// Obtenir le bouton
// const scrollToTopBtn = document.getElementById("scroll_to_top");
const fixedMail = document.querySelector(".fixed-btn .fixed-mail");
const fixedHome = document.querySelector(".fixed-btn .fixed-home");
const floatingNav = document.querySelector(".floating-nav");

// Définir le nombre de pixels à partir duquel le bouton doit apparaître
let scrollThreshold;

if (window.innerWidth > 500) {
  scrollThreshold = 750;
} else {
  scrollThreshold = 1050;
}


// Fonction pour afficher/masquer le bouton
function toggleFixedButtons() {
  if (window.pageYOffset > scrollThreshold) {
    // scrollToTopBtn.style.display = "block";
    fixedMail.style.display = "flex";
    fixedHome.style.display = "flex";
    floatingNav.style.display = "flex";
  } else {
    // scrollToTopBtn.style.display = "none";
    fixedMail.style.display = "none";
    fixedHome.style.display = "none";
    floatingNav.style.display = "none";
  }
}

// Ajouter un écouteur d'événement pour détecter le scroll
window.addEventListener("scroll", toggleFixedButtons);

// Fonction pour faire défiler vers le haut de la page
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Ajouter un écouteur d'événement pour le clic sur le bouton
// scrollToTopBtn.addEventListener("click", scrollToTop);

// DARK MODE
// const toggleDarkMode = document.querySelector('.dark-light');

// toggleDarkMode.addEventListener('change', () => {
//   document.body.classList.toggle('dark-mode', toggleDarkMode.checked);
// })

// Empêcher Clic Droit
// document.addEventListener("contextmenu", (e) => e.preventDefault());

// Empêcher CTRL+C, CTRL+U, F12
// document.addEventListener("keydown", function (e) {
//   if (e.ctrlKey && ["u", "U", "c", "C", "s", "S"].includes(e.key)) {
//     e.preventDefault();
//   }
// });
