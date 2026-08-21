(function () {
  "use strict";

  var PROGRAMS = ["Strength Forge", "Conditioning Line", "Recovery Bay"];
  var DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  var DAY_LABELS = {
    en: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    ta: ["திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி","ஞாயிறு"],
    hi: ["सोम","मंगल","बुध","गुरु","शुक्र","शनि","रवि"],
    ar: ["الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت","الأحد"],
    fr: ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"],
    es: ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],
    de: ["Mo","Di","Mi","Do","Fr","Sa","So"],
    it: ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"],
    ml: ["തിങ്കൾ","ചൊവ്വ","ബുധൻ","വ്യാഴം","വെള്ളി","ശനി","ഞായർ"],
    te: ["సోమ","మంగళ","బుధ","గురు","శుక్ర","శని","ఆది"]
  };
  function currentDayLabels() {
    var lang = "en";
    try { lang = localStorage.getItem("lavion_lang") || "en"; } catch (e) {}
    return DAY_LABELS[lang] || DAY_LABELS.en;
  }

  // Fixed weekly template: each day gets 2-3 class slots (recurs every week for this demo)
  var TEMPLATE = {
    Mon: [{ t: "06:00", c: "Strength Forge" }, { t: "17:30", c: "Conditioning Line" }],
    Tue: [{ t: "06:00", c: "Recovery Bay" }, { t: "18:00", c: "Strength Forge" }],
    Wed: [{ t: "06:00", c: "Strength Forge" }, { t: "17:30", c: "Conditioning Line" }, { t: "19:00", c: "Recovery Bay" }],
    Thu: [{ t: "06:00", c: "Conditioning Line" }, { t: "18:00", c: "Strength Forge" }],
    Fri: [{ t: "06:00", c: "Strength Forge" }, { t: "17:30", c: "Recovery Bay" }],
    Sat: [{ t: "08:00", c: "Conditioning Line" }, { t: "09:30", c: "Strength Forge" }],
    Sun: [{ t: "09:00", c: "Recovery Bay" }]
  };

  var weekOffset = 0;
  var activeFilter = "all";
  var bookedKeys = {}; // in-memory only, resets on page reload
  var pendingBooking = null;

  function getMonday(offset) {
    var d = new Date();
    var day = d.getDay(); // 0 = Sun
    var diffToMon = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diffToMon + offset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function fmtDate(d) {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function renderWeek() {
    var monday = getMonday(weekOffset);
    var sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
    document.getElementById("weekLabel").textContent = fmtDate(monday) + " – " + fmtDate(sunday);

    var grid = document.getElementById("dayGrid");
    grid.innerHTML = "";

    var labels = currentDayLabels();
    DAY_NAMES.forEach(function (dayName, i) {
      var dateForDay = new Date(monday); dateForDay.setDate(dateForDay.getDate() + i);
      var col = document.createElement("div");
      col.className = "day-col";

      var label = document.createElement("div");
      label.className = "day-name";
      label.textContent = labels[i] + " · " + fmtDate(dateForDay);
      col.appendChild(label);

      var slots = TEMPLATE[dayName].filter(function (s) {
        return activeFilter === "all" || s.c === activeFilter;
      });

      if (slots.length === 0) {
        var empty = document.createElement("div");
        empty.style.color = "var(--mist)";
        empty.style.fontSize = "0.78rem";
        empty.textContent = "—";
        col.appendChild(empty);
      }

      slots.forEach(function (s) {
        var key = weekOffset + "_" + dayName + "_" + s.t + "_" + s.c;
        var el = document.createElement("div");
        el.className = "slot" + (bookedKeys[key] ? " booked" : "");
        el.innerHTML = '<span class="time">' + s.t + '</span><span class="cls">' + s.c + '</span>';
        el.addEventListener("click", function () {
          if (bookedKeys[key]) return;
          openBooking(labels[i], fmtDate(dateForDay), s.t, s.c, key);
        });
        col.appendChild(el);
      });

      grid.appendChild(col);
    });
  }

  function openBooking(dayName, dateLabel, time, cls, key) {
    pendingBooking = key;
    document.getElementById("bookSummary").textContent = cls + " — " + dayName + ", " + dateLabel + " at " + time;
    document.getElementById("bookStep1").classList.add("active");
    document.getElementById("bookStep2").classList.remove("active");
    document.getElementById("bookingModal").classList.add("open");
  }

  function closeBooking() {
    document.getElementById("bookingModal").classList.remove("open");
    pendingBooking = null;
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderWeek();

    document.getElementById("prevWeek").addEventListener("click", function () { weekOffset--; renderWeek(); });
    document.getElementById("nextWeek").addEventListener("click", function () { weekOffset++; renderWeek(); });

    document.querySelectorAll(".filter-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        document.querySelectorAll(".filter-chip").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        activeFilter = chip.getAttribute("data-filter");
        renderWeek();
      });
    });

    document.getElementById("bookingClose").addEventListener("click", closeBooking);
    document.getElementById("bookingModal").addEventListener("click", function (e) {
      if (e.target.id === "bookingModal") closeBooking();
    });

    document.getElementById("bookConfirm").addEventListener("click", function () {
      var name = document.getElementById("bookName").value.trim();
      var email = document.getElementById("bookEmail").value.trim();
      if (!name || !email) { alert("Please enter your name and email."); return; }
      if (pendingBooking) bookedKeys[pendingBooking] = true;
      document.getElementById("bookStep1").classList.remove("active");
      document.getElementById("bookStep2").classList.add("active");
      renderWeek();
    });

    document.getElementById("bookDone").addEventListener("click", closeBooking);
  });
})();
