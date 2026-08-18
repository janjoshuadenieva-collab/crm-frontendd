const defaultGuests = [
  {
    guest_id: 1,
    first_name: "Christian",
    last_name: "Bautista",
    contact_number: "0917-123-4567",
    email: "christian.bautista@email.com",
    address: "Dagupan City, Pangasinan",
    status: "active",
    loyalty_tier: "Gold",
    loyalty_points: 1250,
    preferences: ["Non-smoking room", "High floor", "Extra pillow"],
    feedback: [
      { date: "2026-06-10", rating: 5, comment: "Great service, very clean room." },
      { date: "2026-07-02", rating: 4, comment: "Breakfast could have more options." }
    ]
  },
  {
    guest_id: 2,
    first_name: "Naruto",
    last_name: "Uzumaki",
    contact_number: "0928-555-2211",
    email: "naruto.uzumaki@email.com",
    address: "Baguio City, Benguet",
    status: "active",
    loyalty_tier: "Silver",
    loyalty_points: 620,
    preferences: ["Ocean view", "Late checkout"],
    feedback: [
      { date: "2026-05-20", rating: 5, comment: "Loved the view from the room!" }
    ]
  },
  {
    guest_id: 3,
    first_name: "Johny",
    last_name: "Sins",
    contact_number: "0917-888-9900",
    email: "sins.johny@email.com",
    address: "Manila City",
    status: "inactive",
    loyalty_tier: "Bronze",
    loyalty_points: 150,
    preferences: ["Vegetarian meals"],
    feedback: [
      { date: "2026-04-15", rating: 3, comment: "Room was okay, aircon was noisy." }
    ]
  },
  {
    guest_id: 4,
    first_name: "Charles",
    last_name: "Guardiana",
    contact_number: "0919-321-6540",
    email: "charles.guardiana@email.com",
    address: "Sta. Barbara, Pangasinan",
    status: "active",
    loyalty_tier: "Platinum",
    loyalty_points: 3200,
    preferences: ["King size bed", "Airport pickup"],
    feedback: [
      { date: "2026-07-11", rating: 5, comment: "Best hotel experience so far!" },
      { date: "2026-08-01", rating: 5, comment: "Staff were very accommodating." }
    ]
  }
];


function getGuests() {
  let data = localStorage.getItem("violaceos_guests");
  if (!data) {
    localStorage.setItem("violaceos_guests", JSON.stringify(defaultGuests));
    return defaultGuests;
  }
  return JSON.parse(data);
}

function saveGuests(guests) {
  localStorage.setItem("violaceos_guests", JSON.stringify(guests));
}

function getGuestById(id) {
  return getGuests().find(g => g.guest_id === Number(id));
}

function getNextGuestId(guests) {
  return guests.length ? Math.max(...guests.map(g => g.guest_id)) + 1 : 1;
}

function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function renderStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += i <= rating ? "★" : "☆";
  }
  return `<span class="stars">${stars}</span>`;
}

function tierBadgeClass(tier) {
  switch (tier) {
    case "Gold": return "badge-gold";
    case "Silver": return "badge-silver";
    case "Bronze": return "badge-bronze";
    case "Platinum": return "badge-platinum";
    default: return "badge-silver";
  }
}

function loadDashboard() {
  const guests = getGuests();
  document.getElementById("statTotalGuests").textContent = guests.length;
  document.getElementById("statActiveGuests").textContent =
    guests.filter(g => g.status === "active").length;

  const totalFeedback = guests.reduce((sum, g) => sum + g.feedback.length, 0);
  document.getElementById("statFeedback").textContent = totalFeedback;

  const avgRating =
    guests.flatMap(g => g.feedback.map(f => f.rating)).reduce((a, b) => a + b, 0) /
    (guests.flatMap(g => g.feedback).length || 1);
  document.getElementById("statAvgRating").textContent = avgRating.toFixed(1) + " / 5";

  
  const tbody = document.getElementById("recentGuestsBody");
  tbody.innerHTML = "";
  guests.slice(-5).reverse().forEach(g => {
    tbody.innerHTML += `
      <tr>
        <td>${g.guest_id}</td>
        <td>${g.first_name} ${g.last_name}</td>
        <td>${g.email}</td>
        <td><span class="badge ${tierBadgeClass(g.loyalty_tier)}">${g.loyalty_tier}</span></td>
        <td><a href="pages/guest-profile.html?id=${g.guest_id}" class="btn btn-small btn-outline">View</a></td>
      </tr>`;
  });
}

