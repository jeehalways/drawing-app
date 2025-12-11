import admin from "firebase-admin";
import path from "path";

const isTest = process.env.NODE_ENV === "test";

if (!isTest) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountPath) {
    console.warn(
      "❌ Firebase service account not set. Firebase NOT initialized."
    );
  } else {
    try {
      const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
      const serviceAccount = require(resolvedPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("🔥 Firebase Admin initialized.");
    } catch (err) {
      console.error("❌ Failed to load Firebase service account file:", err);
    }
  }
} else {
  console.log("🧪 Firebase initialization skipped (NODE_ENV=test)");
}

export default admin;
