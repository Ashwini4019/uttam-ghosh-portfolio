import { getAdminApiPassword } from "../cms/auth";

const API_BASE = import.meta.env.VITE_API_URL || "";

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fallback =
      response.status === 502 || response.status === 503
        ? "Newsletter service is offline. Start the API with npm run dev."
        : "Request failed.";
    const error = new Error(data.error || fallback);
    error.field = data.field;
    throw error;
  }
  return data;
}

function buildHeaders(includeAdmin = false) {
  const headers = { "Content-Type": "application/json" };
  if (includeAdmin) {
    headers["X-Admin-Password"] = getAdminApiPassword();
  }
  return headers;
}

export async function subscribeToNewsletter({ name = "", email }) {
  const response = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ name, email }),
  });
  return parseResponse(response);
}

export async function confirmNewsletterSubscription(token) {
  const response = await fetch(`${API_BASE}/api/newsletter/confirm/${token}`);
  return parseResponse(response);
}

export async function unsubscribeNewsletter(token) {
  const response = await fetch(`${API_BASE}/api/newsletter/unsubscribe/${token}`);
  return parseResponse(response);
}

export async function notifyContentPublished(updates = []) {
  if (!updates.length) return null;

  try {
    const response = await fetch(`${API_BASE}/api/newsletter/notify`, {
      method: "POST",
      headers: buildHeaders(true),
      body: JSON.stringify({ updates }),
    });
    return parseResponse(response);
  } catch (error) {
    console.warn("[newsletter] Publish notification skipped:", error.message);
    return null;
  }
}

export async function saveEmailConfig(smtpPass, smtpUser) {
  const response = await fetch(`${API_BASE}/api/admin/subscribers/email-config`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify({ smtpPass, smtpUser }),
  });
  return parseResponse(response);
}

export async function fetchEmailConfig() {
  const response = await fetch(`${API_BASE}/api/admin/subscribers/email-config`, {
    headers: buildHeaders(true),
  });
  return parseResponse(response);
}

export async function sendTestWelcomeEmail(email) {
  const response = await fetch(`${API_BASE}/api/admin/subscribers/send-test-welcome`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify({ email }),
  });
  return parseResponse(response);
}

export async function resendWelcomeEmail(email) {
  const response = await fetch(`${API_BASE}/api/newsletter/resend-welcome`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ email }),
  });
  return parseResponse(response);
}

export async function fetchSubscribers({ search = "", status = "all" } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status !== "all") params.set("status", status);

  const response = await fetch(
    `${API_BASE}/api/admin/subscribers?${params.toString()}`,
    { headers: buildHeaders(true) }
  );
  return parseResponse(response);
}

export async function fetchSubscriberStats() {
  const response = await fetch(`${API_BASE}/api/admin/subscribers/stats`, {
    headers: buildHeaders(true),
  });
  return parseResponse(response);
}

export async function deleteSubscriber(id) {
  const response = await fetch(`${API_BASE}/api/admin/subscribers/${id}`, {
    method: "DELETE",
    headers: buildHeaders(true),
  });
  return parseResponse(response);
}

export async function updateSubscriberStatus(id, status) {
  const response = await fetch(`${API_BASE}/api/admin/subscribers/${id}/status`, {
    method: "PATCH",
    headers: buildHeaders(true),
    body: JSON.stringify({ status }),
  });
  return parseResponse(response);
}

export async function exportSubscribersCsv({ search = "", status = "all" } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status !== "all") params.set("status", status);

  const response = await fetch(
    `${API_BASE}/api/admin/subscribers/export?${params.toString()}`,
    { headers: buildHeaders(true) }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Export failed.");
  }

  return response.blob();
}

export async function sendTestNewsletter(payload = {}) {
  const response = await fetch(`${API_BASE}/api/admin/subscribers/test`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function checkNewsletterApiHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
