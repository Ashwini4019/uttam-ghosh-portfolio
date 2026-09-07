export function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export function validateEmail(email) {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    return { ok: false, error: "Email address is required." };
  }

  if (normalized.length > 254) {
    return { ok: false, error: "Email address is too long." };
  }

  if (normalized.includes("..") || normalized.startsWith(".") || normalized.endsWith(".")) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const pattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!pattern.test(normalized)) {
    return {
      ok: false,
      error: "Please enter a valid email address (e.g. you@example.com).",
    };
  }

  return { ok: true, value: normalized };
}

export function validateName(name) {
  const trimmed = String(name || "").trim().replace(/\s+/g, " ");

  if (!trimmed) {
    return { ok: true, value: "" };
  }

  if (trimmed.length < 2) {
    return { ok: false, error: "Name must be at least 2 characters." };
  }

  if (trimmed.length > 80) {
    return { ok: false, error: "Name must be 80 characters or less." };
  }

  if (!/^[\p{L}\s'.-]+$/u.test(trimmed)) {
    return {
      ok: false,
      error: "Name can only contain letters, spaces, hyphens, and apostrophes.",
    };
  }

  return { ok: true, value: trimmed };
}

export function validateSubscribeInput({ name = "", email = "" }) {
  const nameResult = validateName(name);
  if (!nameResult.ok) {
    return { ok: false, field: "name", error: nameResult.error };
  }

  const emailResult = validateEmail(email);
  if (!emailResult.ok) {
    return { ok: false, field: "email", error: emailResult.error };
  }

  return {
    ok: true,
    name: nameResult.value,
    email: emailResult.value,
  };
}
