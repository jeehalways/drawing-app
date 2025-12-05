// FIREBASE INIT (required for logout and auth checks)
firebase.initializeApp(firebaseConfig);

console.log("paint.js loaded");

//  AUTH PROTECTION + USER INFO
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    // No login → redirect to home
    window.location.href = "home.html";
    return;
  }

  // Display user info
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

// Basic State
let brushSize = 5;
let color = "#000000";
let erasing = false;
let currentTool = "brush";

// Shapes
let startX, startY;

// Undo/Redo
let history = [];
let redoStack = [];

// Canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let painting = false;

// Default background
canvas.style.background = "#ffffff";

// Prevent page scroll while touching canvas
canvas.addEventListener("touchstart", (e) => e.preventDefault(), {
  passive: false,
});
canvas.addEventListener("touchmove", (e) => e.preventDefault(), {
  passive: false,
});

// User ID from URL
const params = new URLSearchParams(window.location.search);
const userId = params.get("userId");

// Helper functions
function saveState() {
  history.push(canvas.toDataURL());
  if (history.length > 50) history.shift();
}

function restoreState(imgData) {
  const img = new Image();
  img.src = imgData;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
}

function undo() {
  if (history.length === 0) return;
  redoStack.push(canvas.toDataURL());
  const last = history.pop();
  restoreState(last);
}

function redo() {
  if (redoStack.length === 0) return;
  history.push(canvas.toDataURL());
  const img = redoStack.pop();
  restoreState(img);
}

// Tool selection
function selectTool(tool) {
  currentTool = tool;

  document
    .querySelectorAll(".tool-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .getElementById("tool" + tool.charAt(0).toUpperCase() + tool.slice(1))
    .classList.add("active");
}

document.getElementById("toolBrush").onclick = () => selectTool("brush");
document.getElementById("toolLine").onclick = () => selectTool("line");
document.getElementById("toolRect").onclick = () => selectTool("rect");
document.getElementById("toolCircle").onclick = () => selectTool("circle");

// UI events
document.getElementById("brushSize").addEventListener("input", (e) => {
  brushSize = Number(e.target.value);
});

document.getElementById("colorPicker").addEventListener("input", (e) => {
  color = e.target.value;
  erasing = false;
  document.getElementById("eraserBtn").classList.remove("active");
});

document.getElementById("eraserBtn").addEventListener("click", () => {
  erasing = !erasing;
  currentTool = "brush"; // eraser uses brush mechanics
  document.getElementById("eraserBtn").classList.toggle("active", erasing);
});

document.querySelectorAll(".swatch").forEach((btn) => {
  btn.addEventListener("click", () => {
    color = btn.dataset.color;
    erasing = false;
    document.getElementById("eraserBtn").classList.remove("active");
    document.getElementById("colorPicker").value = color;
  });
});

// Background color picker
document.getElementById("bgColorPicker").addEventListener("input", (e) => {
  canvas.style.background = e.target.value;
});

document.getElementById("modeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Undo / Redo
document.getElementById("undoBtn").onclick = undo;
document.getElementById("redoBtn").onclick = redo;

// Touch support helpers
function getPos(e) {
  const rect = canvas.getBoundingClientRect();

  if (e.touches && e.touches.length > 0) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  }

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

// Drawing logic
canvas.addEventListener("mousedown", start);
canvas.addEventListener("mouseup", stop);
canvas.addEventListener("mousemove", draw);

// Touch events
canvas.addEventListener("touchstart", (e) => start(e));
canvas.addEventListener("touchend", (e) => stop(e));
canvas.addEventListener("touchmove", (e) => draw(e));

function start(e) {
  saveState();
  painting = true;

  const pos = getPos(e);
  startX = pos.x;
  startY = pos.y;

  if (currentTool === "brush") draw(e);
}

function stop(e) {
  if (!painting) return;
  painting = false;

  const pos = getPos(e);
  const endX = pos.x;
  const endY = pos.y;

  ctx.lineWidth = brushSize;
  ctx.strokeStyle = erasing ? "#ffffff" : color;

  if (currentTool === "line") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  if (currentTool === "rect") {
    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
  }

  if (currentTool === "circle") {
    const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
}

function draw(e) {
  if (!painting) return;
  if (currentTool !== "brush") return;

  const pos = getPos(e);

  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = erasing ? "#ffffff" : color;

  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

// Action Buttons
document.getElementById("clearBtn").addEventListener("click", () => {
  saveState();
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

  res.status === 201
    ? alert("Drawing saved!")
    : alert("Failed to save drawing");
});

// Donwload drawings
document.getElementById("downloadBtn").addEventListener("click", () => {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "drawing.png";
  a.click();
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await firebase.auth().signOut();
    window.location.href = "home.html";
  } catch (err) {
    alert("Logout failed: " + err.message);
  }
});
