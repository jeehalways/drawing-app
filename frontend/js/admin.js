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
  document
    .getElementById("modeToggle")
    .addEventListener("click", () => document.body.classList.toggle("dark"));

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

    container.innerHTML = data
      .map(
        (d) => `
        <div style="margin-bottom:20px;">
          <h3>${d.user.name}</h3>
          <img src="${d.imageData}" width="200" />
        </div>
      `
      )
      .join("");
  }

  loadDrawings();
});
