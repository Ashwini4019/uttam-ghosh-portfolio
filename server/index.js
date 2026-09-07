import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import newsletterRoutes from "./routes/newsletter.js";
import adminSubscribersRoutes from "./routes/adminSubscribers.js";
import { verifyEmailConfiguration } from "./services/emailService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const serveWebsite = fs.existsSync(path.join(distDir, "index.html"));

const app = express();
app.set("trust proxy", 1);
fs.mkdirSync(config.dataDir, { recursive: true });

const allowedOrigins = [
  config.siteUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "newsletter-api" });
});

app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin/subscribers", adminSubscribersRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ ok: false, error: "Not found." });
});

if (serveWebsite) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    res.sendFile(path.join(distDir, "index.html"), (error) => {
      if (error) next(error);
    });
  });
}

app.use((error, _req, res, _next) => {
  console.error("[server]", error);
  const status = error.status || error.statusCode || 500;
  res.status(status).json({
    ok: false,
    error: status === 400 ? "Invalid request." : "Internal server error.",
  });
});

app.listen(config.port, "0.0.0.0", async () => {
  if (serveWebsite) {
    console.log(`Website, admin, and API running on port ${config.port}`);
  } else {
    console.log(`Newsletter API running on port ${config.port}`);
  }

  try {
    const emailStatus = await verifyEmailConfiguration();
    if (emailStatus.ok) {
      console.log(`[newsletter] Email ready via ${emailStatus.provider}`);
    } else {
      console.warn(`[newsletter] WARNING: ${emailStatus.message}`);
    }
  } catch (error) {
    console.warn("[newsletter] Email check skipped:", error.message);
  }
});
