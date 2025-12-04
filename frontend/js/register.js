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

  // Build request body
  const body = { name, birthday };

  const res = await fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 201) {
    const newUser = await res.json();

    // redirect to paint.html
    window.location.href = `paint.html?userId=${newUser.id}`;
  } else if (res.status === 400) {
    alert("Invalid data — check name and birthday");
  } else {
    alert("Registration failed");
  }
});
