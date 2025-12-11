import { Router } from "express";
import admin from "../config/firebase";
import prisma from "../config/db";

const router = Router();

router.post("/", async (req, res) => {
  console.log("🔥 /api/register/firebase HIT");
  console.log("Request body:", req.body);

  try {
    const { token } = req.body;

    if (!token) {
      console.log("❌ No token received");
      return res.status(400).json({ error: "Missing token" });
    }

    console.log("🔐 Verifying Firebase token:", token);

    const decoded = await admin.auth().verifyIdToken(token);

    console.log("✔️ Decoded token:", decoded);

    const email = decoded.email;
    const name = decoded.name || decoded.email?.split("@")[0];

    let user = await prisma.user.findUnique({
      where: { email: email as string },
    });

    if (!user) {
      console.log("🆕 Creating new user...");
      user = await prisma.user.create({
        data: { name, email, birthday: null },
      });
    }

    console.log("✔️ User result:", user);

    return res.json({ userId: user.id });
  } catch (err) {
    console.error("❌ ERROR IN /api/register/firebase", err);
    return res.status(401).json({ error: "Invalid Firebase token" });
  }
});

export default router;
