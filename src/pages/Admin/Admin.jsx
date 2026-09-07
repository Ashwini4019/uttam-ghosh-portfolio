import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changeAdminPassword, logoutAdmin } from "../../cms/auth";
import AdminPlacesSection from "./AdminPlacesSection";
import AdminAboutSection from "./AdminAboutSection";
import AdminCategoriesSection from "./AdminCategoriesSection";
import AdminNewsletterSection from "./AdminNewsletterSection";
import AdminGuide from "./AdminGuide";
import AdminPasswordInput from "./AdminPasswordInput";
import "./Admin.css";

const TABS = [
  { id: "categories", label: "Artwork", caption: "Homepage galleries" },
  { id: "places", label: "Places", caption: "Photo stories" },
  { id: "about", label: "About", caption: "Bio & journey" },
  { id: "newsletter", label: "Newsletter", caption: "Email sign-ups" },
];

const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("categories");
  const [savedMessage, setSavedMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login", { replace: true });
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    const result = changeAdminPassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    );

    if (!result.ok) {
      setPasswordError(result.error);
      return;
    }

    setPasswordForm(emptyPasswordForm);
    setPasswordSuccess("Password updated. Use the new password next time you log in.");
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-header-kicker">Uttam Ghosh</p>
          <h1>Website Admin</h1>
          <p>Add photos and text here. Visitors only see changes after you save.</p>
        </div>

        <div className="admin-header-actions">
          <Link to="/" className="admin-btn ghost">
            View public site
          </Link>
          <button
            type="button"
            className="admin-btn ghost"
            onClick={() => {
              setShowPasswordForm((open) => !open);
              setPasswordError("");
              setPasswordSuccess("");
            }}
          >
            {showPasswordForm ? "Hide password form" : "Change password"}
          </button>
          <button type="button" className="admin-btn ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="admin-content">
        {savedMessage ? <div className="admin-banner">{savedMessage}</div> : null}

        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSavedMessage("");
              }}
            >
              <span className="admin-tab-label">{tab.label}</span>
              <span className="admin-tab-caption">{tab.caption}</span>
            </button>
          ))}
        </div>

        <AdminGuide tab={activeTab} />

        {showPasswordForm ? (
          <section className="password-panel">
            <h2>Change your admin password</h2>
            <p className="admin-hint">
              You will use the new password the next time you sign in. Choose at least 6
              characters.
            </p>

            <form className="password-form" onSubmit={handlePasswordChange}>
              <div className="admin-field">
                <label htmlFor="current-password">Current password</label>
                <AdminPasswordInput
                  id="current-password"
                  autoComplete="current-password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="new-password">New password</label>
                <AdminPasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: event.target.value,
                    }))
                  }
                  required
                  minLength={6}
                />
              </div>

              <div className="admin-field">
                <label htmlFor="confirm-password">Confirm new password</label>
                <AdminPasswordInput
                  id="confirm-password"
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                  required
                  minLength={6}
                />
              </div>

              {passwordError ? <p className="admin-error">{passwordError}</p> : null}
              {passwordSuccess ? (
                <p className="password-success">{passwordSuccess}</p>
              ) : null}

              <button type="submit" className="admin-btn primary">
                Save new password
              </button>
            </form>
          </section>
        ) : null}

        {activeTab === "categories" ? (
          <AdminCategoriesSection onMessage={setSavedMessage} />
        ) : activeTab === "places" ? (
          <AdminPlacesSection onMessage={setSavedMessage} />
        ) : activeTab === "newsletter" ? (
          <AdminNewsletterSection onMessage={setSavedMessage} />
        ) : (
          <AdminAboutSection onMessage={setSavedMessage} />
        )}
      </main>
    </div>
  );
};

export default Admin;
