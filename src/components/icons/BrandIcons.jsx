const iconProps = (className, size = 24) => ({
  className,
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
});

export function RediffLogo({ className = "", size = 24 }) {
  return (
    <svg {...iconProps(className, size)} role="img" aria-label="Rediff">
      <title>Rediff</title>
      <rect width="24" height="24" rx="4" fill="#CC0000" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="7.5"
        fontWeight="700"
      >
        rediff
      </text>
    </svg>
  );
}

export function SundayObserverLogo({ className = "", size = 24 }) {
  return (
    <svg {...iconProps(className, size)} role="img" aria-label="Sunday Observer">
      <title>Sunday Observer</title>
      <rect width="24" height="24" rx="4" fill="#1a365d" />
      <rect x="5" y="6" width="14" height="12" rx="1" fill="#fff" />
      <line x1="7" y1="9" x2="17" y2="9" stroke="#1a365d" strokeWidth="1.2" />
      <line x1="7" y1="11.5" x2="17" y2="11.5" stroke="#1a365d" strokeWidth="1.2" />
      <line x1="7" y1="14" x2="13" y2="14" stroke="#1a365d" strokeWidth="1.2" />
    </svg>
  );
}

export function LinkedInLogo({ className = "", size = 24 }) {
  return (
    <svg {...iconProps(className, size)} role="img" aria-label="LinkedIn">
      <title>LinkedIn</title>
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M7.5 9.5h2.2v9H7.5v-9ZM8.6 6.5a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM12.1 9.5h2.1v1.2h.03c.29-.55 1-1.14 2.06-1.14 2.2 0 2.61 1.45 2.61 3.33v5.7h-2.2v-5.05c0-1.2-.02-2.75-1.68-2.75-1.68 0-1.94 1.31-1.94 2.66v5.14h-2.2v-9Z"
      />
    </svg>
  );
}

export function GmailLogo({ className = "", size = 24 }) {
  return (
    <svg {...iconProps(className, size)} role="img" aria-label="Email">
      <title>Email</title>
      <rect width="24" height="24" rx="4" fill="#fff" stroke="#e0e0e0" strokeWidth="0.5" />
      <path fill="#EA4335" d="M4 7.5 12 13l8-5.5V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v.5Z" />
      <path fill="#34A853" d="M4 7.5v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9L12 13 4 7.5Z" />
      <path fill="#FBBC04" d="M20 7.5 12 13 4 7.5V7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v.5Z" />
      <path fill="#4285F4" d="M4 7.5 12 13l8-5.5H5a1 1 0 0 0-1 1v.5Z" />
    </svg>
  );
}

export function ArtEducationLogo({ className = "", size = 24 }) {
  return (
    <svg {...iconProps(className, size)} role="img" aria-label="Education">
      <title>Education</title>
      <rect width="24" height="24" rx="4" fill="#f59d28" />
      <path
        fill="#111"
        d="M12 5 4 9.5 12 14l8-4.5L12 5Zm0 11.5-6.5-3.7V15L12 18.5l6.5-3.5v-1.7L12 16.5Z"
      />
    </svg>
  );
}

export function CreativeEraLogo({ className = "", size = 24 }) {
  return (
    <svg {...iconProps(className, size)} role="img" aria-label="Creative era">
      <title>Creative era</title>
      <rect width="24" height="24" rx="4" fill="#2a2a2a" />
      <rect x="5" y="7" width="14" height="10" rx="1.5" stroke="#f59d28" strokeWidth="1.2" />
      <line x1="8" y1="17" x2="16" y2="17" stroke="#f59d28" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="2" fill="#f59d28" />
    </svg>
  );
}

export function getPublicationLogo(name) {
  const key = name.toLowerCase();
  if (key.includes("rediff")) return RediffLogo;
  if (key.includes("observer")) return SundayObserverLogo;
  return null;
}

export function getTimelineLogo(item) {
  const text = `${item?.period || ""} ${item?.title || ""}`.toLowerCase();

  if (text.includes("rediff")) return RediffLogo;
  if (text.includes("observer")) return SundayObserverLogo;
  if (
    text.includes("education") ||
    text.includes("institute") ||
    text.includes("j. j.")
  ) {
    return ArtEducationLogo;
  }
  if (text.includes("1980")) return CreativeEraLogo;

  return null;
}
