const firebaseConfig = {
  apiKey: "AIzaSyCWoI2z7s2VSZkwrzpEwqrptzQYmw_wUKM",
  authDomain: "drawing-app-6fc05.firebaseapp.com",
  projectId: "drawing-app-6fc05",
  storageBucket: "drawing-app-6fc05.appspot.com",
  messagingSenderId: "217750669460",
  appId: "1:217750669460:web:613c608fcfa8d4f21b4c81",
};

// Firebase init
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Backend API base URL
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://drawing-app-q0sx.onrender.com";
