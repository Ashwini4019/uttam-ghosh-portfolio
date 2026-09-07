const AUTH_KEY = "uttam-ghosh-admin-auth";
const PASSWORD_KEY = "uttam-ghosh-admin-password";

export function getAdminPassword() {
  const saved = localStorage.getItem(PASSWORD_KEY);
  if (saved) return saved;
  return import.meta.env.VITE_ADMIN_PASSWORD || "uttam-admin";
}

export function getAdminApiPassword() {
  return import.meta.env.VITE_ADMIN_PASSWORD || "uttam-admin";
}

export function isAdminAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

export function loginAdmin(password) {
  if (password === getAdminPassword()) {
    sessionStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logoutAdmin() {
  sessionStorage.removeItem(AUTH_KEY);
}

export function changeAdminPassword(currentPassword, newPassword) {
  if (currentPassword !== getAdminPassword()) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const trimmed = newPassword.trim();
  if (trimmed.length < 6) {
    return { ok: false, error: "New password must be at least 6 characters." };
  }

  if (trimmed === currentPassword) {
    return { ok: false, error: "New password must be different from the current one." };
  }

  localStorage.setItem(PASSWORD_KEY, trimmed);
  return { ok: true };
}

export function resetAdminPasswordToDefault() {
  localStorage.removeItem(PASSWORD_KEY);
}
