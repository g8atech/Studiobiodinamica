/* Studio Biodinamica — consenso cookie, contenuti esterni e form via WhatsApp */
(function () {
  var KEY = "sb-consent-v1";
  var WA = "393386109700";

  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  /* ---------- contenuti di terze parti (Maps, YouTube, recensioni) ---------- */
  var LABELS = {
    maps: "la mappa di Google Maps",
    youtube: "il video di YouTube",
    reviews: "le recensioni Google (servizio Elfsight)"
  };

  function loadThirdParty() {
    document.querySelectorAll("iframe[data-consent-src]").forEach(function (f) {
      f.src = f.getAttribute("data-consent-src");
      f.removeAttribute("data-consent-src");
      f.style.display = "";
      var ph = f.previousElementSibling;
      if (ph && ph.classList.contains("sb-blocked")) ph.remove();
    });
    document.querySelectorAll("script[data-consent-script]").forEach(function (s) {
      var n = document.createElement("script");
      n.src = s.getAttribute("data-consent-script");
      n.defer = true;
      s.parentNode.replaceChild(n, s);
    });
    document.querySelectorAll(".sb-blocked").forEach(function (p) { p.remove(); });
  }

  function placeholder(kind) {
    var d = document.createElement("div");
    d.className = "sb-blocked";
    d.innerHTML = "<p>Qui viene mostrato " + LABELS[kind] +
      ", che usa cookie di terze parti.</p>" +
      '<button type="button" class="sb-btn sb-accept-inline">Accetta i cookie e mostra</button>' +
      ' <a href="privacy.html#cookie">Cookie policy</a>';
    return d;
  }

  function blockThirdParty() {
    document.querySelectorAll("iframe[data-consent-src]").forEach(function (f) {
      var src = f.getAttribute("data-consent-src");
      var kind = src.indexOf("youtube") > -1 ? "youtube" : "maps";
      f.style.display = "none";
      if (!(f.previousElementSibling && f.previousElementSibling.classList.contains("sb-blocked"))) {
        f.parentNode.insertBefore(placeholder(kind), f);
      }
    });
    document.querySelectorAll("script[data-consent-script]").forEach(function (s) {
      if (!(s.previousElementSibling && s.previousElementSibling.classList.contains("sb-blocked"))) {
        s.parentNode.insertBefore(placeholder("reviews"), s);
      }
    });
  }

  /* ---------- banner ---------- */
  function banner() {
    var b = document.getElementById("sb-cookie");
    if (b) { b.hidden = false; return; }
    b = document.createElement("div");
    b.id = "sb-cookie";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-label", "Preferenze cookie");
    b.innerHTML =
      '<button type="button" class="sb-close" aria-label="Chiudi e continua senza accettare">&times;</button>' +
      "<p>Questo sito usa solo cookie tecnici. Con il tuo consenso carichiamo anche contenuti di terze parti " +
      "(Google Maps, YouTube, recensioni Google) che possono installare cookie propri. " +
      'Puoi cambiare idea quando vuoi dal link “Gestisci cookie” in fondo alla pagina. <a href="privacy.html#cookie">Cookie policy</a></p>' +
      '<div class="sb-actions"><button type="button" class="sb-btn sb-reject">Rifiuta</button>' +
      '<button type="button" class="sb-btn sb-accept">Accetta</button></div>';
    document.body.appendChild(b);
  }
  function hideBanner() {
    var b = document.getElementById("sb-cookie");
    if (b) b.hidden = true;
  }

  function accept() { setConsent("all"); hideBanner(); loadThirdParty(); }
  function reject() {
    var had = getConsent() === "all";
    setConsent("necessary"); hideBanner();
    if (had) location.reload(); else blockThirdParty();
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.closest(".sb-accept") || t.closest(".sb-accept-inline")) { e.preventDefault(); accept(); }
    else if (t.closest(".sb-reject") || t.closest(".sb-close")) { e.preventDefault(); reject(); }
    else if (t.closest(".sb-manage")) { e.preventDefault(); banner(); }
  });

  /* ---------- form: invio su WhatsApp ---------- */
  function setupForms() {
    var n = 0;
    document.querySelectorAll("form.mbr-form").forEach(function (form) {
      n++;
      var btnRow = form.querySelector(".btn-row, .input-group-btn");
      var anchor = btnRow ? (btnRow.closest(".btn-row") || btnRow.closest(".col-md-12") || btnRow) : null;
      var id = "sb-privacy-" + n;
      var lab = document.createElement("label");
      lab.className = "sb-privacy";
      lab.setAttribute("for", id);
      lab.innerHTML = '<input type="checkbox" id="' + id + '" required> ' +
        'Ho letto l’<a href="privacy.html" target="_blank">informativa privacy</a> e acconsento a essere ricontattato.';
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(lab, anchor);
      else form.appendChild(lab);

      var note = document.createElement("p");
      note.className = "sb-note";
      note.textContent = "Si apre WhatsApp con il messaggio già scritto: premi Invia per mandarlo allo studio.";
      lab.parentNode.insertBefore(note, lab.nextSibling);

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var v = function (name) {
          var el = form.querySelector('[name="' + name + '"]');
          return el ? el.value.trim() : "";
        };
        var lines = ["Buongiorno, scrivo dal sito Studio Biodinamica."];
        if (v("name")) lines.push("Nome: " + v("name"));
        if (v("phone")) lines.push("Telefono: " + v("phone"));
        if (v("email")) lines.push("Email: " + v("email"));
        if (v("message")) lines.push("Richiesta: " + v("message"));
        window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
        var box = form.closest("[data-form-type]") || form.parentNode;
        var alert = box ? box.querySelector("[data-form-alert]") : null;
        if (alert) { alert.hidden = false; alert.classList.add("sb-alert"); }
      });
    });
  }

  function init() {
    setupForms();
    var c = getConsent();
    if (c === "all") loadThirdParty();
    else { blockThirdParty(); if (!c) banner(); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
