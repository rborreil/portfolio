console.log("✅ form.js chargé !");

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  if (!form || !status) return;

  const DEFAULT_TEXT = "Envoyer le message";

  /* =========================
     Helpers bouton
     ========================= */

  function resetButton() {
    status.textContent = DEFAULT_TEXT;
    status.classList.remove("error-style", "validation-style");
    status.classList.add("primary-btn");
    status.style.display = "block";
    status.disabled = false;
  }

  function setError(text) {
    status.textContent = text;
    status.classList.remove("primary-btn", "validation-style");
    status.classList.add("error-style");
    status.style.display = "block";
    status.disabled = false;
  }

  function setSuccess(text) {
    status.textContent = text;
    status.classList.remove("primary-btn", "error-style");
    status.classList.add("validation-style");
    status.style.display = "block";
    status.disabled = false;
  }

  function setLoading() {
    status.textContent = "Envoi en cours…";
    status.classList.remove("validation-style", "error-style");
    status.classList.add("primary-btn");
    status.disabled = true;
  }

  /* =========================
     Callbacks reCAPTCHA
     ========================= */

  // Appelé automatiquement quand l’utilisateur coche le reCAPTCHA
  window.onRecaptchaSuccess = function () {
    resetButton();
  };

  // Appelé si le token expire
  window.onRecaptchaExpired = function () {
    resetButton();
  };

  // État initial
  resetButton();

  /* =========================
     Submit formulaire
     ========================= */

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const token = window.grecaptcha ? window.grecaptcha.getResponse() : "";

      if (!token) {
        setError("Merci de valider le reCAPTCHA.");
        return;
      }

      const payload = {
        nom: form.nom.value,
        entreprise: form.entreprise.value,
        email: form.email.value,
        tel: form.tel.value,
        sujet: form.sujet.value,
        message: form.message.value,
        consentement: form.consentement.checked,
        website: form.website ? form.website.value : "",
        recaptcha: token,
      };

      setLoading();

      const res = await fetch("/.netlify/functions/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setSuccess("Message envoyé avec succès !");
      form.reset();
      if (window.grecaptcha) window.grecaptcha.reset();

      setTimeout(() => {
        resetButton();
      }, 8000);
    } catch (err) {
      console.error(err);
      setError("Erreur d'envoi : " + (err?.message || "inconnue"));
    }
  });
});
