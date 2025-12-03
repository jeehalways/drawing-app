document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin page DOM loaded");

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Full dataset of drawings (for filtering)
  let allDrawings = [];

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

  // Filter Render Function

  function renderFilteredDrawings(data) {
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

    // Delete Handlers
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
          loadDrawings(); // refresh entire list
        } else {
          alert("Failed to delete drawing.");
        }
      });
    });

    // Zoom Handlers
    document.querySelectorAll(".drawing-card img").forEach((img) => {
      img.addEventListener("click", () => {
        const zoomModal = document.getElementById("zoomModal");
        const zoomImg = document.getElementById("zoomImage");

        zoomImg.src = img.src;
        zoomModal.classList.remove("hidden");
      });
    });
  }

  // Load All Drawings
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

    // Save full dataset for filtering
    allDrawings = await res.json();

    // Initial render
    renderFilteredDrawings(allDrawings);
  }

  loadDrawings();

  // Search bar event listener
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const search = e.target.value.toLowerCase();

      const filtered = allDrawings.filter((d) =>
        d.user.name.toLowerCase().includes(search)
      );

      renderFilteredDrawings(filtered);
    });
  }

  // Modal close events

  document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("zoomModal").classList.add("hidden");
  });

  document.getElementById("zoomModal").addEventListener("click", (e) => {
    if (e.target.id === "zoomModal") {
      document.getElementById("zoomModal").classList.add("hidden");
    }
  });
});
