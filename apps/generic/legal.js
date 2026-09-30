// Toolbar for the legal documents under /apps/generic/: page links, EN/FR switch, PDF export.
// Each page holds both languages in [lang="en"] / [lang="fr"] blocks; legal.css hides the inactive one.
(function () {
  var pages = [
    { href: "/apps/generic/", en: "Overview", fr: "Aperçu" },
    { href: "/apps/generic/contract/", en: "Contract", fr: "Contrat" },
    { href: "/apps/generic/charter/", en: "Confidentiality Charter", fr: "Charte de confidentialité" },
    { href: "/apps/generic/privacy/", en: "Privacy Policy", fr: "Politique de confidentialité" },
    { href: "/apps/generic/tos/", en: "Terms of Service", fr: "Conditions d'utilisation" },
  ];
  var pdfLabel = { en: "Download PDF", fr: "Télécharger en PDF" };

  var root = document.documentElement;
  var toolbar = document.querySelector("[data-legal-toolbar]");
  if (!toolbar) return;

  var bar = document.createElement("div");
  bar.className = "site-context-bar";
  var links = pages.map(function (page) {
    var link = document.createElement("a");
    link.className = "site-context-link";
    link.href = page.href;
    if (location.pathname.replace(/index\.html$/, "") === page.href) {
      link.classList.add("is-active");
    }
    bar.appendChild(link);
    return link;
  });

  var actions = document.createElement("div");
  actions.className = "legal-actions";
  var langButtons = ["en", "fr"].map(function (lang) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "legal-btn";
    button.textContent = lang.toUpperCase();
    button.addEventListener("click", function () {
      setLang(lang);
    });
    actions.appendChild(button);
    return button;
  });
  var pdfButton = document.createElement("button");
  pdfButton.type = "button";
  pdfButton.className = "legal-btn";
  pdfButton.addEventListener("click", function () {
    window.print();
  });
  actions.appendChild(pdfButton);

  toolbar.className = "legal-toolbar";
  toolbar.appendChild(bar);
  toolbar.appendChild(actions);

  function storedLang() {
    try {
      return localStorage.getItem("legal-lang");
    } catch (error) {
      return null;
    }
  }

  function setLang(lang) {
    if (lang !== "fr") lang = "en";
    root.lang = lang;
    // The document title becomes the default PDF file name.
    document.title = root.getAttribute("data-title-" + lang) || document.title;
    links.forEach(function (link, index) {
      link.textContent = pages[index][lang];
    });
    langButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.textContent.toLowerCase() === lang);
    });
    pdfButton.textContent = pdfLabel[lang];
    try {
      localStorage.setItem("legal-lang", lang);
    } catch (error) {}
    var url = new URL(location.href);
    if (lang === "fr") url.searchParams.set("lang", "fr");
    else url.searchParams.delete("lang");
    history.replaceState(null, "", url);
  }

  setLang(new URLSearchParams(location.search).get("lang") || storedLang() || "en");
})();
