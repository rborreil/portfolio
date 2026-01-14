const nodemailer = require("nodemailer");

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(payload),
  };
}

exports.handler = async (event) => {
  // Préflight CORS (si besoin)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Invalid JSON" });
  }

  // Anti-spam simple (honeypot)
  // Ajoute un champ caché "website" côté HTML et il doit rester vide
  if (data.website) {
    return json(200, { ok: true }); // on "fait semblant" pour les bots
  }

  const nom = String(data.nom || "").trim();
  const entreprise = String(data.entreprise || "").trim();
  const email = String(data.email || "").trim();
  const tel = String(data.tel || "").trim();
  const sujet = String(data.sujet || "").trim();
  const message = String(data.message || "").trim();
  const consentement = Boolean(data.consentement);

  if (!nom || !email || !sujet || !message || !consentement) {
    return json(400, { ok: false, error: "Champs requis manquants." });
  }

  // Transport SMTP (OVH)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // ex: mail.robinborreil.fr ou ssl0.ovh.net
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true", // true pour 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const to = process.env.MAIL_TO; // ex: contact@robinborreil.fr
  const from = process.env.MAIL_FROM; // ex: contact@robinborreil.fr

  const subject = `Formulaire robinborreil.fr : ${sujet}`;

  const html = `
    <strong>Nom :</strong> ${escapeHtml(nom)}<br>
    <strong>Entreprise :</strong> ${escapeHtml(entreprise)}<br>
    <strong>Email :</strong> ${escapeHtml(email)}<br>
    <strong>Tél :</strong> ${escapeHtml(tel)}<br>
    <strong>Sujet :</strong> ${escapeHtml(sujet)}<br><br>
    <strong>Message :</strong><br>${escapeHtml(message).replace(
      /\n/g,
      "<br>"
    )}<br><br>
    <strong>Consentement :</strong> ${consentement ? "oui" : "non"}<br>
  `;

  try {
    // Vérif connexion SMTP (utile en debug)
    // await transporter.verify();

    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject,
      html,
    });

    return json(200, { ok: true, message: "Message envoyé." });
  } catch (err) {
    return json(500, {
      ok: false,
      error: "Erreur SMTP.",
      details: String(err?.message || err),
    });
  }
};

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
