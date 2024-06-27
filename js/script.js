// Obtenir le bouton
const scrollToTopBtn = document.getElementById("scroll_to_top");


// Définir le nombre de pixels à partir duquel le bouton doit apparaître
const scrollThreshold = 650; // Ajustez cette valeur selon vos préférences


// Fonction pour afficher/masquer le bouton
function toggleScrollToTopBtn() {
  if (window.pageYOffset > scrollThreshold) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
}

// Ajouter un écouteur d'événement pour détecter le scroll
window.addEventListener("scroll", toggleScrollToTopBtn);

// Fonction pour faire défiler vers le haut de la page
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Ajouter un écouteur d'événement pour le clic sur le bouton
scrollToTopBtn.addEventListener("click", scrollToTop);