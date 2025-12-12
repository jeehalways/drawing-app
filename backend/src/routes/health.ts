import { Router } from "express";

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: API health check
 *     description: Simple endpoint to verify that the API is running.
 *     responses:
 *       200:
 *         description: API is running correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */

router.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

export default router;
