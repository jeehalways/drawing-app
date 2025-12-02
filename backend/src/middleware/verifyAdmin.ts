import { Request, Response, NextFunction } from "express";

export function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  // Placeholder middleware until Firebase is added
  // For now, always allow access
  console.warn(
    "⚠️ Firebase Admin not configured yet — admin endpoints are unprotected!"
  );
  next();
}
