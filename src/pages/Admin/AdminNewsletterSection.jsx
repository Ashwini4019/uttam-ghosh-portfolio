import { useCallback, useEffect, useState } from "react";
import {
  checkNewsletterApiHealth,
  deleteSubscriber,
  exportSubscribersCsv,
  fetchSubscribers,
  resendWelcomeEmail,
  saveEmailConfig,
  sendTestNewsletter,
  sendTestWelcomeEmail,
  updateSubscriberStatus,
} from "../../api/newsletterApi";
import AdminPasswordInput from "./AdminPasswordInput";

const STATUS_OPTIONS = [
  { value: "all", label: "Everyone" },
  { value: "active", label: "Receiving emails" },
  { value: "pending", label: "Waiting to confirm" },
  { value: "unsubscribed", label: "Stopped emails" },
];

const STATUS_LABELS = {
  active: "Receiving emails",
  pending: "Waiting to confirm",
  unsubscribed: "Stopped emails",
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

const AdminNewsletterSection = ({ onMessage }) => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    unsubscribed: 0,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(true);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [realEmailConfigured, setRealEmailConfigured] = useState(false);
  const [emailProvider, setEmailProvider] = useState("none");
  const [smtpUser, setSmtpUser] = useState("uttam.ghosh@gmail.com");
  const [hasSmtpPass, setHasSmtpPass] = useState(false);
  const [smtpPass, setSmtpPass] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [error, setError] = useState("");

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const online = await checkNewsletterApiHealth();
      setApiOnline(online);

      if (!online) {
        setError(
          "The email list cannot be reached right now. Restart the website with npm run dev, then try again."
        );
        setSubscribers([]);
        return;
      }

      const result = await fetchSubscribers({ search, status });
      setSubscribers(result.subscribers || []);
      setEmailConfigured(Boolean(result.emailConfigured));
      setRealEmailConfigured(Boolean(result.emailConfig?.smtpVerified));
      setHasSmtpPass(Boolean(result.emailConfig?.hasSmtpPass));
      setEmailProvider(result.emailProvider || "none");
      if (result.emailConfig?.smtpUser) {
        setSmtpUser(result.emailConfig.smtpUser);
      }
      setStats(
        result.stats || {
          total: 0,
          active: 0,
          pending: 0,
          unsubscribed: 0,
        }
      );
    } catch (loadError) {
      setError(loadError.message || "Unable to load subscribers.");
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSubscribers();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadSubscribers]);

  const handleExport = async () => {
    try {
      const blob = await exportSubscribersCsv({ search, status });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `newsletter-subscribers-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      onMessage("Downloaded the subscriber list.");
    } catch (exportError) {
      onMessage("");
      setError(exportError.message || "CSV export failed.");
    }
  };

  const handleDelete = async (subscriber) => {
    const confirmed = window.confirm(
      `Remove ${subscriber.email} from the list? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteSubscriber(subscriber.id);
      onMessage(`Removed ${subscriber.email} from the subscriber list.`);
      loadSubscribers();
    } catch (deleteError) {
      onMessage("");
      setError(deleteError.message || "Unable to delete subscriber.");
    }
  };

  const handleStatusChange = async (subscriber, nextStatus) => {
    try {
      await updateSubscriberStatus(subscriber.id, nextStatus);
      onMessage(`Updated ${subscriber.email} to ${nextStatus}.`);
      loadSubscribers();
    } catch (statusError) {
      onMessage("");
      setError(statusError.message || "Unable to update subscriber status.");
    }
  };

  const handleSaveEmailConfig = async (event) => {
    event.preventDefault();
    setSavingEmail(true);
    setError("");

    try {
      const result = await saveEmailConfig(smtpPass, smtpUser);
      setSmtpPass("");
      setHasSmtpPass(true);
      setRealEmailConfigured(Boolean(result.verified));
      setEmailProvider(result.emailProvider || "smtp");

      if (result.verified) {
        onMessage(result.message || "Gmail SMTP configured successfully.");
        setError("");
      } else {
        onMessage("");
        setError(
          result.message ||
            "App password saved, but Gmail connection failed. Check 2-Step Verification and create a new App Password."
        );
      }

      loadSubscribers();
    } catch (saveError) {
      onMessage("");
      setError(saveError.message || "Failed to save Gmail configuration.");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSendTestWelcome = async () => {
    if (!testEmail.trim()) {
      setError("Enter an email address to send a test welcome email.");
      return;
    }

    try {
      const result = await sendTestWelcomeEmail(testEmail.trim());
      onMessage(result.message || `Test welcome email sent to ${testEmail}.`);
      setError("");
    } catch (testError) {
      onMessage("");
      setError(testError.message || "Failed to send test welcome email.");
    }
  };

  const handleResendWelcome = async (subscriber) => {
    try {
      const result = await resendWelcomeEmail(subscriber.email);
      onMessage(result.message || `Welcome email resent to ${subscriber.email}.`);
    } catch (resendError) {
      onMessage("");
      setError(resendError.message || "Unable to resend welcome email.");
    }
  };

  const handleTestEmail = async () => {
    try {
      const result = await sendTestNewsletter({
        title: "Portfolio Newsletter Test",
        description:
          "This is a test email from the automated newsletter system.",
        contentType: "portfolio_update",
      });
      onMessage(result.message || "Test newsletter queued.");
    } catch (testError) {
      onMessage("");
      setError(testError.message || "Unable to queue test newsletter.");
    }
  };

  return (
    <>
      <div className="newsletter-admin-stats">
        <div className="newsletter-stat-card">
          <span className="newsletter-stat-label">Signed up</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="newsletter-stat-card active">
          <span className="newsletter-stat-label">Receiving emails</span>
          <strong>{stats.active}</strong>
        </div>
        <div className="newsletter-stat-card pending">
          <span className="newsletter-stat-label">Waiting</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="newsletter-stat-card unsubscribed">
          <span className="newsletter-stat-label">Stopped</span>
          <strong>{stats.unsubscribed}</strong>
        </div>
      </div>

      <div className="admin-section-actions newsletter-admin-actions">
        <button type="button" className="admin-btn secondary" onClick={handleExport}>
          Download list
        </button>
        <button type="button" className="admin-btn secondary" onClick={handleTestEmail}>
          Send myself a test email
        </button>
        <button
          type="button"
          className="admin-btn ghost"
          onClick={loadSubscribers}
          disabled={loading}
        >
          Refresh list
        </button>
      </div>

      {!apiOnline ? (
        <div className="admin-banner">
          The email list is not available right now. People can still fill the
          subscribe form, but you cannot manage names here until the site is restarted.
        </div>
      ) : null}

      {apiOnline ? (
        <article className="admin-card admin-card-wide newsletter-email-setup">
          <h2>{realEmailConfigured ? "Change Gmail" : "Turn on welcome emails"}</h2>
          <p className="admin-hint">
            {realEmailConfigured
              ? "Type a different Gmail below. Then paste that account’s App Password (not the normal Gmail password)."
              : "Names are saved even without this. Complete it if you want new subscribers to receive a welcome email."}
          </p>

          <ul className="newsletter-email-status-list">
            <li className={smtpUser ? "ready" : "missing"}>
              Sending from: {smtpUser || "Not set yet"}
            </li>
            <li className={hasSmtpPass ? "ready" : "missing"}>
              Gmail key: {hasSmtpPass ? "saved" : "not added yet"}
            </li>
            <li className={realEmailConfigured ? "ready" : "missing"}>
              Emails: {realEmailConfigured ? "working" : "not sending yet"}
            </li>
          </ul>

          <ol className="newsletter-email-steps">
            <li>
              Sign in to the Gmail you want to use. Open Google Account → Security and turn on{" "}
              <strong>2-Step Verification</strong>.
            </li>
            <li>
              Create an App Password at{" "}
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google App Passwords
              </a>
              . Choose Mail → Other, name it “Portfolio”.
            </li>
            <li>Type that Gmail below, then paste its 16-character App Password.</li>
            <li>Save, then send a test email to yourself.</li>
          </ol>

          <form className="newsletter-email-setup-form" onSubmit={handleSaveEmailConfig}>
            <div className="admin-field">
              <label htmlFor="smtp-user">Gmail address to send from</label>
              <input
                id="smtp-user"
                type="email"
                value={smtpUser}
                onChange={(event) => setSmtpUser(event.target.value)}
                placeholder="you@gmail.com"
                autoComplete="username"
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="smtp-pass">Gmail App Password (16 characters)</label>
              <AdminPasswordInput
                id="smtp-pass"
                value={smtpPass}
                onChange={(event) => setSmtpPass(event.target.value)}
                placeholder="xxxx xxxx xxxx xxxx"
                autoComplete="new-password"
                required
              />
              <span className="admin-hint">
                Google’s App Password is 16 letters only. Do not type your normal Gmail password.
              </span>
            </div>

            <button type="submit" className="admin-btn primary" disabled={savingEmail}>
              {savingEmail ? "Saving…" : "Save and turn on emails"}
            </button>
          </form>

          <div className="newsletter-test-email">
            <div className="admin-field">
              <label htmlFor="test-welcome-email">Send a test welcome email to</label>
              <input
                id="test-welcome-email"
                type="email"
                value={testEmail}
                onChange={(event) => setTestEmail(event.target.value)}
                placeholder="your@gmail.com"
              />
            </div>
            <button
              type="button"
              className="admin-btn secondary"
              onClick={handleSendTestWelcome}
              disabled={!hasSmtpPass}
            >
              Send a test email
            </button>
          </div>
        </article>
      ) : null}

      {apiOnline && realEmailConfigured ? (
        <div className="admin-banner newsletter-email-ready">
          Welcome emails are on. New subscribers will get a message in their inbox.
        </div>
      ) : null}

      {apiOnline && !realEmailConfigured && emailProvider === "ethereal-dev" ? (
        <div className="admin-banner newsletter-email-warning">
          <strong>Test mode only.</strong> Emails are not going to real inboxes yet.
          Add a Gmail App Password above.
        </div>
      ) : null}

      {apiOnline && !realEmailConfigured && emailProvider === "none" ? (
        <div className="admin-banner newsletter-email-warning">
          <strong>Welcome emails are not going out yet.</strong> Add the Gmail App
          Password in the box above if you want people to receive them.
        </div>
      ) : null}

      {error ? <p className="admin-error">{error}</p> : null}

      <article className="admin-card admin-card-wide newsletter-admin-card">
        <div className="newsletter-admin-toolbar">
          <div className="admin-field newsletter-search-field">
            <label htmlFor="subscriber-search">Find a person</label>
            <input
              id="subscriber-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Type a name or email"
            />
          </div>

          <div className="admin-field newsletter-filter-field">
            <label htmlFor="subscriber-status">Show</label>
            <select
              id="subscriber-status"
              className="admin-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="admin-hint">Loading subscribers…</p>
        ) : subscribers.length === 0 ? (
          <p className="admin-hint">No one matches this search yet.</p>
        ) : (
          <div className="newsletter-table-wrap">
            <table className="newsletter-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Signed up</th>
                  <th>Last email sent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td>{subscriber.name || "—"}</td>
                    <td>{subscriber.email}</td>
                    <td>
                      <span className={`newsletter-status-pill ${subscriber.status}`}>
                        {STATUS_LABELS[subscriber.status] || subscriber.status}
                      </span>
                    </td>
                    <td>{formatDate(subscriber.subscribedAt)}</td>
                    <td>{formatDate(subscriber.lastNotificationSent)}</td>
                    <td>
                      <div className="newsletter-row-actions">
                        <button
                          type="button"
                          className="admin-btn ghost"
                          onClick={() => handleResendWelcome(subscriber)}
                          disabled={!realEmailConfigured}
                        >
                          Send welcome again
                        </button>
                        {subscriber.status !== "active" ? (
                          <button
                            type="button"
                            className="admin-btn secondary"
                            onClick={() => handleStatusChange(subscriber, "active")}
                          >
                            Start emails
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn ghost"
                            onClick={() =>
                              handleStatusChange(subscriber, "unsubscribed")
                            }
                          >
                            Stop emails
                          </button>
                        )}
                        <button
                          type="button"
                          className="admin-btn danger"
                          onClick={() => handleDelete(subscriber)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </>
  );
};

export default AdminNewsletterSection;
