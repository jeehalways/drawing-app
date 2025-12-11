import { Router } from "express";
import prisma from "../config/db";
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
  console.log("📥 Fetching drawings from DB:", process.env.DATABASE_URL);

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

/**
 * @openapi
 * /api/admin/drawings/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete a drawing by ID (admin only)
 *     security:
 *       - FirebaseAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Drawing ID
 *     responses:
 *       200:
 *         description: Drawing deleted successfully
 *       404:
 *         description: Drawing not found
 */
router.delete("/drawings/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await prisma.drawing.delete({
      where: { id },
    });

    res.json({ message: "Deleted", deleted });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(404).json({ error: "Drawing not found" });
  }
});

export default router;
