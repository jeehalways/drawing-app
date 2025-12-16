import admin from "firebase-admin";

const isTest = process.env.NODE_ENV === "test";

if (!isTest && !admin.apps.length) {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!json) {
    console.warn("❌ FIREBASE_SERVICE_ACCOUNT_JSON not set");
  } else {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(json)),
    });

    console.log("🔥 Firebase Admin initialized");
  }
}

export default admin;
