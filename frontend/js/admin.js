document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin page DOM loaded");

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Full dataset of drawings (for filtering)
  let allDrawings = [];
  let currentSearch = "";
  let currentSort = "newest";

  // Pagination state
  let currentPage = 1;
  const pageSize = 9;

  // Token refresh / logout handler
  firebase.auth().onIdTokenChanged(async (user) => {
    if (user) {
      const newToken = await user.getIdToken(true);
      localStorage.setItem("adminToken", newToken);
    } else {
      localStorage.removeItem("adminToken");
      window.location.href = "admin-login.html";
    }
  });

  // Check token
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "admin-login.html";
    return;
  }

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await firebase.auth().signOut();
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
  });

  // Theme toggle
  document.getElementById("modeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  // SORTING FUNCTION
  function sortDrawings(data) {
    let sorted = [...data];

    switch (currentSort) {
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "az":
        sorted.sort((a, b) => a.user.name.localeCompare(b.user.name));
        break;
      case "za":
        sorted.sort((a, b) => b.user.name.localeCompare(a.user.name));
        break;
    }

    return sorted;
  }

  // Filter + Sort together
  function getFilteredAndSorted() {
    const filtered = allDrawings.filter((d) =>
      d.user.name.toLowerCase().includes(currentSearch.toLowerCase())
    );

    return sortDrawings(filtered);
  }

  // Pagination
  function getPaginatedData(data) {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }

  function updatePageIndicator(totalPages) {
    document.getElementById(
      "pageIndicator"
    ).textContent = `Page ${currentPage} of ${totalPages}`;
  }

  // User profile modal function
  function openUserProfile(userId) {
    const userModal = document.getElementById("userModal");
    const nameEl = document.getElementById("profileName");
    const statsEl = document.getElementById("profileStats");
    const drawingsContainer = document.getElementById("profileDrawings");

    // Find all drawings by this user
    const userDrawings = allDrawings.filter((d) => d.userId === userId);

    if (userDrawings.length === 0) return;

    const userName = userDrawings[0].user.name;

    nameEl.textContent = userName;
    statsEl.textContent = `Total drawings: ${userDrawings.length}`;

    drawingsContainer.innerHTML = userDrawings
      .map(
        (d) => `
      <img src="${d.imageData}" class="profile-thumb" />
    `
      )
      .join("");

    userModal.classList.remove("hidden");

    // Zoom inside modal
    document.querySelectorAll(".profile-thumb").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        document.getElementById("zoomImage").src = thumb.src;
        document.getElementById("zoomModal").classList.remove("hidden");
      });
    });
  }

  // Render cards
  function renderFilteredDrawings(drawings) {
    const container = document.getElementById("drawings");

    const totalPages = Math.ceil(drawings.length / pageSize);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const paginated = getPaginatedData(drawings);

    container.innerHTML = paginated
      .map((d) => {
        const createdAt = new Date(d.createdAt).toLocaleDateString();

        return `
          <div class="drawing-card">
            <img src="${d.imageData}" alt="Drawing" />

            <div class="user-name user-profile-btn" data-user="${d.userId}">
              ${d.user.name}
            </div>

            <div class="date">${createdAt}</div>

            <button class="download-btn" data-src="${d.imageData}">Download</button>
            <button class="delete-btn" data-id="${d.id}">Delete</button>
          </div>
        `;
      })
      .join("");

    updatePageIndicator(totalPages);

    // Delete button handlers
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

    // Download button handlers
    document.querySelectorAll(".download-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const src = btn.getAttribute("data-src");

        const link = document.createElement("a");
        link.href = src;
        link.download = "drawing.png";
        link.click();
      });
    });

    // Zoom modal
    document.querySelectorAll(".drawing-card img").forEach((img) => {
      img.addEventListener("click", () => {
        document.getElementById("zoomImage").src = img.src;
        document.getElementById("zoomModal").classList.remove("hidden");
      });
    });

    // User profile click handler
    document.querySelectorAll(".user-profile-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const userId = btn.getAttribute("data-user");
        openUserProfile(userId);
      });
    });
  }

  // Close image zoom modal
  document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("zoomModal").classList.add("hidden");
  });

  document.getElementById("zoomModal").addEventListener("click", (e) => {
    if (e.target.id === "zoomModal") {
      document.getElementById("zoomModal").classList.add("hidden");
    }
  });

  // Close user profile modal
  document.getElementById("closeUserModal").addEventListener("click", () => {
    document.getElementById("userModal").classList.add("hidden");
  });

  document.getElementById("userModal").addEventListener("click", (e) => {
    if (e.target.id === "userModal") {
      document.getElementById("userModal").classList.add("hidden");
    }
  });

  // Load all drawings from backend
  async function loadDrawings() {
    const res = await fetch("http://localhost:3000/api/admin/drawings", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status !== 200) {
      alert("Unauthorized");
      window.location.href = "admin-login.html";
      return;
    }

    // Save full dataset for filtering
    allDrawings = await res.json();
    renderFilteredDrawings(getFilteredAndSorted());
  }

  loadDrawings();

  // Search handler
  document.getElementById("searchInput").addEventListener("input", (e) => {
    currentSearch = e.target.value.toLowerCase();
    currentPage = 1;
    renderFilteredDrawings(getFilteredAndSorted());
  });

  // Sort handler
  document.getElementById("sortSelect").addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderFilteredDrawings(getFilteredAndSorted());
  });

  // Pagination buttons
  document.getElementById("prevPageBtn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderFilteredDrawings(getFilteredAndSorted());
    }
  });

  document.getElementById("nextPageBtn").addEventListener("click", () => {
    const totalPages = Math.ceil(getFilteredAndSorted().length / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      renderFilteredDrawings(getFilteredAndSorted());
    }
  });
});
