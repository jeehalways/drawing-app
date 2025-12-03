document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin page DOM loaded");

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Handle token refresh / logout
  firebase.auth().onIdTokenChanged(async (user) => {
    if (user) {
      const newToken = await user.getIdToken(true);
      localStorage.setItem("adminToken", newToken);
    } else {
      localStorage.removeItem("adminToken");
      window.location.href = "admin-login.html";
    }
  });

  // Check token exists
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "admin-login.html";
    return;
  }

  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await firebase.auth().signOut();
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
  });

  // Theme toggle
  document.getElementById("modeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  // Load drawings
  async function loadDrawings() {
    const res = await fetch("http://localhost:3000/api/admin/drawings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status !== 200) {
      alert("Unauthorized");
      window.location.href = "admin-login.html";
      return;
    }

    const data = await res.json();
    const container = document.getElementById("drawings");

    // Card Layout
    container.innerHTML = data
      .map((d) => {
        const createdAt = new Date(d.createdAt).toLocaleDateString();

        return `
          <div class="drawing-card">
            <img src="${d.imageData}" alt="Drawing" />
            <div class="user-name">${d.user.name}</div>
            <div class="date">${createdAt}</div>
          </div>
        `;
      })
      .join("");
  }

  loadDrawings();
});
