console.log("paint.js loaded");

//  AUTH PROTECTION + USER INFO
// User ID from URL (shared by manual + Firebase users)
const params = new URLSearchParams(window.location.search);
const userId = params.get("userId");

//  AUTH PROTECTION + USER INFO
firebase.auth().onAuthStateChanged(async (user) => {
  // CASE 1: no Firebase user AND no userId in URL → not allowed here
  if (!user && !userId) {
    window.location.href = "home.html";
    return;
  }

  // CASE 2: Firebase user (Google/GitHub) → show full profile
  if (user) {
    document.getElementById("userName").textContent = `Welcome, ${
      user.displayName || "User"
    }!`;
    document.getElementById("userEmail").textContent = user.email || "";
    document.getElementById("userInfo").classList.remove("hidden");

    if (user.photoURL) {
      document.getElementById("userAvatar").src = user.photoURL;
    }

    const token = await user.getIdToken(true);
    localStorage.setItem("userToken", token);
    return;
  }

  // CASE 3: manual user (no Firebase user, but userId present in URL)
  if (!user && userId) {
    console.log("Manual user detected → fetching profile...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/register/${userId}`);
      const manualUser = await res.json();

      // Display name
      document.getElementById("userName").textContent = manualUser.name
        ? `Welcome, ${manualUser.name}!`
        : "Welcome!";

      // Manual users have no email
      document.getElementById("userEmail").textContent = "";

      // Display manual avatar
      if (manualUser.avatar) {
        document.getElementById("userAvatar").src = manualUser.avatar;
        document.getElementById("userAvatar").classList.remove("hidden");
      }

      document.getElementById("userInfo").classList.remove("hidden");
    } catch (err) {
      console.error("Could not load manual user:", err);

      document.getElementById("userName").textContent = "Welcome!";
      document.getElementById("userInfo").classList.remove("hidden");
    }
  }
});

// Basic State
let brushSize = 5;
let color = "#000000";
let erasing = false;
let currentTool = "brush";
let brushType = "smooth"; // smooth, pencil, marker, watercolor

// Extra tools state
let currentPressure = 0.5; // 0–1
let isPointerDown = false;

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

//  Smooth Brush Engine Helpers
let lastX = 0;
let lastY = 0;
let lastTime = 0;
let lastLineWidth = brushSize;

// Textured brush noise generator
function noise() {
  return (Math.random() - 0.5) * 0.4; // subtle jitter
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function calculateLineWidth(velocity, pressure = 0.5) {
  const minWidth = brushSize * 0.4;
  const maxWidth = brushSize * 1.4;

  const v = Math.min(velocity, 3);
  const width = maxWidth - (v / 3) * (maxWidth - minWidth);

  // apply simple pressure mapping (Apple Pencil / pens)
  const pressureFactor = 0.3 + pressure * 0.7;

  return (lastLineWidth * 0.7 + width * 0.3) * pressureFactor;
}

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
  const toolButton = document.getElementById(
    "tool" + tool.charAt(0).toUpperCase() + tool.slice(1)
  );
  if (toolButton) {
    toolButton.classList.add("active");
  }
}

document.getElementById("toolBrush").onclick = () => selectTool("brush");
document.getElementById("toolLine").onclick = () => selectTool("line");
document.getElementById("toolRect").onclick = () => selectTool("rect");
document.getElementById("toolCircle").onclick = () => selectTool("circle");
// tools
document.getElementById("toolSpray").onclick = () => selectTool("spray");
document.getElementById("toolSmudge").onclick = () => selectTool("smudge");
document.getElementById("toolBucket").onclick = () => selectTool("bucket");

// Brush Texture Buttons
document.getElementById("brushSmooth").onclick = () => (brushType = "smooth");
document.getElementById("brushPencil").onclick = () => (brushType = "pencil");
document.getElementById("brushMarker").onclick = () => (brushType = "marker");
document.getElementById("brushWatercolor").onclick = () =>
  (brushType = "watercolor");

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

  // Pointer / mouse
  return {
    x: (e.clientX ?? 0) - rect.left,
    y: (e.clientY ?? 0) - rect.top,
  };
}

