import { Router } from "express";
import { z } from "zod";
import prisma from "../config/db";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthday: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

//Manual register (POST /api/register)
router.post("/", async (req, res) => {
  try {
    const parsed = registerSchema.parse(req.body);

    const avatar = `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(
      parsed.name
    )}`;

    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        birthday: new Date(parsed.birthday),
        avatar,
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

/**
 * GET /api/register/:id
 * Return user profile (used by paint.js for manual users)
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        birthday: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Expose only necessary fields
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      birthday: user.birthday,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
