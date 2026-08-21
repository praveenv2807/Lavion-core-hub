(function () {
  "use strict";

  var BOOKINGS = [
    { member: "Rahul K.", cls: "Strength Forge", date: "Jul 10", time: "06:00", status: "confirmed" },
    { member: "Sara P.", cls: "Recovery Bay", date: "Jul 10", time: "17:30", status: "confirmed" },
    { member: "Arjun M.", cls: "Conditioning Line", date: "Jul 11", time: "18:00", status: "pending" },
    { member: "Divya L.", cls: "Strength Forge", date: "Jul 11", time: "06:00", status: "confirmed" },
    { member: "Vikram N.", cls: "Recovery Bay", date: "Jul 12", time: "19:00", status: "confirmed" },
    { member: "Priya J.", cls: "Conditioning Line", date: "Jul 12", time: "17:30", status: "pending" },
    { member: "Karan S.", cls: "Strength Forge", date: "Jul 13", time: "06:00", status: "confirmed" },
    { member: "Meera T.", cls: "Recovery Bay", date: "Jul 13", time: "09:00", status: "confirmed" }
  ];

  var MEMBERS_DEFAULT = [
    { name: "Rahul K.", plan: "Coached", joined: "Nov 2025", status: "active" },
    { name: "Sara P.", plan: "All Access", joined: "Jul 2025", status: "active" },
    { name: "Arjun M.", plan: "Coached", joined: "Feb 2026", status: "active" },
    { name: "Divya L.", plan: "Floor Access", joined: "Apr 2026", status: "active" },
    { name: "Vikram N.", plan: "All Access", joined: "May 2024", status: "active" },
    { name: "Priya J.", plan: "Floor Access", joined: "Jun 2026", status: "pending" },
    { name: "Karan S.", plan: "Coached", joined: "Jan 2026", status: "active" },
    { name: "Meera T.", plan: "All Access", joined: "Mar 2026", status: "active" }
  ];

  var MEMBERS_KEY = "lavion_admin_members";

  function loadMembers() {
    try {
      var stored = localStorage.getItem(MEMBERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) { /* ignore, fall through to defaults */ }
    return MEMBERS_DEFAULT.slice();
  }

  function saveMembers(list) {
    try { localStorage.setItem(MEMBERS_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable, skip */ }
  }

  var MEMBERS = loadMembers();

  function pill(status) {
    return '<span class="status-pill ' + status + '">' + status + '</span>';
  }

  var MEMBER_COUNT_BASELINE = 1192; // matches assets/js/main.js — keeps homepage stat and admin overview in sync

  function formatCount(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function renderOverview() {
    var rows = BOOKINGS.slice(0, 5).map(function (b) {
      return "<tr><td>" + b.member + "</td><td>" + b.cls + "</td><td>" + b.date + "</td><td>" + pill(b.status) + "</td></tr>";
    }).join("");
    document.getElementById("overviewBookings").innerHTML = rows;
    var countEl = document.getElementById("overviewMemberCount");
    if (countEl) countEl.textContent = formatCount(MEMBER_COUNT_BASELINE + MEMBERS.length);
  }

  function renderBookings(filter) {
    filter = (filter || "").toLowerCase();
    var rows = BOOKINGS.filter(function (b) {
      return !filter || b.member.toLowerCase().indexOf(filter) > -1 || b.cls.toLowerCase().indexOf(filter) > -1;
    }).map(function (b) {
      return "<tr><td>" + b.member + "</td><td>" + b.cls + "</td><td>" + b.date + "</td><td>" + b.time + "</td><td>" + pill(b.status) + "</td></tr>";
    }).join("");
    document.getElementById("allBookings").innerHTML = rows || '<tr><td colspan="5" style="color:var(--mist)">No matches</td></tr>';
  }

  function renderMembers(filter) {
    filter = (filter || "").toLowerCase();
    var rows = MEMBERS.filter(function (m) {
      return !filter || m.name.toLowerCase().indexOf(filter) > -1 || m.plan.toLowerCase().indexOf(filter) > -1;
    }).map(function (m) {
      return "<tr><td>" + m.name + "</td><td>" + m.plan + "</td><td>" + m.joined + "</td><td>" + pill(m.status) + "</td></tr>";
    }).join("");
    document.getElementById("membersTable").innerHTML = rows || '<tr><td colspan="4" style="color:var(--mist)">No matches</td></tr>';
  }

  var currentPanel = "overview";
  var TITLES = { overview: "Overview", bookings: "Bookings", members: "Members", content: "Content" };

  function switchPanel(name) {
    currentPanel = name;
    ["overview", "bookings", "members", "content"].forEach(function (p) {
      document.getElementById("panel-" + p).style.display = p === name ? "" : "none";
    });
    document.getElementById("panelTitle").textContent = TITLES[name];
    document.querySelectorAll(".admin-nav a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-panel") === name);
    });
    document.getElementById("adminSearch").value = "";
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderOverview();
    renderBookings("");
    renderMembers("");

    document.querySelectorAll(".admin-nav a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        switchPanel(a.getAttribute("data-panel"));
      });
    });

    document.getElementById("adminSearch").addEventListener("input", function (e) {
      var v = e.target.value;
      if (currentPanel === "bookings") renderBookings(v);
      if (currentPanel === "members") renderMembers(v);
    });

    /* Add Member modal */
    var addModal = document.getElementById("addMemberModal");
    document.getElementById("openAddMember").addEventListener("click", function () {
      addModal.classList.add("open");
    });
    document.getElementById("addMemberClose").addEventListener("click", function () {
      addModal.classList.remove("open");
    });
    addModal.addEventListener("click", function (e) { if (e.target === addModal) addModal.classList.remove("open"); });

    document.getElementById("addMemberSubmit").addEventListener("click", function () {
      var name = document.getElementById("newMemberName").value.trim();
      var email = document.getElementById("newMemberEmail").value.trim();
      var plan = document.getElementById("newMemberPlan").value;
      var status = document.getElementById("newMemberStatus").value;
      if (!name || !email) { alert("Please enter a name and email."); return; }

      var joined = new Date().toLocaleDateString(undefined, { month: "short", year: "numeric" });
      MEMBERS.unshift({ name: name, plan: plan, joined: joined, status: status });
      saveMembers(MEMBERS);
      renderMembers(document.getElementById("adminSearch").value);
      renderOverview();

      document.getElementById("newMemberName").value = "";
      document.getElementById("newMemberEmail").value = "";
      addModal.classList.remove("open");
    });
  });
})();