// Drawing logic (using Pointer Events for pressure + touch + mouse)
canvas.addEventListener("pointerdown", start);
canvas.addEventListener("pointerup", stop);
canvas.addEventListener("pointermove", (e) => {
  draw(e); // brush preview removed
});

// Touch events keep behaviour consistent
canvas.addEventListener("touchstart", (e) => start(e));
canvas.addEventListener("touchend", (e) => stop(e));
canvas.addEventListener("touchmove", (e) => draw(e));

function start(e) {
  saveState();
  painting = true;
  isPointerDown = true;

  // Pressure support
  if (e.pointerType && typeof e.pressure === "number" && e.pressure > 0) {
    currentPressure = e.pressure;
  } else {
    currentPressure = 0.5;
  }

  const pos = getPos(e);
  startX = pos.x;
  startY = pos.y;

  lastX = pos.x;
  lastY = pos.y;
  lastTime = Date.now();
  lastLineWidth = brushSize;

  // Bucket fills on click
  if (currentTool === "bucket") {
    bucketFill(pos.x, pos.y);
    painting = false;
    isPointerDown = false;
    return;
  }

  if (
    currentTool === "brush" ||
    currentTool === "spray" ||
    currentTool === "smudge"
  ) {
    draw(e);
  }
}

function stop(e) {
  if (!painting) return;
  painting = false;
  isPointerDown = false;

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

// Spray tool
function sprayAt(pos) {
  const density = brushSize * 2;
  ctx.fillStyle = erasing ? "#ffffff" : color;

  for (let i = 0; i < density; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * brushSize;
    const x = pos.x + Math.cos(angle) * radius;
    const y = pos.y + Math.sin(angle) * radius;

    ctx.fillRect(x, y, 1, 1);
  }
}

// Smudge tool
function smudgeAt(pos) {
  const size = brushSize * 3;
  const half = size / 2;
  const sx = Math.max(0, pos.x - half);
  const sy = Math.max(0, pos.y - half);
  const w = Math.min(size, canvas.width - sx);
  const h = Math.min(size, canvas.height - sy);

  if (w <= 0 || h <= 0) return;

  const imgData = ctx.getImageData(sx, sy, w, h);
  const data = imgData.data;

  // simple blur
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;

      const neighbors = [
        idx,
        ((y - 1) * w + x) * 4,
        ((y + 1) * w + x) * 4,
        (y * w + (x - 1)) * 4,
        (y * w + (x + 1)) * 4,
      ];

      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      neighbors.forEach((ni) => {
        r += data[ni];
        g += data[ni + 1];
        b += data[ni + 2];
        a += data[ni + 3];
      });

      data[idx] = r / neighbors.length;
      data[idx + 1] = g / neighbors.length;
      data[idx + 2] = b / neighbors.length;
      data[idx + 3] = a / neighbors.length;
    }
  }

  ctx.putImageData(imgData, sx, sy);
}

// Bucket fill
function bucketFill(x, y) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  const targetPos = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
  const targetColor = [
    data[targetPos],
    data[targetPos + 1],
    data[targetPos + 2],
    data[targetPos + 3],
  ];

  const fillColor = hexToRgba(erasing ? "#ffffff" : color);

  if (
    targetColor[0] === fillColor[0] &&
    targetColor[1] === fillColor[1] &&
    targetColor[2] === fillColor[2] &&
    targetColor[3] === fillColor[3]
  ) {
    return;
  }

  const stack = [[Math.floor(x), Math.floor(y)]];

  function matchTarget(px, py) {
    if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height)
      return false;
    const idx = (py * canvas.width + px) * 4;
    return (
      data[idx] === targetColor[0] &&
      data[idx + 1] === targetColor[1] &&
      data[idx + 2] === targetColor[2] &&
      data[idx + 3] === targetColor[3]
    );
  }

  function colorPixel(px, py) {
    const idx = (py * canvas.width + px) * 4;
    data[idx] = fillColor[0];
    data[idx + 1] = fillColor[1];
    data[idx + 2] = fillColor[2];
    data[idx + 3] = fillColor[3];
  }

  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    if (!matchTarget(cx, cy)) continue;

    colorPixel(cx, cy);

    stack.push([cx + 1, cy]);
    stack.push([cx - 1, cy]);
    stack.push([cx, cy + 1]);
    stack.push([cx, cy - 1]);
  }

  ctx.putImageData(imgData, 0, 0);
}

