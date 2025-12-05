// FIREBASE INIT (required for logout and auth checks)
firebase.initializeApp(firebaseConfig);

console.log("paint.js loaded");

// 2. PROTECT THIS PAGE — Require valid Firebase login
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    // No login → redirect to home
    window.location.href = "home.html";
    return;
  }

  // Display user info on screen
  document.getElementById("userName").textContent = `Welcome ${
    user.displayName || "User"
  }`;
  document.getElementById("userEmail").textContent = user.email || "";
  document.getElementById("userInfo").classList.remove("hidden");

  if (user.photoURL) {
    document.getElementById("userAvatar").src = user.photoURL;
  }

  // Fetch fresh token
  const token = await user.getIdToken(true);
  localStorage.setItem("userToken", token);
});

// Simple in-memory state
let brushSize = 5;
let color = "#000000";
let erasing = false;

//  Canvas Setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let painting = false;

// User ID from URL
const params = new URLSearchParams(window.location.search);
const userId = params.get("userId");

// UI events
document.getElementById("brushSize").addEventListener("input", (e) => {
  brushSize = Number(e.target.value);
});

document.getElementById("colorPicker").addEventListener("input", (e) => {
  color = e.target.value;
  erasing = false;
  document.getElementById("eraserBtn").classList.remove("active");
});

document.getElementById("modeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

document.getElementById("eraserBtn").addEventListener("click", () => {
  erasing = !erasing;
  document.getElementById("eraserBtn").classList.toggle("active", erasing);
});

// Drawing logic
canvas.addEventListener("mousedown", start);
canvas.addEventListener("mouseup", stop);
canvas.addEventListener("mousemove", draw);

function start(e) {
  painting = true;
  draw(e);
}

function stop() {
  painting = false;
  ctx.beginPath();
}

function draw(e) {
  if (!painting) return;

  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = erasing ? "#ffffff" : color;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

// Clear canvas
document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Save to backend
document.getElementById("saveBtn").addEventListener("click", async () => {
  const imageData = canvas.toDataURL("image/png");

  const res = await fetch("http://localhost:3000/api/drawings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, imageData }),
  });

  if (res.status === 201) {
    alert("Drawing saved!");
  } else {
    alert("Failed to save drawing");
  }
});

// Donwload drawings
document.getElementById("downloadBtn").addEventListener("click", () => {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "drawing.png";
  a.click();
});

// Logout button
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await firebase.auth().signOut(); // logout from google/github/firebase
    window.location.href = "home.html"; // redirect to login/QR page
  } catch (err) {
    alert("Logout failed: " + err.message);
  }
});
