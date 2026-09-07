import { useState } from "react";
import "./Contact.css";
import { GmailLogo, LinkedInLogo } from "../icons/BrandIcons";
import NewsletterSubscribe from "./NewsletterSubscribe";

export const CONTACT_EMAIL = "uttam.ghosh@gmail.com";
export const CONTACT_LINKEDIN = "https://linkedin.com/in/uttam-ghosh-a0666815";

const CONTACT_CHANNELS = [
  {
    id: "email",
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    hint: "Best for commissions & project briefs",
    cta: "Send an email",
    Logo: GmailLogo,
    external: false,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "linkedin.com/in/uttam-ghosh-a0666815",
    href: CONTACT_LINKEDIN,
    hint: "Connect for collaborations & updates",
    cta: "View profile",
    Logo: LinkedInLogo,
    external: true,
  },
];

const OFFERINGS = [
  { label: "Editorial illustration", icon: "pen" },
  { label: "Photography assignments", icon: "camera" },
  { label: "Cartooning & visual commentary", icon: "speech" },
  { label: "Design & creative direction", icon: "compass" },
];

const OfferingIcon = ({ icon }) => {
  if (icon === "camera") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 8h3l2-3h6l2 3h3v11H4V8z" />
        <circle cx="12" cy="13" r="3.2" />
      </svg>
    );
  }

  if (icon === "speech") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 6h14v9H9l-4 3V6z" />
      </svg>
    );
  }

  if (icon === "compass") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M14.5 9.5 11 13.5 9.5 10z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 20V5l8 4-8 3" />
      <path d="M14 20h4V9" />
    </svg>
  );
};

const Contact = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${CONTACT_EMAIL}`;
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-ornament" aria-hidden="true">
        <span />
        <span className="contact-ornament-diamond" />
        <span />
      </div>

      <div className="contact-decor contact-decor-left" aria-hidden="true" />
      <div className="contact-decor contact-decor-right" aria-hidden="true" />

      <div className="contact-header">
        <p className="contact-eyebrow">Let&apos;s Connect</p>
        <h2 className="contact-title">GET IN TOUCH</h2>
        <p className="contact-intro">
          Available for commissions, editorial work, collaborations, and creative
          inquiries. I&apos;d love to hear about your project.
        </p>
        <span className="contact-status">Open for commissions</span>
      </div>

      <div className="contact-layout">
        <aside className="contact-aside">
          <div className="contact-aside-card">
            <h3>What I can help with</h3>
            <ul className="contact-offerings">
              {OFFERINGS.map((item) => (
                <li key={item.label}>
                  <span className="contact-offering-icon" aria-hidden="true">
                    <OfferingIcon icon={item.icon} />
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="contact-aside-meta">
            <div className="contact-meta-item contact-meta-location">
              <span className="contact-meta-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.2" />
                </svg>
              </span>
              <span>
                <span className="contact-meta-label">Based in</span>
                <span className="contact-meta-value">India</span>
              </span>
            </div>
            <div className="contact-meta-item contact-meta-response">
              <span className="contact-meta-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8v4l3 2" />
                </svg>
              </span>
              <span>
                <span className="contact-meta-label">Response</span>
                <span className="contact-meta-value">Within 2–3 business days</span>
              </span>
            </div>
          </div>

          <blockquote className="contact-quote">
            <span className="contact-quote-mark" aria-hidden="true">“</span>
            Every project begins with a conversation — share your idea and
            we&apos;ll find the right visual language together.
          </blockquote>
        </aside>

        <div className="contact-links">
          {CONTACT_CHANNELS.map((channel) => {
            const { Logo } = channel;

            return (
              <a
                key={channel.id}
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
                className={`contact-link contact-link-${channel.id}`}
              >
                <div className="contact-link-icon">
                  <Logo className="contact-logo" size={40} />
                </div>

                <div className="contact-link-body">
                  <span className="contact-label">{channel.label}</span>
                  <span className="contact-value">{channel.value}</span>
                  <span className="contact-hint">{channel.hint}</span>
                </div>

                <span className="contact-cta">
                  {channel.cta}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </a>
            );
          })}

          <button type="button" className="contact-copy-btn" onClick={copyEmail}>
            {copied ? "Email copied" : "Copy email address"}
          </button>
        </div>
      </div>

      <NewsletterSubscribe />
    </section>
  );
};

export default Contact;
