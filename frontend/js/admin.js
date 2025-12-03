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

    // Card Layout + Delete Button
    container.innerHTML = data
      .map((d) => {
        const createdAt = new Date(d.createdAt).toLocaleDateString();

        return `
          <div class="drawing-card">
            <img src="${d.imageData}" alt="Drawing" />
            <div class="user-name">${d.user.name}</div>
            <div class="date">${createdAt}</div>

            <button class="delete-btn" data-id="${d.id}">Delete</button>
          </div>
        `;
      })
      .join("");

    // Add delete button handlers
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");

        if (!confirm("Are you sure you want to delete this drawing?")) return;

        const delRes = await fetch(
          `http://localhost:3000/api/admin/drawings/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (delRes.status === 200) {
          loadDrawings(); // refresh UI
        } else {
          alert("Failed to delete drawing.");
        }
      });
    });
  }

  loadDrawings();
});
