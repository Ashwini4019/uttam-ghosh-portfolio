import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  deleteSubscriber,
  findSubscriberByEmail,
  getSubscriberStats,
  listPublishEvents,
  listSubscribers,
  setSubscriberStatus,
  isValidEmail,
  normalizeEmail,
} from "../db.js";
import { getQueueLength, enqueuePublishNotifications } from "../services/emailQueue.js";
import {
  isEmailConfigured,
  isRealEmailConfigured,
  getEmailProvider,
  getLastEmailPreviewUrl,
  resetSmtpTransport,
  sendSubscriptionWelcomeEmail,
  verifyEmailConfiguration,
} from "../services/emailService.js";
import {
  getEmailConfigStatus,
  saveEmailConfig,
} from "../emailConfigStore.js";

const router = Router();

router.use(requireAdmin);

router.get("/email-config", (_req, res) => {
  res.json({
    ok: true,
    config: getEmailConfigStatus(),
    emailProvider: getEmailProvider(),
    realEmailConfigured: getEmailConfigStatus().smtpVerified,
    lastEmailPreviewUrl: getLastEmailPreviewUrl(),
  });
});

router.post("/email-config", async (req, res) => {
  try {
    const smtpPass = String(req.body?.smtpPass || "")
      .replace(/\s+/g, "")
      .trim();
    if (!smtpPass) {
      return res.status(400).json({ ok: false, error: "Gmail App Password is required." });
    }

    if (!/^[a-zA-Z]{16}$/.test(smtpPass)) {
      return res.status(400).json({
        ok: false,
        error:
          "That is not a Gmail App Password. Google’s key is exactly 16 letters (like abcd efgh ijkl mnop). Do not use your normal Gmail password. Turn on 2-Step Verification first, then create an App Password.",
      });
    }

    const smtpUser = normalizeEmail(req.body?.smtpUser);
    if (!smtpUser || !isValidEmail(smtpUser)) {
      return res.status(400).json({
        ok: false,
        error: "Enter a valid Gmail address to send from.",
      });
    }

    saveEmailConfig({ smtpUser, smtpPass, smtpVerified: false });
    resetSmtpTransport();

    const verified = await verifyEmailConfiguration();
    saveEmailConfig({ smtpUser, smtpPass, smtpVerified: verified.ok });
    const realEmailConfigured = isRealEmailConfigured();

    return res.json({
      ok: true,
      verified: verified.ok,
      realEmailConfigured,
      message: verified.ok
        ? `Gmail is connected. Emails will send from ${smtpUser}.`
        : `App password saved, but Gmail connection failed: ${verified.message}`,
      config: getEmailConfigStatus(),
      emailProvider: getEmailProvider(),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to save email configuration.",
    });
  }
});

router.post("/send-test-welcome", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ ok: false, error: "Email address is required." });
    }

    if (!isEmailConfigured()) {
      return res.status(400).json({
        ok: false,
        error: "Configure Gmail SMTP first (add App Password in Email Setup below).",
      });
    }

    const subscriber = findSubscriberByEmail(email) || {
      name: "Subscriber",
      email,
      unsubscribeToken: "test-unsubscribe",
    };

    const result = await sendSubscriptionWelcomeEmail(subscriber);
    if (!result.ok) {
      return res.status(500).json({
        ok: false,
        error: result.error || "Failed to send test welcome email.",
      });
    }

    return res.json({
      ok: true,
      message: `Test welcome email sent to ${email}. Check inbox and spam folder.`,
      provider: result.provider,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || "Failed to send test welcome email.",
    });
  }
});

router.get("/stats", async (_req, res) => {
  const emailConfigured = isEmailConfigured();
  res.json({
    ok: true,
    stats: getSubscriberStats(),
    emailConfigured,
    realEmailConfigured: getEmailConfigStatus().smtpVerified,
    emailProvider: getEmailProvider(),
    lastEmailPreviewUrl: getLastEmailPreviewUrl(),
    queueLength: getQueueLength(),
    emailConfig: getEmailConfigStatus(),
  });
});

router.get("/", (req, res) => {
  const search = String(req.query.search || "");
  const status = String(req.query.status || "all");
  const subscribers = listSubscribers({ search, status });

  res.json({
    ok: true,
    subscribers,
    stats: getSubscriberStats(),
    emailConfigured: isEmailConfigured(),
    realEmailConfigured: getEmailConfigStatus().smtpVerified,
    emailProvider: getEmailProvider(),
    lastEmailPreviewUrl: getLastEmailPreviewUrl(),
    emailConfig: getEmailConfigStatus(),
  });
});

router.get("/export", (req, res) => {
  const search = String(req.query.search || "");
  const status = String(req.query.status || "all");
  const subscribers = listSubscribers({ search, status });

  const header = ["Name", "Email", "Status", "Subscribed At", "Last Notification Sent"];
  const rows = subscribers.map((subscriber) => [
    subscriber.name || "",
    subscriber.email,
    subscriber.status,
    subscriber.subscribedAt,
    subscriber.lastNotificationSent || "",
  ]);

  const csv = [header, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="newsletter-subscribers-${Date.now()}.csv"`
  );
  res.send(csv);
});

router.patch("/:id/status", async (req, res) => {
  const status = req.body?.status;
  if (!["active", "unsubscribed", "pending"].includes(status)) {
    return res.status(400).json({ ok: false, error: "Invalid status." });
  }

  const subscriber = await setSubscriberStatus(req.params.id, status);
  if (!subscriber) {
    return res.status(404).json({ ok: false, error: "Subscriber not found." });
  }

  return res.json({ ok: true, subscriber });
});

router.delete("/:id", async (req, res) => {
  const removed = await deleteSubscriber(req.params.id);
  if (!removed) {
    return res.status(404).json({ ok: false, error: "Subscriber not found." });
  }

  return res.json({ ok: true });
});

router.get("/events", (_req, res) => {
  res.json({ ok: true, events: listPublishEvents() });
});

router.post("/test", async (req, res) => {
  const result = await enqueuePublishNotifications([
    {
      contentType: req.body?.contentType || "portfolio_update",
      title: req.body?.title || "Test Newsletter",
      description:
        req.body?.description ||
        "This is a test notification from the portfolio newsletter system.",
      imageUrl: req.body?.imageUrl || "",
      linkUrl: req.body?.linkUrl,
      fingerprint: `test-${Date.now()}`,
    },
  ]);

  return res.json({
    ok: true,
    queued: result.queued,
    message: "Test newsletter queued.",
  });
});

export default router;
