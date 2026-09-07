import { config } from "../config.js";

export function requireAdmin(req, res, next) {
  const password =
    req.headers["x-admin-password"] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (!password || password !== config.adminPassword) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  return next();
}
