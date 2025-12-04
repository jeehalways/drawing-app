import { Router } from "express";
import admin from "../config/firebase";
import prisma from "../config/db";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ error: "Missing token" });

    const decoded = await admin.auth().verifyIdToken(token);

    const email = decoded.email;
    const name = decoded.name || decoded.email?.split("@")[0];
    const birthday = undefined; // users logged in via Google may not provide birthday

    // find existing user
    let user = await prisma.user.findUnique({
      where: { email: email as string }, // Ensure email is cast to string if necessary
    });

    // create if not exists
    if (!user) {
      user = await prisma.user.create({
        data: { name, email, birthday },
      });
    }

    return res.json({ userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid Firebase token" });
  }
});

export default router;
