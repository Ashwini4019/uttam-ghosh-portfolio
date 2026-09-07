import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { unsubscribeNewsletter } from "../api/newsletterApi";
import "./NewsletterStatus.css";

const NewsletterUnsubscribe = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    unsubscribeNewsletter(token)
      .then((result) => {
        if (!active) return;
        setStatus("success");
        setMessage(
          result.message ||
            "You have been unsubscribed and will no longer receive newsletter emails."
        );
      })
      .catch((error) => {
        if (!active) return;
        setStatus("error");
        setMessage(error.message || "Unable to process your unsubscribe request.");
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="newsletter-status-page">
      <div className="newsletter-status-card">
        <p className="newsletter-status-eyebrow">Newsletter</p>
        <h1>Unsubscribe</h1>

        {status === "loading" ? (
          <p className="newsletter-status-text">Processing your request…</p>
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

export default NewsletterUnsubscribe;
