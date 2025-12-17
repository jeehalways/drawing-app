console.log("home.js loaded");

//  Firebase auth
const auth = firebase.auth();

//  THEME TOGGLE
document.getElementById("modeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// QR CODE GENERATION
const registerURL = `${window.location.origin}/register.html`;

QRCode.toCanvas(document.getElementById("qrCanvas"), registerURL, (err) => {
  if (err) console.error("QR Error:", err);
});

//  MANUAL REGISTER BUTTON
document.getElementById("manualBtn").addEventListener("click", () => {
  window.location.href = "/register.html";
});

//  GOOGLE LOGIN
document.getElementById("googleBtn").addEventListener("click", async () => {
  console.log("GOOGLE CLICK FIRED");
  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    const result = await auth.signInWithPopup(provider);
    const token = await result.user.getIdToken();

    await sendTokenToBackend(token);
  } catch (err) {
    alert("Google login failed: " + err.message);
  }
});

//  GITHUB LOGIN
document.getElementById("githubBtn").addEventListener("click", async () => {
  console.log("GITHUB CLICK FIRED");
  const provider = new firebase.auth.GithubAuthProvider();

  try {
    const result = await auth.signInWithPopup(provider);
    const token = await result.user.getIdToken();

    await sendTokenToBackend(token);
  } catch (err) {
    alert("GitHub login failed: " + err.message);
  }
});

//  SEND TOKEN TO BACKEND
//  - Backend will create/find user
//  - Returns { userId }
async function sendTokenToBackend(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/register/firebase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (res.status !== 200) {
      alert("Server error: " + data.message);
      return;
    }

    // Redirect to canvas
    window.location.href = `/paint.html?userId=${data.userId}`;
  } catch (err) {
    alert("Connection error: " + err.message);
  }
}

// Admin login button
document.getElementById("adminBtn").addEventListener("click", () => {
  window.location.href = "/admin-login.html";
});
