import { Router } from "express";
import { z, ZodError } from "zod";
import prisma from "../config/db";
import { Prisma } from "@prisma/client";

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - imageData
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "11111111-1111-1111-1111-111111111111"
 *               imageData:
 *                 type: string
 *                 description: Base64 string of the drawing image
 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *     responses:
 *       201:
 *         description: Drawing saved
 *       400:
 *         description: Validation error
 */
router.post("/", async (req, res) => {
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
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error as Prisma.PrismaClientKnownRequestError).code === "P2003"
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
