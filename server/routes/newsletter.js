import { Router } from "express";
import { config } from "../config.js";
import {
  confirmSubscriber,
  createSubscriber,
  findSubscriberByEmail,
  isValidEmail,
  normalizeEmail,
  unsubscribeSubscriber,
} from "../db.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { sendConfirmationEmail, sendSubscriptionWelcomeEmail, sendAdminNewSubscriberEmail } from "../services/emailService.js";
import { enqueuePublishNotifications } from "../services/emailQueue.js";
import { requireAdmin } from "../middleware/auth.js";
import { validateSubscribeInput } from "../validation.js";

const router = Router();

async function notifyAdminOfSubscriber(subscriber) {
  try {
    const result = await sendAdminNewSubscriberEmail(subscriber);
    if (!result?.ok) {
      console.warn("[newsletter] Admin notify email not sent:", result?.error);
    }
  } catch (error) {
    console.error("[newsletter] Admin notify email failed:", error);
  }
}

async function sendSubscribeEmails(subscriber, { pending = false } = {}) {
  const welcomeResult = await sendSubscriptionWelcomeEmail(subscriber, { pending });
  await notifyAdminOfSubscriber(subscriber);

  if (pending) {
    await sendConfirmationEmail(subscriber);
  }

  return welcomeResult;
}

router.post("/subscribe", rateLimit({ max: 8 }), async (req, res) => {
  try {
    const validation = validateSubscribeInput({
      name: req.body?.name,
      email: req.body?.email,
    });

    if (!validation.ok) {
      return res.status(400).json({
        ok: false,
        error: validation.error,
        field: validation.field,
      });
    }

    const initialStatus = config.doubleOptIn ? "pending" : "active";
    const result = await createSubscriber({
      name: validation.name,
      email: validation.email,
      status: initialStatus,
    });

    let emailResult = { ok: false };
    try {
      if (config.doubleOptIn) {
        emailResult = await sendSubscribeEmails(result.subscriber, { pending: true });
      } else {
        emailResult = await sendSubscriptionWelcomeEmail(result.subscriber);
        await notifyAdminOfSubscriber(result.subscriber);
      }
    } catch (emailError) {
      console.error("[newsletter] subscribe email failed:", emailError);
      emailResult = { ok: false, error: emailError.message };
    }

    if (config.doubleOptIn) {
      return res.json({
        ok: true,
        pending: true,
        resubscribed: Boolean(result.resubscribed),
        emailSent: Boolean(emailResult?.ok),
        emailProvider: emailResult?.provider || "none",
        message:
          "Please check your email and confirm your subscription to start receiving updates.",
      });
    }

    return res.json({
      ok: true,
      resubscribed: Boolean(result.resubscribed),
      emailSent: Boolean(emailResult?.ok),
      emailProvider: emailResult?.provider || "none",
      emailError: emailResult?.error || null,
      message:
        "Thank you for subscribing! You'll automatically receive email notifications whenever new artwork, exhibitions, blog posts, or portfolio updates are published.",
    });
  } catch (error) {
    console.error("[newsletter] subscribe error:", error);
    return res.status(500).json({ ok: false, error: "Unable to subscribe right now." });
  }
});

router.post("/resend-welcome", rateLimit({ max: 5 }), async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: "Valid email is required." });
    }

    const subscriber = findSubscriberByEmail(email);
    if (!subscriber) {
      return res.status(404).json({ ok: false, error: "Subscriber not found." });
    }

    const pending = subscriber.status === "pending";
    const result = await sendSubscriptionWelcomeEmail(subscriber, { pending });
    if (pending) {
      await sendConfirmationEmail(subscriber);
    }

    return res.json({
      ok: true,
      message: `Welcome email resent to ${email}.`,
      previewUrl: result.previewUrl || null,
    });
  } catch (error) {
    console.error("[newsletter] resend-welcome error:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Unable to resend welcome email.",
    });
  }
});

router.get("/confirm/:token", async (req, res) => {
  try {
    const result = await confirmSubscriber(req.params.token);
    if (!result.ok) {
      return res.status(404).json({ ok: false, error: "Invalid or expired confirmation link." });
    }

    return res.json({
      ok: true,
      already: result.already,
      message: result.already
        ? "Your subscription is already confirmed."
        : "Your subscription is confirmed. You'll now receive portfolio updates by email.",
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Unable to confirm subscription." });
  }
});

router.get("/unsubscribe/:token", async (req, res) => {
  try {
    const result = await unsubscribeSubscriber(req.params.token);
    if (!result.ok) {
      return res.status(404).json({ ok: false, error: "Invalid unsubscribe link." });
    }

    return res.json({
      ok: true,
      message: "You have been unsubscribed and will no longer receive newsletter emails.",
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Unable to unsubscribe." });
  }
});

router.post("/notify", requireAdmin, async (req, res) => {
  try {
    const updates = Array.isArray(req.body?.updates) ? req.body.updates : [req.body];
    const normalized = updates
      .filter((item) => item && item.title)
      .map((item) => ({
        contentType: item.contentType || "portfolio_update",
        title: String(item.title).trim(),
        description: String(item.description || "").trim(),
        imageUrl: item.imageUrl || "",
        linkUrl: item.linkUrl || config.siteUrl,
        fingerprint: item.fingerprint || null,
      }));

    if (!normalized.length) {
      return res.status(400).json({ ok: false, error: "No publish updates provided." });
    }

    const result = await enqueuePublishNotifications(normalized);
    return res.json({
      ok: true,
      queued: result.queued,
      message:
        result.queued > 0
          ? `Newsletter queued for ${result.queued} update(s). Emails will be sent automatically.`
          : "No new updates to notify (duplicate prevented).",
    });
  } catch (error) {
    console.error("[newsletter] notify error:", error);
    return res.status(500).json({ ok: false, error: "Unable to queue newsletter." });
  }
});

export default router;
