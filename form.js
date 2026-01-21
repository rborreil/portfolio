console.log("✅ form.js chargé !");

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  if (!form || !status) return;

  const DEFAULT_TEXT = "Envoyer le message";

  function setButtonState({ text, add = [], remove = [], disabled = false }) {
    status.textContent = text;
    status.disabled = disabled;

    // Nettoyage styles inline (au cas où)
    status.style.display = "";

    // Classes
    remove.forEach((c) => status.classList.remove(c));
    add.forEach((c) => status.classList.add(c));
  }

  function resetButton() {
    setButtonState({
      text: DEFAULT_TEXT,
      add: ["primary-btn"],
      remove: ["validation-style", "error-style"],
      disabled: false,
    });
  }

  function setError(text) {
    setButtonState({
      text,
      add: ["error-style"],
      remove: ["primary-btn", "validation-style"],
      disabled: false,
    });
  }

  function setSuccess(text) {
    setButtonState({
      text,
      add: ["validation-style"],
      remove: ["primary-btn", "error-style"],
      disabled: false,
    });
  }

  function setLoading() {
    setButtonState({
      text: "Envoi…",
      add: ["primary-btn"],
      remove: ["validation-style", "error-style"],
      disabled: true,
    });
  }

  // Exposées globalement pour que reCAPTCHA puisse les appeler
  window.onRecaptchaSuccess = function () {
    // Si on était en erreur "Merci de valider…", on remet le bouton normal
    resetButton();
  };

  window.onRecaptchaExpired = function () {
    // Token expiré → on force un état neutre (ou erreur si tu préfères)
    resetButton();
  };

  resetButton();

  form.addEventListener("submit", async (e) => {
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
