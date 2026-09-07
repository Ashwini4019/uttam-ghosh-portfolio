import { verifyEmailConfiguration, getEmailProvider } from "../services/emailService.js";
import { getEmailConfigStatus } from "../emailConfigStore.js";

const status = getEmailConfigStatus();
const provider = getEmailProvider();
const result = await verifyEmailConfiguration();

console.log("Email provider:", provider);
console.log("SMTP user:", status.smtpUser || "(not set)");
console.log("Password configured:", status.hasSmtpPass ? "yes" : "no");
console.log("Password source:", status.passSource);
console.log("Verified:", status.smtpVerified ? "yes" : "no");
console.log("Result:", result.message);

if (!status.hasSmtpPass) {
  console.log("\nNext step: Admin → Newsletter → Email Setup → paste Gmail App Password");
  process.exit(1);
}

process.exit(result.ok ? 0 : 1);