function loadGuestsTable(filter = "") {
  const guests = getGuests();
  const tbody = document.getElementById("guestsTableBody");
  tbody.innerHTML = "";

  const filtered = guests.filter(g => {
    const fullName = (g.first_name + " " + g.last_name).toLowerCase();
    return fullName.includes(filter.toLowerCase()) ||
           g.email.toLowerCase().includes(filter.toLowerCase());
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No guests found.</td></tr>`;
    return;
  }

  filtered.forEach(g => {
    tbody.innerHTML += `
      <tr>
        <td>${g.guest_id}</td>
        <td>${g.first_name} ${g.last_name}</td>
        <td>${g.contact_number}</td>
        <td>${g.email}</td>
        <td><span class="badge ${g.status === "active" ? "badge-active" : "badge-inactive"}">${g.status}</span></td>
        <td><span class="badge ${tierBadgeClass(g.loyalty_tier)}">${g.loyalty_tier}</span></td>
        <td>
          <a href="guest-profile.html?id=${g.guest_id}" class="btn btn-small btn-outline">View</a>
          <button class="btn btn-small btn-danger" onclick="deleteGuest(${g.guest_id})">Delete</button>
        </td>
      </tr>`;
  });
}

function deleteGuest(id) {
  if (!confirm("Delete this guest record?")) return;
  let guests = getGuests().filter(g => g.guest_id !== id);
  saveGuests(guests);
  loadGuestsTable(document.getElementById("searchInput").value);
}

function handleAddGuestForm(event) {
  event.preventDefault();
  const guests = getGuests();

  const newGuest = {
    guest_id: getNextGuestId(guests),
    first_name: document.getElementById("firstName").value.trim(),
    last_name: document.getElementById("lastName").value.trim(),
    contact_number: document.getElementById("contactNumber").value.trim(),
    email: document.getElementById("email").value.trim(),
    address: document.getElementById("address").value.trim(),
    status: "active",
    loyalty_tier: "Bronze",
    loyalty_points: 0,
    preferences: [],
    feedback: []
  };

  guests.push(newGuest);
  saveGuests(guests);
  event.target.reset();
  document.getElementById("addGuestPanel").style.display = "none";
  loadGuestsTable("");
}

function toggleAddGuestPanel() {
  const panel = document.getElementById("addGuestPanel");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}


function loadGuestProfile() {
  const id = getParam("id");
  const guest = getGuestById(id);

  if (!guest) {
    document.getElementById("profileContent").innerHTML =
      "<p>Guest not found.</p>";
    return;
  }

  document.getElementById("guestFullName").textContent =
    `${guest.first_name} ${guest.last_name}`;
  document.getElementById("guestInitials").textContent =
    (guest.first_name[0] || "") + (guest.last_name[0] || "");
  document.getElementById("guestEmail").textContent = guest.email;
  document.getElementById("guestContact").textContent = guest.contact_number;
  document.getElementById("guestAddress").textContent = guest.address;
  document.getElementById("guestStatus").innerHTML =
    `<span class="badge ${guest.status === "active" ? "badge-active" : "badge-inactive"}">${guest.status}</span>`;

  const prefList = document.getElementById("preferencesList");
  prefList.innerHTML = "";
  if (guest.preferences.length === 0) {
    prefList.innerHTML = "<li>No preferences recorded yet.</li>";
  } else {
    guest.preferences.forEach(p => {
      prefList.innerHTML += `<li>${p}</li>`;
    });
  }

 
  const feedbackWrap = document.getElementById("feedbackList");
  feedbackWrap.innerHTML = "";
  if (guest.feedback.length === 0) {
    feedbackWrap.innerHTML = "<p>No feedback submitted yet.</p>";
  } else {
    guest.feedback.forEach(f => {
      feedbackWrap.innerHTML += `
        <div class="feedback-item">
          <div>${renderStars(f.rating)} <strong>${f.date}</strong></div>
          <p>${f.comment}</p>
        </div>`;
    });
  }

  
  document.getElementById("loyaltyTier").innerHTML =
    `<span class="badge ${tierBadgeClass(guest.loyalty_tier)}">${guest.loyalty_tier}</span>`;
  document.getElementById("loyaltyPoints").textContent = guest.loyalty_points;
}

function addPreference() {
  const id = getParam("id");
  const input = document.getElementById("newPreference");
  const value = input.value.trim();
  if (!value) return;

  const guests = getGuests();
  const guest = guests.find(g => g.guest_id === Number(id));
  guest.preferences.push(value);
  saveGuests(guests);
  input.value = "";
  loadGuestProfile();
}

function addFeedback() {
  const id = getParam("id");
  const rating = document.getElementById("newRating").value;
  const comment = document.getElementById("newComment").value.trim();
  if (!comment) return;

  const guests = getGuests();
  const guest = guests.find(g => g.guest_id === Number(id));
  guest.feedback.push({
    date: new Date().toISOString().split("T")[0],
    rating: Number(rating),
    comment: comment
  });
  saveGuests(guests);
  document.getElementById("newComment").value = "";
  loadGuestProfile();
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.getElementById("tabBtn-" + tabName).classList.add("active");
  document.getElementById("tab-" + tabName).classList.add("active");
}


function loadAllFeedback() {
  const guests = getGuests();
  const wrap = document.getElementById("allFeedbackList");
  wrap.innerHTML = "";

  let allFeedback = [];
  guests.forEach(g => {
    g.feedback.forEach(f => {
      allFeedback.push({ ...f, guestName: `${g.first_name} ${g.last_name}`, guest_id: g.guest_id });
    });
  });

  allFeedback.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (allFeedback.length === 0) {
    wrap.innerHTML = "<p>No feedback records yet.</p>";
    return;
  }

  allFeedback.forEach(f => {
    wrap.innerHTML += `
      <div class="feedback-item">
        <div>${renderStars(f.rating)} <strong>${f.guestName}</strong> — ${f.date}</div>
        <p>${f.comment}</p>
      </div>`;
  });
}

function loadLoyaltyTable() {
  const guests = getGuests();
  const tbody = document.getElementById("loyaltyTableBody");
  tbody.innerHTML = "";

  const sorted = [...guests].sort((a, b) => b.loyalty_points - a.loyalty_points);

  sorted.forEach(g => {
    tbody.innerHTML += `
      <tr>
        <td>${g.guest_id}</td>
        <td>${g.first_name} ${g.last_name}</td>
        <td><span class="badge ${tierBadgeClass(g.loyalty_tier)}">${g.loyalty_tier}</span></td>
        <td>${g.loyalty_points} pts</td>
        <td><a href="guest-profile.html?id=${g.guest_id}" class="btn btn-small btn-outline">View Profile</a></td>
      </tr>`;
  });
}

function switchAuthTab(tab) {
  document.querySelectorAll(".auth-tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".auth-panel").forEach(panel => panel.classList.remove("active"));
  document.getElementById("tabBtn-" + tab).classList.add("active");
  document.getElementById("panel-" + tab).classList.add("active");
}

function handleLogin(event) {
  event.preventDefault();
  window.location.href = "index.html";
}

function handleSignup(event) {
  event.preventDefault();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("signupConfirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match. Please try again.");
    return;
  }

  window.location.href = "index.html";
}


function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebarOverlay").classList.toggle("show");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("show");
}


document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeSidebar);
    });
  }
});
