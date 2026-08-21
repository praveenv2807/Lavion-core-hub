/* ============================================================
   LAVION CORE HUB — main.js
   1. Canvas frame-by-frame door scrubber (real image sequence)
   2. i18n loader (auto-detect + manual override, 10 languages)
   3. Nav + section reveal behavior
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------
     1. FRAME SEQUENCE SCRUBBER
     Replace placeholder frames in /assets/frames/ with your real
     4K export. Update FRAME_COUNT + FRAME_PATH() to match.
     Recommended export: 90-150 frames, JPG q80-85, 1600-2560px wide.
  ------------------------------------------------------------ */
  var FRAME_COUNT = 130;
  function FRAME_PATH(i) {
    return "assets/frames/frame_" + String(i).padStart(4, "0") + ".jpg";
  }

  var canvas = document.getElementById("doorCanvas");
  var hasEntrance = !!canvas;
  var ctx = hasEntrance ? canvas.getContext("2d") : null;
  var loader = document.getElementById("frameLoader");
  var loaderBar = loader ? loader.querySelector(".bar i") : null;
  var loaderPct = loader ? loader.querySelector("#loaderPct") : null;

  var images = new Array(FRAME_COUNT);
  var loadedCount = 0;
  var currentFrame = 0;
  var canvasReady = false;

  function resizeCanvas() {
    if (!hasEntrance) return;
    var stage = document.getElementById("entrance-stage");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = stage.clientWidth * dpr;
    canvas.height = stage.clientHeight * dpr;
    canvas.style.width = stage.clientWidth + "px";
    canvas.style.height = stage.clientHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(currentFrame);
  }

  function drawFrame(index) {
    if (!hasEntrance) return;
    index = Math.max(0, Math.min(FRAME_COUNT - 1, index));
    var img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var stage = document.getElementById("entrance-stage");
    var cw = stage.clientWidth, ch = stage.clientHeight;
    var ir = img.naturalWidth / img.naturalHeight;
    var cr = cw / ch;
    var dw, dh, dx, dy;
    if (ir > cr) { dh = ch; dw = ch * ir; dx = (cw - dw) / 2; dy = 0; }
    else { dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2; }
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function preloadFrames() {
    if (!hasEntrance) return;
    for (var i = 0; i < FRAME_COUNT; i++) {
      (function (idx) {
        var img = new Image();
        img.onload = img.onerror = function () {
          loadedCount++;
          var pct = Math.round((loadedCount / FRAME_COUNT) * 100);
          if (loaderBar) loaderBar.style.width = pct + "%";
          if (loaderPct) loaderPct.textContent = pct + "%";
          if (idx === 0) { canvasReady = true; drawFrame(0); }
          if (loadedCount === FRAME_COUNT && loader) {
            loader.style.opacity = "0";
            setTimeout(function () { loader.style.display = "none"; }, 500);
          }
        };
        img.src = FRAME_PATH(idx);
        images[idx] = img;
      })(i);
    }
  }

  /* ------------------------------------------------------------
     2. SCROLL -> FRAME MAPPING
  ------------------------------------------------------------ */
  var entranceSection = document.getElementById("entrance");
  var stageContent = document.getElementById("stageContent");
  var scrollCue = document.getElementById("scrollCue");
  var ticking = false;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function renderEntrance() {
    ticking = false;
    if (!hasEntrance) return;
    var rect = entranceSection.getBoundingClientRect();
    var total = entranceSection.offsetHeight - window.innerHeight;
    var progress = clamp(-rect.top / total, 0, 1);

    var frameIndex = Math.round(progress * (FRAME_COUNT - 1));
    if (frameIndex !== currentFrame || !canvasReady) {
      currentFrame = frameIndex;
      drawFrame(currentFrame);
    }

    if (stageContent) stageContent.style.opacity = 1 - clamp(progress / 0.1, 0, 1);
    if (scrollCue) scrollCue.style.opacity = 1 - clamp(progress / 0.04, 0, 1);
  }

  function onScroll() {
    updateNav();
    if (!ticking) { window.requestAnimationFrame(renderEntrance); ticking = true; }
  }

  /* ------------------------------------------------------------
     NAV visibility
  ------------------------------------------------------------ */
  var nav = document.getElementById("nav");
  function updateNav() {
    var y = window.scrollY;
    nav.classList.toggle("visible", y > window.innerHeight * 0.55 || reduceMotion);
    nav.classList.toggle("scrolled", y > 40);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("load", function () {
    resizeCanvas();
    preloadFrames();
    updateNav();
  });
  // fallback in case 'load' already fired
  if (document.readyState === "complete") {
    resizeCanvas();
    preloadFrames();
    updateNav();
  }

  /* ------------------------------------------------------------
     3. SECTION REVEAL ON SCROLL
  ------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("in"); });
    }
  });

  /* ------------------------------------------------------------
     4. i18n — auto-detect + manual override, 5 languages
  ------------------------------------------------------------ */
  var SUPPORTED_LANGS = [
    { code: "en", label: "English", dir: "ltr" },
    { code: "de", label: "Deutsch", dir: "ltr" },
    { code: "fr", label: "Français", dir: "ltr" },
    { code: "ta", label: "தமிழ்", dir: "ltr" },
    { code: "hi", label: "हिन्दी", dir: "ltr" }
  ];
  var DEFAULT_LANG = "en";
  var STORAGE_KEY = "lavion_lang";
  var cache = {};

  function detectLang() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.some(function (l) { return l.code === saved; })) return saved;
    var nav = (navigator.language || navigator.userLanguage || "en").toLowerCase().slice(0, 2);
    var match = SUPPORTED_LANGS.find(function (l) { return l.code === nav; });
    return match ? match.code : DEFAULT_LANG;
  }

  function applyTranslations(dict) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (dict[key] !== undefined) el.setAttribute("placeholder", dict[key]);
    });
    updateMemberCount(); // re-apply after translations so it isn't overwritten by the static "1,200" string
  }

  /* ------------------------------------------------------------
     4d. LIVE MEMBER COUNT
     Reads the same localStorage list the admin panel writes to
     (assets/js/admin.js), so the homepage stat actually reflects
     members added via admin.html — starts at 1,200 (the original
     baseline) and grows by 1 per member added in Admin > Members.
  ------------------------------------------------------------ */
  var MEMBER_COUNT_BASELINE = 1192; // + 8 default admin records = 1,200 to match the original stat
  var ADMIN_MEMBERS_KEY = "lavion_admin_members";

  function formatCount(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function updateMemberCount() {
    var el = document.querySelector('[data-i18n="stat4_num"]');
    if (!el) return;
    var total = MEMBER_COUNT_BASELINE + 8; // fallback if admin panel was never opened
    try {
      var stored = localStorage.getItem(ADMIN_MEMBERS_KEY);
      if (stored) {
        var list = JSON.parse(stored);
        if (Array.isArray(list)) total = MEMBER_COUNT_BASELINE + list.length;
      }
    } catch (e) { /* localStorage unavailable, keep fallback */ }
    el.textContent = formatCount(total);
  }

  function setLang(code) {
    var langObj = SUPPORTED_LANGS.find(function (l) { return l.code === code; }) || SUPPORTED_LANGS[0];
    document.documentElement.setAttribute("lang", langObj.code);
    document.documentElement.setAttribute("dir", langObj.dir);
    localStorage.setItem(STORAGE_KEY, langObj.code);

    var btn = document.getElementById("lang-btn");
    if (btn) btn.querySelector("span").textContent = langObj.code.toUpperCase();
    document.querySelectorAll("#lang-menu button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === langObj.code);
    });

    if (cache[langObj.code]) { applyTranslations(cache[langObj.code]); return; }
    fetch("assets/i18n/" + langObj.code + ".json")
      .then(function (r) { return r.json(); })
      .then(function (dict) { cache[langObj.code] = dict; applyTranslations(dict); })
      .catch(function (err) { console.error("i18n load failed for", langObj.code, err); });
  }

  function buildLangMenu() {
    var menu = document.getElementById("lang-menu");
    if (!menu) return;
    SUPPORTED_LANGS.forEach(function (l) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-lang", l.code);
      b.textContent = l.label;
      b.addEventListener("click", function () {
        setLang(l.code);
        menu.classList.remove("open");
      });
      menu.appendChild(b);
    });
    var toggle = document.getElementById("lang-btn");
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      menu.classList.toggle("open");
    });
    document.addEventListener("click", function () { menu.classList.remove("open"); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildLangMenu();
    setLang(detectLang());
  });

  /* ------------------------------------------------------------
     4b. NAV "MORE" DROPDOWN
  ------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    var moreBtn = document.getElementById("moreBtn");
    var moreMenu = document.getElementById("moreMenu");
    if (!moreBtn || !moreMenu) return;
    moreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      moreMenu.classList.toggle("open");
    });
    document.addEventListener("click", function () { moreMenu.classList.remove("open"); });
  });

  /* ------------------------------------------------------------
     4c. MOBILE NAV DRAWER (hamburger menu)
  ------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.getElementById("navToggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;

    function closeMenu() {
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      links.classList.remove("mobile-open");
      document.body.classList.remove("nav-locked");
    }
    function openMenu() {
      toggle.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      links.classList.add("mobile-open");
      document.body.classList.add("nav-locked");
    }

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      if (links.classList.contains("mobile-open")) { closeMenu(); } else { openMenu(); }
    });

    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    });
  });

  /* ------------------------------------------------------------
     5. MEMBERSHIP CHECKOUT MODAL (demo only, no real payment)
  ------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    var modal = document.getElementById("checkoutModal");
    if (!modal) return; // only present on index.html

    var step1 = document.getElementById("checkoutStep1");
    var step2 = document.getElementById("checkoutStep2");
    var step3 = document.getElementById("checkoutStep3");

    function showStep(step) {
      [step1, step2, step3].forEach(function (s) { s.classList.remove("active"); });
      step.classList.add("active");
    }
    function closeModal() { modal.classList.remove("open"); }

    document.querySelectorAll(".plan-btn[data-plan]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.getElementById("checkoutPlanName").textContent = btn.getAttribute("data-plan");
        document.getElementById("checkoutPlanPrice").textContent = btn.getAttribute("data-price");
        showStep(step1);
        modal.classList.add("open");
      });
    });

    document.getElementById("checkoutClose").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });

    document.getElementById("checkoutNext").addEventListener("click", function () {
      var name = document.getElementById("checkoutName").value.trim();
      var email = document.getElementById("checkoutEmail").value.trim();
      if (!name || !email) { alert("Please enter your name and email."); return; }
      showStep(step2);
    });
    document.getElementById("checkoutBack").addEventListener("click", function () { showStep(step1); });
    document.getElementById("checkoutPay").addEventListener("click", function () {
      var num = document.getElementById("ccNumber").value.trim();
      if (!num) { alert("Please enter a card number (demo — any digits work)."); return; }
      showStep(step3);
    });
    document.getElementById("checkoutDone").addEventListener("click", closeModal);
  });
})();
