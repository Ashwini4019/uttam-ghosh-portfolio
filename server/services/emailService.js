import fs from "fs";
import path from "path";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { config } from "../config.js";
import {
  getStoredSmtpPass,
  getStoredSmtpUser,
  normalizeAppPassword,
} from "../emailConfigStore.js";
import {
  buildConfirmationHtml,
  buildNewsletterHtml,
  buildSubscriptionWelcomeHtml,
  buildAdminNewSubscriberHtml,
  getContentTypeLabel,
} from "./emailTemplate.js";

let resendClient = null;
let smtpTransport = null;
let etherealTransport = null;
let lastPreviewUrl = null;

const ETHEREAL_FILE = path.join(config.dataDir, "ethereal.json");

function getResend() {
  if (!config.resendApiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(config.resendApiKey);
  }
  return resendClient;
}

function getSmtpUser() {
  return getStoredSmtpUser() || config.smtpUser || "";
}

function getSmtpPassword() {
  const envPass = normalizeAppPassword(config.smtpPass);
  const storedPass = normalizeAppPassword(getStoredSmtpPass());
  return envPass || storedPass;
}

function getMailIdentity() {
  const smtpUser = getSmtpUser();
  const fromEmail = smtpUser || config.fromEmail;
  const replyTo = smtpUser || config.replyToEmail;
  const fromAddress = String(fromEmail).includes("@")
    ? `${config.artistName} <${fromEmail}>`
    : fromEmail;
  return { smtpUser, fromEmail, replyTo, fromAddress };
}

function getSmtpTransport() {
  const smtpUser = getSmtpUser();
  const smtpPass = getSmtpPassword();
  if (!smtpUser || !smtpPass) return null;
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      requireTLS: config.smtpPort !== 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }
  return smtpTransport;
}

export function resetSmtpTransport() {
  smtpTransport = null;
}

export function resetEtherealTransport() {
  etherealTransport = null;
}

function readEtherealCreds() {
  try {
    if (!fs.existsSync(ETHEREAL_FILE)) return null;
    const creds = JSON.parse(fs.readFileSync(ETHEREAL_FILE, "utf8"));
    if (!creds?.user || !creds?.pass || !creds?.smtp?.host) return null;
    return creds;
  } catch {
    return null;
  }
}

async function createEtherealCreds() {
  const account = await nodemailer.createTestAccount();
  const creds = {
    user: account.user,
    pass: account.pass,
    smtp: account.smtp,
  };
  fs.mkdirSync(config.dataDir, { recursive: true });
  fs.writeFileSync(ETHEREAL_FILE, JSON.stringify(creds, null, 2), "utf8");
  console.log("[newsletter] Created Ethereal inbox for local email testing.");
  return creds;
}

function makeEtherealTransport(creds) {
  return nodemailer.createTransport({
    host: creds.smtp.host,
    port: creds.smtp.port,
    secure: Boolean(creds.smtp.secure),
    auth: {
      user: creds.user,
      pass: creds.pass,
    },
  });
}

async function getEtherealTransport({ forceNew = false } = {}) {
  if (config.resendApiKey || getSmtpPassword()) {
    return null;
  }

  if (etherealTransport && !forceNew) {
    return etherealTransport;
  }

  let creds = forceNew ? null : readEtherealCreds();
  if (!creds) {
    creds = await createEtherealCreds();
  }

  etherealTransport = makeEtherealTransport(creds);

  try {
    await etherealTransport.verify();
  } catch (error) {
    console.warn(
      "[newsletter] Ethereal login failed, creating a new test inbox:",
      error.message
    );
    try {
      if (fs.existsSync(ETHEREAL_FILE)) fs.unlinkSync(ETHEREAL_FILE);
    } catch {
      /* ignore */
    }
    etherealTransport = makeEtherealTransport(await createEtherealCreds());
    await etherealTransport.verify();
  }

  return etherealTransport;
}

export function getLastEmailPreviewUrl() {
  return lastPreviewUrl;
}

export function getEmailProvider() {
  if (config.resendApiKey) return "resend";
  if (getSmtpUser() && getSmtpPassword()) return "smtp";
  return "ethereal-dev";
}

export function isRealEmailConfigured() {
  const provider = getEmailProvider();
  return provider === "resend" || provider === "smtp";
}

export function isEmailConfigured() {
  return getEmailProvider() !== "none";
}