// hex to [r,g,b,a]
function hexToRgba(hex) {
  const sanitized = hex.replace("#", "");
  let r, g, b;
  if (sanitized.length === 3) {
    r = parseInt(sanitized[0] + sanitized[0], 16);
    g = parseInt(sanitized[1] + sanitized[1], 16);
    b = parseInt(sanitized[2] + sanitized[2], 16);
  } else {
    r = parseInt(sanitized.slice(0, 2), 16);
    g = parseInt(sanitized.slice(2, 4), 16);
    b = parseInt(sanitized.slice(4, 6), 16);
  }
  return [r, g, b, 255];
}

// Smooth + Textured Brush + Extra tools
function draw(e) {
  if (!painting) return;

  // update pressure if available
  if (e.pointerType && typeof e.pressure === "number" && e.pressure > 0) {
    currentPressure = e.pressure;
  }

  const pos = getPos(e);

  if (currentTool === "spray") {
    sprayAt(pos);
    return;
  }

  if (currentTool === "smudge") {
    smudgeAt(pos);
    return;
  }

  if (currentTool !== "brush") return;

  const now = Date.now();
  const dt = now - lastTime;
  const dist = distance(lastX, lastY, pos.x, pos.y);
  const velocity = dist / (dt || 1);

  let lineWidth = calculateLineWidth(velocity, currentPressure);

  ctx.strokeStyle = erasing ? "#ffffff" : color;
  ctx.lineCap = "round";

  // Apply brush textures
  if (!erasing) {
    if (brushType === "pencil") {
      lineWidth *= 0.6;
      ctx.globalAlpha = 0.5 + noise();
      ctx.strokeStyle = color;
    }

    if (brushType === "marker") {
      ctx.globalAlpha = 0.7;
    }

    if (brushType === "watercolor") {
      ctx.globalAlpha = 0.2 + Math.random() * 0.1;
      lineWidth *= 1.8;
    }
  }

  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);

  // Smooth quadratic curve
  const midX = (lastX + pos.x) / 2;
  const midY = (lastY + pos.y) / 2;
  ctx.quadraticCurveTo(lastX, lastY, midX, midY);
  ctx.stroke();

  lastX = pos.x;
  lastY = pos.y;
  lastTime = now;
  lastLineWidth = lineWidth;

  ctx.globalAlpha = 1.0; // reset
}

// Action Buttons
document.getElementById("clearBtn").addEventListener("click", () => {
  saveState();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Save to backend
// Save to backend
document.getElementById("saveBtn").addEventListener("click", async () => {
  const imageData = canvas.toDataURL("image/png");

  const token = localStorage.getItem("userToken");

  let headers = {
    "Content-Type": "application/json",
  };

  let body = { imageData };

  if (token) {
    // Firebase-auth user
    headers.Authorization = `Bearer ${token}`;
  } else {
    // Manual user
    if (!userId) {
      alert("User not identified. Please register again.");
      return;
    }
    body.userId = userId;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/drawings`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Save error:", err);
      alert("Failed to save drawing");
      return;
    }

    alert("Drawing saved!");
  } catch (err) {
    console.error("Network error:", err);
    alert("Could not connect to server");
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

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await firebase.auth().signOut();
    window.location.href = "home.html";
  } catch (err) {
    alert("Logout failed: " + err.message);
  }
});
