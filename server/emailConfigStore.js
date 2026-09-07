import fs from "fs";
import path from "path";
import { config } from "./config.js";

const CONFIG_FILE = path.join(config.dataDir, "email-config.json");

function readFile() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return {};
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  } catch {
    return {};
  }
}

export function getStoredSmtpPass() {
  const stored = readFile();
  return stored.smtpPass || "";
}

export function getStoredSmtpUser() {
  return String(readFile().smtpUser || "").trim().toLowerCase();
}

export function getResolvedSmtpUser() {
  return getStoredSmtpUser() || config.smtpUser || "";
}

export function normalizeAppPassword(value) {
  return String(value || "").replace(/\s+/g, "").trim();
}

export function saveEmailConfig({
  smtpUser,
  smtpPass = "",
  smtpVerified = false,
} = {}) {
  fs.mkdirSync(config.dataDir, { recursive: true });
  const stored = readFile();
  const next = {
    smtpUser: smtpUser
      ? String(smtpUser).trim().toLowerCase()
      : stored.smtpUser || "",
    smtpPass: smtpPass ? normalizeAppPassword(smtpPass) : stored.smtpPass || "",
    smtpVerified:
      smtpPass || smtpUser ? Boolean(smtpVerified) : Boolean(stored.smtpVerified),
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export function getEmailConfigStatus() {
  const stored = readFile();
  const envPass = config.smtpPass;
  const storedPass = stored.smtpPass || "";
  const hasPass = Boolean(envPass || storedPass);

  return {
    smtpUser: getResolvedSmtpUser(),
    hasSmtpPass: hasPass,
    smtpVerified: Boolean(config.resendApiKey || (envPass && hasPass) || stored.smtpVerified),
    passSource: envPass ? "env" : storedPass ? "admin" : "none",
    resendConfigured: Boolean(config.resendApiKey),
    devEthereal: config.enableDevEthereal && !hasPass && !config.resendApiKey,
  };
}
