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
 *     summary: Get all drawings with user information (admin only)
 *     description: Returns a list of all drawings including user details. Requires Firebase admin token.
 *     security:
 *       - FirebaseAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved list of drawings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/DrawingWithUser"
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - user is not an admin
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
 *     description: Deletes a drawing if it exists. Requires Firebase admin token.
 *     security:
 *       - FirebaseAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Drawing ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Drawing deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deleted
 *                 deleted:
 *                   $ref: "#/components/schemas/Drawing"
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
