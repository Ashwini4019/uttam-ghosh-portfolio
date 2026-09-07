import { useEffect, useState } from "react";
import { subscribeToNewsletter } from "../../api/newsletterApi";
import {
  validateEmail,
  validateName,
  validateSubscribeInput,
} from "../../utils/newsletterValidation";
import "./NewsletterSubscribe.css";

const NewsletterSubscribe = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const closeSuccessModal = () => setShowSuccessModal(false);

  useEffect(() => {
    if (!showSuccessModal) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") closeSuccessModal();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showSuccessModal]);

  const validateField = (field, value) => {
    const result = field === "name" ? validateName(value) : validateEmail(value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: result.ok ? "" : result.error,
    }));
    return result.ok;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validation = validateSubscribeInput({ name, email });
    if (!validation.ok) {
      setFieldErrors({
        name: validation.field === "name" ? validation.error : "",
        email: validation.field === "email" ? validation.error : "",
      });
      setError(validation.error);
      return;
    }

    setFieldErrors({ name: "", email: "" });
    setLoading(true);

    try {
      await subscribeToNewsletter({
        name: validation.name,
        email: validation.email,
      });

      setName("");
      setEmail("");
      setShowSuccessModal(true);
    } catch (submitError) {
      if (submitError.field === "name" || submitError.field === "email") {
        setFieldErrors((prev) => ({
          ...prev,
          [submitError.field]: submitError.message,
        }));
      }
      setError(submitError.message || "Unable to subscribe right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="newsletter-subscribe" aria-labelledby="newsletter-title">
        <div className="newsletter-subscribe-inner">
          <div className="newsletter-subscribe-copy">
            <p className="newsletter-eyebrow">Stay Updated</p>
            <h3 id="newsletter-title">Subscribe to Newsletter</h3>
            <p className="newsletter-description">
              Get automatic email alerts when new artwork, illustrations, photographs,
              exhibitions, blog posts, or portfolio updates are published.
            </p>
          </div>

          <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
            <div className="newsletter-field">
              <label htmlFor="newsletter-name">Full Name (optional)</label>
              <input
                id="newsletter-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (fieldErrors.name) validateField("name", event.target.value);
                }}
                onBlur={(event) => validateField("name", event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                disabled={loading}
                maxLength={80}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "newsletter-name-error" : undefined}
              />
              {fieldErrors.name ? (
                <p id="newsletter-name-error" className="newsletter-field-error" role="alert">
                  {fieldErrors.name}
                </p>
              ) : null}
            </div>

            <div className="newsletter-field">
              <label htmlFor="newsletter-email">
                Email Address <span aria-hidden="true">*</span>
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (fieldErrors.email) validateField("email", event.target.value);
                }}
                onBlur={(event) => validateField("email", event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading}
                maxLength={254}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "newsletter-email-error" : undefined}
              />
              {fieldErrors.email ? (
                <p id="newsletter-email-error" className="newsletter-field-error" role="alert">
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            {error && !fieldErrors.name && !fieldErrors.email ? (
              <p className="newsletter-message newsletter-message-error" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="newsletter-submit"
              disabled={loading}
            >
              {loading ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        </div>
      </section>

      {showSuccessModal ? (
        <div
          className="newsletter-modal-overlay"
          role="presentation"
          onClick={closeSuccessModal}
        >
          <div
            className="newsletter-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-success-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="newsletter-modal-icon" aria-hidden="true">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h4 id="newsletter-success-title">Thank you for subscribing</h4>
            <p>
              You&apos;re on the list. You&apos;ll hear from Uttam Ghosh when new
              artwork, exhibitions, or portfolio updates go live.
            </p>
            <button
              type="button"
              className="newsletter-modal-btn"
              onClick={closeSuccessModal}
            >
              Great!
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default NewsletterSubscribe;
