import admin from "firebase-admin";

const isTest = process.env.NODE_ENV === "test";

if (!isTest && !admin.apps.length) {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!json) {
    console.warn("❌ FIREBASE_SERVICE_ACCOUNT_JSON not set");
  } else {
    const serviceAccount = JSON.parse(json);

    // Fix private_key newlines if needed
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(
        /\\n/g,
        "\n"
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("🔥 Firebase Admin initialized");
  }
}

export default admin;
