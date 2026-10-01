// Shared behaviour for the legal documents under /apps/generic/: document switcher,
// EN/FR switch, letterhead, table of contents and PDF export (browser print dialog).
// Each page holds both languages in [lang="en"] / [lang="fr"] blocks; legal.css hides the inactive one.
(function () {
  var pages = [
    { href: "/apps/generic/", en: "All documents", fr: "Tous les documents" },
    { href: "/apps/generic/cgv/", en: "Terms of Sale", fr: "CGV" },
    { href: "/apps/generic/charter/", en: "Confidentiality Charter", fr: "Charte de confidentialité" },
    { href: "/apps/generic/privacy/", en: "Privacy Policy", fr: "Politique de confidentialité" },
    { href: "/apps/generic/tos/", en: "Terms of Service", fr: "Conditions d'utilisation" },
    { href: "/apps/generic/delete-account/", en: "Delete Account", fr: "Supprimer le compte" },
  ];
  var text = {
    en: {
      pdf: "Download PDF",
      pdfHint: "Opens your browser's print dialog. Choose “Save as PDF” as the destination.",
      fillHint: "Fill in the underlined fields before downloading, or leave them blank to complete by hand.",
      contents: "Contents",
      tagline: "App, game & web development",
      language: "Language",
    },
    fr: {
      pdf: "Télécharger en PDF",
      pdfHint: "Ouvre la fenêtre d'impression du navigateur. Choisissez « Enregistrer au format PDF » comme destination.",
      fillHint: "Complétez les champs soulignés avant le téléchargement, ou laissez-les vides pour les remplir à la main.",
      contents: "Sommaire",
      tagline: "Développement d'applications, de jeux et de sites web",
      language: "Langue",
    },
  };
  // Documents with at least this many sections get a table of contents.
  var tocMinSections = 6;

  var root = document.documentElement;
  var toolbar = document.querySelector("[data-legal-toolbar]");
  if (!toolbar) return;

  var currentPath = location.pathname.replace(/index\.html$/, "");
  var isOverview = currentPath === pages[0].href;
  var hasFields = !!document.querySelector(".fill");

  // ---- Toolbar: document switcher, language switch, PDF button ----
  var bar = document.createElement("nav");
  bar.className = "legal-docs";
  var links = pages.map(function (page) {
    var link = document.createElement("a");
    link.className = "legal-docs__link";
    link.href = page.href;
    if (currentPath === page.href) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
    bar.appendChild(link);
    return link;
  });

  var actions = document.createElement("div");
  actions.className = "legal-actions";
  var langGroup = document.createElement("div");
  langGroup.className = "legal-lang";
  langGroup.setAttribute("role", "group");
  var langButtons = ["en", "fr"].map(function (lang) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "legal-lang__btn";
    button.textContent = lang.toUpperCase();
    button.addEventListener("click", function () {
      setLang(lang);
    });
    langGroup.appendChild(button);
    return button;
  });
  actions.appendChild(langGroup);

  var pdfButton = null;
  if (!isOverview) {
    pdfButton = document.createElement("button");
    pdfButton.type = "button";
    pdfButton.className = "legal-pdf";
    pdfButton.addEventListener("click", function () {
      window.print();
    });
    actions.appendChild(pdfButton);
  }

  toolbar.className = "legal-toolbar";
  toolbar.appendChild(bar);
  toolbar.appendChild(actions);

  var hint = null;
  if (!isOverview) {
    hint = document.createElement("p");
    hint.className = "legal-hint";
    actions.appendChild(hint);
  }

  // ---- Letterhead and table of contents, built once per language block ----
  document.querySelectorAll("article.sheet[lang]").forEach(function (sheet) {
    var lang = sheet.getAttribute("lang") === "fr" ? "fr" : "en";
    var t = text[lang];

    var letterhead = document.createElement("header");
    letterhead.className = "letterhead";
    letterhead.innerHTML =
      '<div class="letterhead__brand"><strong>Nathan de Castro</strong><span></span></div>' +
      '<div class="letterhead__contact">nathandecastro.com<br />decastronathan@gmail.com</div>';
    letterhead.querySelector(".letterhead__brand span").textContent = t.tagline;
    sheet.insertBefore(letterhead, sheet.firstChild);

    var headings = Array.prototype.slice.call(sheet.querySelectorAll("h2"));
    headings.forEach(function (heading, index) {
      if (!heading.id) heading.id = lang + "-" + (index + 1);
      // "Article 3 – Prices" / "3. Prices": set the number apart from the title.
      var match = heading.textContent.trim().match(/^((?:Article\s+)?\d+)\s*(?:[–—-]|\.)\s*(.+)$/);
      if (match) {
        heading.innerHTML = "";
        var num = document.createElement("span");
        num.className = "h-num";
        num.textContent = match[1].replace(/^Article\s+/, "");
        heading.appendChild(num);
        heading.appendChild(document.createTextNode(match[2]));
      }
    });

    if (isOverview || headings.length < tocMinSections) return;
    var toc = document.createElement("nav");
    toc.className = "doc-toc";
    toc.setAttribute("aria-label", t.contents);
    var title = document.createElement("p");
    title.className = "doc-toc__title";
    title.textContent = t.contents;
    var list = document.createElement("ol");
    headings.forEach(function (heading) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      var num = heading.querySelector(".h-num");
      if (num) {
        var numLabel = document.createElement("span");
        numLabel.textContent = num.textContent;
        link.appendChild(numLabel);
        link.appendChild(document.createTextNode(heading.textContent.slice(num.textContent.length)));
      } else {
        link.textContent = heading.textContent;
      }
      item.appendChild(link);
      list.appendChild(item);
    });
    toc.appendChild(title);
    toc.appendChild(list);
    sheet.insertBefore(toc, headings[0]);
  });

  function storedLang() {
    try {
      return localStorage.getItem("legal-lang");
    } catch (error) {
      return null;
    }
  }

  function setLang(lang) {
    if (lang !== "fr") lang = "en";
    var t = text[lang];
    root.lang = lang;
    // The document title becomes the default PDF file name.
    document.title = root.getAttribute("data-title-" + lang) || document.title;
    links.forEach(function (link, index) {
      link.textContent = pages[index][lang];
    });
    langGroup.setAttribute("aria-label", t.language);
    langButtons.forEach(function (button) {
      var active = button.textContent.toLowerCase() === lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (pdfButton) pdfButton.textContent = t.pdf;
    if (hint) hint.textContent = hasFields ? t.fillHint + " " + t.pdfHint : t.pdfHint;
    try {
      localStorage.setItem("legal-lang", lang);
    } catch (error) {}
    var url = new URL(location.href);
    if (lang === "fr") url.searchParams.set("lang", "fr");
    else url.searchParams.delete("lang");
    history.replaceState(null, "", url);
  }

  var params = new URLSearchParams(location.search);
  setLang(params.get("lang") || storedLang() || "en");

  // Overview "PDF" links point here with ?print=1: open the print dialog once the page is laid out.
  if (params.has("print") && !isOverview) {
    var url = new URL(location.href);
    url.searchParams.delete("print");
    history.replaceState(null, "", url);
    var openPrint = function () {
      window.setTimeout(function () {
        window.print();
      }, 300);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(openPrint);
    else window.addEventListener("load", openPrint);
  }
})();
