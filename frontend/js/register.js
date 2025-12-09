// Theme toggle
document.getElementById("modeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Handle registration
document.getElementById("registerBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const birthday = document.getElementById("birthday").value;

  if (!name || !birthday) {
    alert("Please fill all fields");
    return;
  }

  try {
    // Send manual registration to backend
    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, birthday }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Registration error:", err);
      alert("Registration failed");
      return;
    }

    // Newly created Prisma user
    const newUser = await res.json();

    if (!newUser.id) {
      console.error("No user ID returned:", newUser);
      alert("Registration failed: invalid response from server.");
      return;
    }

    // Redirect to paint page WITHOUT requiring Firebase login
    window.location.href = `paint.html?userId=${newUser.id}`;
  } catch (err) {
    console.error("Network error:", err);
    alert("Could not connect to the server.");
  }
});
