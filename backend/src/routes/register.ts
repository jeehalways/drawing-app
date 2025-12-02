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

router.post("/", async (req, res) => {
  try {
    const parsed = registerSchema.parse(req.body);

    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        birthday: new Date(parsed.birthday),
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

export default router;
