console.log("paint-auth.js loaded");

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

// This prevents paint.js from running before auth is ready
window.paintReady = false;

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    console.warn("User NOT logged in → redirecting.");
    window.location.href = "home.html";
    return;
  }

  // Get Firebase ID token
  const token = await user.getIdToken();

  // Verify user in backend
  const res = await fetch("http://localhost:3000/api/register/firebase/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();

  if (res.status !== 200) {
    console.warn("Backend rejected token → redirecting.");
    window.location.href = "home.html";
    return;
  }

  // Save userId globally so paint.js can use it
  window.userId = data.userId;

  console.log("Auth OK → starting paint app");
  window.paintReady = true;
});
