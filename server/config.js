import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

export const config = {
  port: Number(process.env.PORT || 3001),
  siteUrl: (
    process.env.SITE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:5173"
  ).replace(/\/$/, ""),
  siteName: process.env.SITE_NAME || "Uttam Ghosh Portfolio",
  artistName: process.env.ARTIST_NAME || "Uttam Ghosh",
  adminPassword: process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || "uttam-admin",
  resendApiKey: process.env.RESEND_API_KEY || "",
  fromEmail: process.env.FROM_EMAIL || process.env.SMTP_USER || "onboarding@resend.dev",
  replyToEmail: process.env.REPLY_TO_EMAIL || "uttam.ghosh@gmail.com",
  adminNotifyEmail:
    process.env.ADMIN_NOTIFY_EMAIL ||
    process.env.REPLY_TO_EMAIL ||
    process.env.SMTP_USER ||
    "uttam.ghosh@gmail.com",
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  enableDevEthereal:
    process.env.NODE_ENV === "production"
      ? process.env.ENABLE_DEV_ETHEREAL === "true"
      : process.env.ENABLE_DEV_ETHEREAL !== "false",
  linkedInUrl:
    process.env.LINKEDIN_URL || "https://linkedin.com/in/uttam-ghosh-a0666815",
  doubleOptIn: process.env.NEWSLETTER_DOUBLE_OPT_IN !== "false",
  queueBatchSize: Number(process.env.EMAIL_BATCH_SIZE || 10),
  queueDelayMs: Number(process.env.EMAIL_QUEUE_DELAY_MS || 5000),
  dataDir: process.env.DATA_DIR || path.join(__dirname, "..", "data"),
};
