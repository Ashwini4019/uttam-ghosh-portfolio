import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { confirmNewsletterSubscription } from "../api/newsletterApi";
import "./NewsletterStatus.css";

const NewsletterConfirm = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    confirmNewsletterSubscription(token)
      .then((result) => {
        if (!active) return;
        setStatus("success");
        setMessage(
          result.message ||
            "Your subscription is confirmed. You'll now receive portfolio updates by email."
        );
      })
      .catch((error) => {
        if (!active) return;
        setStatus("error");
        setMessage(error.message || "Unable to confirm your subscription.");
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="newsletter-status-page">
      <div className="newsletter-status-card">
        <p className="newsletter-status-eyebrow">Newsletter</p>
        <h1>Subscription Confirmation</h1>

        {status === "loading" ? (
          <p className="newsletter-status-text">Confirming your subscription…</p>
        ) : (
          <p
            className={`newsletter-status-text ${status === "error" ? "error" : "success"}`}
          >
            {message}
          </p>
        )}

        <Link to="/" className="newsletter-status-link">
          Back to portfolio
        </Link>
      </div>
    </div>
  );
};

export default NewsletterConfirm;
