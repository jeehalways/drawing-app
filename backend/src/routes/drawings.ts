import { Router } from "express";
import { z, ZodError } from "zod";
import prisma from "../config/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const router = Router();

const drawingSchema = z.object({
  userId: z.string().uuid(),
  imageData: z.string().min(1),
});

/**
 * @openapi
 * /api/drawings:
 *   post:
 *     tags:
 *       - Drawings
 *     summary: Save a drawing for a user
 *     description: Stores a drawing linked to an existing user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateDrawingInput"
 *     responses:
 *       201:
 *         description: Drawing saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Drawing"
 *       400:
 *         description: Validation error or invalid userId
 *       500:
 *         description: Server error
 */

router.post("/", async (req, res) => {
  console.log("💾 Saving drawing to DB:", process.env.DATABASE_URL);

  try {
    const parsed = drawingSchema.parse(req.body);

    const newDrawing = await prisma.drawing.create({
      data: {
        userId: parsed.userId,
        imageData: parsed.imageData,
      },
    });

    res.status(201).json(newDrawing);
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (error instanceof ZodError) {
      return res.status(400).json({ errors: error.issues });
    }

    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @openapi
 * /api/drawings:
 *   get:
 *     tags:
 *       - Drawings
 *     summary: Get all drawings with user info
 *     description: Returns drawings newest-first including limited user fields.
 *     responses:
 *       200:
 *         description: List of all drawings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/DrawingWithUser"
 *       500:
 *         description: Could not load drawings
 */

router.get("/", async (req, res) => {
  try {
    const drawings = await prisma.drawing.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.json(drawings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load drawings" });
  }
});

export default router;
