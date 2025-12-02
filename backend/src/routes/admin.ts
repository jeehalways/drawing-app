import { Router } from "express";
import prisma from "../config/db";
// Placeholder until implement Firebase
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = Router();

/**
 * @openapi
 * /api/admin/drawings:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all drawings with their user information (admin only)
 *     security:
 *       - FirebaseAuth: []
 *     responses:
 *       200:
 *         description: List of drawings
 *       401:
 *         description: Unauthorized
 */
router.get("/drawings", verifyAdmin, async (_req, res) => {
  try {
    const drawings = await prisma.drawing.findMany({
      include: {
        user: true, // include user info
      },
    });

    res.json(drawings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
