import { Router } from "express";
import { z } from "zod";
import prisma from "../config/db";
import admin from "../config/firebase";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthday: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});
/**
 * @openapi
 * /api/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - birthday
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jessica
 *               birthday:
 *                 type: string
 *                 example: "1997-03-15"
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 */
router.post("/", async (req, res) => {
  try {
    const parsed = registerSchema.parse(req.body);

    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        birthday: new Date(parsed.birthday),
        // Default avatar for manual users:
        avatar: `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(
          parsed.name
        )}`,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/register/firebase
router.post("/firebase", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: "Missing token" });

    // Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(token);

    const email = decoded.email || undefined;
    const name = decoded.name || "Unnamed User";

    // Find or create user in Prisma
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          birthday: null, // Firebase users may not provide birthday
        },
      });
    }

    // Return userId so frontend can redirect to paint screen
    res.json({ userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid Firebase token" });
  }
});

router.post("/firebase", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Missing token" });

    // Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(token);

    const firebaseId = decoded.uid;
    const email = decoded.email || null;
    const name = decoded.name || "Unnamed User";

    // Find user by firebaseId
    let user = await prisma.user.findUnique({
      where: { firebaseId: decoded.uid },
    });

    // Create user if not found
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseId: decoded.uid,
          email,
          name,
          birthday: null,
        },
      });
    }

    res.json({ userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid Firebase token" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      birthday: user.birthday,
      avatar: user.avatar, // ensures avatar is included
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
