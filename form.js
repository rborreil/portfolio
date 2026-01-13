console.log("✅ form.js chargé !");

document.addEventListener("DOMContentLoaded", function () {

  // FORMULAIRE DE CONTACT - ENVOI AJAX
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(form);

      fetch("sendmail.php", {
        method: "POST",
        body: formData
      })
        .then((res) => res.text())
        .then((data) => {
          console.log("Réponse PHP :", data);
          // status.removeAttribute("data-i18n");
          // status.textContent = "Message envoyé ✔️";
          status.textContent = "Message envoyé avec succès !";
          status.classList.remove("primary-btn");
          status.classList.add("validation-style");

          form.reset();

          // Réinitialiser après 5 secondes
          setTimeout(() => {
            status.textContent = "Envoyer le message";
            // status.setAttribute("data-i18n", "contactFormButton");
            status.style.backgroundColor = ""; // annule override
            status.style.color = "";

            // Revenir aux classes originales
            status.classList.remove("validation-style");
            status.classList.add(
              "primary-btn"
            );
          }, 8000);
        })
        .catch((err) => {
          console.error("Erreur JS :", err);
          status.textContent = "Erreur d'envoi.";
          status.style.color = "red";
          status.style.display = "block";
        });
    });
  }
})