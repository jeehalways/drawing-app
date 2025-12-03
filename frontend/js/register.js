const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const birthday = document.getElementById("birthday").value;

  try {
    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, birthday }),
    });

    const user = await res.json();

    if (res.status !== 201) {
      alert("Error: " + JSON.stringify(user));
      return;
    }

    // Redirect to paint page with userId in URL
    window.location.href = `paint.html?userId=${user.id}`;
  } catch (error) {
    alert("Registration failed");
  }
});

// Light/Dark theme toggle
document.getElementById("modeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
