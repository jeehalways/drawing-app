console.log("admin-login.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");

  // Firebase auth
  const auth = firebase.auth();

  // Auto-refresh token
  firebase.auth().onIdTokenChanged(async (user) => {
    if (user) {
      const token = await user.getIdToken(true);
      localStorage.setItem("adminToken", token);
      console.log("Token refreshed");
    }
  });

  // Theme toggle
  document
    .getElementById("modeToggle")
    .addEventListener("click", () => document.body.classList.toggle("dark"));

  // Email/password login
  document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const userCred = await auth.signInWithEmailAndPassword(email, password);
      const token = await userCred.user.getIdToken();

      localStorage.setItem("adminToken", token);
      window.location.href = "admin.html";
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });

  // Google login
  document.getElementById("googleBtn").addEventListener("click", async () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
      const result = await auth.signInWithPopup(provider);
      const token = await result.user.getIdToken();

      localStorage.setItem("adminToken", token);
      window.location.href = "admin.html";
    } catch (err) {
      alert("Google login failed: " + err.message);
    }
  });
});

// Back to Home button
document.getElementById("backHomeBtn").addEventListener("click", () => {
  window.location.href = "home.html";
});
