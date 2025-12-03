const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let painting = false;
let brushSize = 5;
let color = "#000000";

// Get userId from URL
const params = new URLSearchParams(window.location.search);
const userId = params.get("userId");

document.getElementById("brushSize").addEventListener("input", (e) => {
  brushSize = e.target.value;
});

document.getElementById("colorPicker").addEventListener("input", (e) => {
  color = e.target.value;
});

// Mouse events
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
  ctx.strokeStyle = color;

  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
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

// Download drawing
document.getElementById("downloadBtn").addEventListener("click", () => {
  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = "drawing.png";
  link.click();
});

// Light/Dark mode
document.getElementById("modeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
