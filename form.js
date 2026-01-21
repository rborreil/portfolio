console.log("✅ form.js chargé !");
document.addEventListener("DOMContentLoaded", function () {
  // Debug
  // console.log("ENV CHECK", {
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT,
  //   secure: process.env.SMTP_SECURE,
  //   user: process.env.SMTP_USER,
  //   hasPass: Boolean(process.env.SMTP_PASS),
  // });
  // Fin Debug

  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const token = window.grecaptcha ? window.grecaptcha.getResponse() : "";
      if (!token) {
        status.textContent = "Merci de valider le reCAPTCHA.";
        status.classList.remove("primary-btn");
        status.classList.add("error-style");
        status.style.display = "block";
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

      console.log("reCAPTCHA token length:", payload.recaptcha.length);

      const res = await fetch("/.netlify/functions/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        console.log("Erreur backend (data) :", data);
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      status.textContent = "Message envoyé avec succès !";
      status.classList.remove("primary-btn");
      status.classList.add("validation-style");
      form.reset();
      if (window.grecaptcha) window.grecaptcha.reset();

      setTimeout(() => {
        status.textContent = "Envoyer le message";
        status.classList.remove("validation-style");
        status.classList.add("primary-btn");
      }, 8000);
    } catch (err) {
      console.error(err);
      status.textContent = "Erreur d'envoi : " + err.message;
      status.style.color = "red";
      status.style.display = "block";
    }
  });
});