async function sendEmail({ to, subject, html }) {
  const { fromAddress, replyTo } = getMailIdentity();

  const resend = getResend();
  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: fromAddress,
        to: [to],
        replyTo,
        subject,
        html,
      });

      if (error) {
        throw new Error(error.message || "Failed to send email via Resend");
      }

      console.log(`[newsletter] Email sent via Resend to ${to}: ${subject}`);
      return { ok: true, provider: "resend" };
    } catch (error) {
      console.error(`[newsletter] Resend send failed for ${to}:`, error.message);
      return { ok: false, provider: "resend", error: error.message };
    }
  }

  const smtp = getSmtpTransport();
  if (smtp) {
    try {
      await smtp.sendMail({
        from: fromAddress,
        to,
        replyTo,
        subject,
        html,
      });

      console.log(`[newsletter] Email sent via SMTP to ${to}: ${subject}`);
      return { ok: true, provider: "smtp" };
    } catch (error) {
      console.error(`[newsletter] SMTP send failed for ${to}:`, error.message);
      return {
        ok: false,
        provider: "smtp",
        error: `Gmail rejected the email: ${error.message}`,
      };
    }
  }

  try {
    let ethereal = await getEtherealTransport();
    if (ethereal) {
      let info;
      try {
        info = await ethereal.sendMail({
          from: `"${config.artistName}" <${replyTo}>`,
          to,
          replyTo,
          subject,
          html,
        });
      } catch (error) {
        if (error.code === "EAUTH") {
          ethereal = await getEtherealTransport({ forceNew: true });
          info = await ethereal.sendMail({
            from: `"${config.artistName}" <${replyTo}>`,
            to,
            replyTo,
            subject,
            html,
          });
        } else {
          throw error;
        }
      }

      lastPreviewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[newsletter] Dev email captured for ${to}: ${subject}`);
      console.log(`[newsletter] Preview: ${lastPreviewUrl}`);
      return { ok: true, provider: "ethereal-dev", previewUrl: lastPreviewUrl };
    }
  } catch (error) {
    console.error(`[newsletter] Ethereal send failed for ${to}:`, error.message);
    return {
      ok: false,
      provider: "ethereal-dev",
      error: error.message,
    };
  }

  console.warn(
    `[newsletter] Email NOT sent — configure Gmail in Admin → Newsletter → Email Setup, or set SMTP_PASS in .env\n` +
      `  Would send to: ${to}\n  Subject: ${subject}`
  );
  return { ok: false, dev: true, error: "Email provider not configured" };
}

export async function sendConfirmationEmail(subscriber) {
  const confirmUrl = `${config.siteUrl}/newsletter/confirm/${subscriber.confirmToken}`;
  const html = buildConfirmationHtml({
    confirmUrl,
    name: subscriber.name,
  });

  return sendEmail({
    to: subscriber.email,
    subject: `Confirm your subscription to ${config.siteName}`,
    html,
  });
}

export async function sendSubscriptionWelcomeEmail(subscriber, { pending = false } = {}) {
  const unsubscribeUrl = `${config.siteUrl}/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;
  const confirmUrl = pending
    ? `${config.siteUrl}/newsletter/confirm/${subscriber.confirmToken}`
    : "";

  const html = buildSubscriptionWelcomeHtml({
    name: subscriber.name,
    unsubscribeUrl,
    confirmUrl,
  });

  return sendEmail({
    to: subscriber.email,
    subject: `Thank you for subscribing to ${config.siteName}`,
    html,
  });
}

export async function sendAdminNewSubscriberEmail(subscriber) {
  const to = getSmtpUser() || config.adminNotifyEmail;
  if (!to) {
    return { ok: false, error: "Admin notify email is not set." };
  }

  const html = buildAdminNewSubscriberHtml({
    name: subscriber.name,
    email: subscriber.email,
    subscribedAt: subscriber.subscribedAt,
  });

  return sendEmail({
    to,
    subject: `New newsletter subscriber: ${subscriber.email}`,
    html,
  });
}

export async function sendNewsletterEmail(subscriber, event) {
  const unsubscribeUrl = `${config.siteUrl}/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;
  const label = getContentTypeLabel(event.contentType);
  const html = buildNewsletterHtml({
    title: event.title,
    description: event.description,
    contentType: event.contentType,
    imageUrl: event.imageUrl,
    linkUrl: event.linkUrl,
    unsubscribeUrl,
  });

  return sendEmail({
    to: subscriber.email,
    subject: `${label}: ${event.title}`,
    html,
  });
}

export async function verifyEmailConfiguration() {
  const provider = getEmailProvider();

  if (provider === "none") {
    return {
      ok: false,
      provider,
      message:
        "No email provider configured. Set RESEND_API_KEY or SMTP_USER + SMTP_PASS in .env",
    };
  }

  if (provider === "ethereal-dev") {
    await getEtherealTransport();
    return {
      ok: true,
      provider,
      message:
        "Dev email active (Ethereal). Emails are captured locally — add SMTP_PASS for real Gmail delivery.",
    };
  }

  if (provider === "smtp") {
    try {
      resetSmtpTransport();
      await getSmtpTransport().verify();
      return { ok: true, provider, message: "SMTP connection verified." };
    } catch (error) {
      const hint =
        error.message?.includes("Invalid login") ||
        error.message?.includes("authentication")
          ? " Check that 2-Step Verification is on and you used a Gmail App Password (not your regular Gmail password)."
          : "";
      return {
        ok: false,
        provider,
        message: `SMTP verification failed: ${error.message}.${hint}`,
      };
    }
  }

  return { ok: true, provider, message: "Resend API key configured." };
}
