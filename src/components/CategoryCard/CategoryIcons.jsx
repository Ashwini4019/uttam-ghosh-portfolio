export function PenNibIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 19l2-8 9-9 3 3-9 9-8 2 3-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 5l3 3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6.5" cy="17.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function CameraIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="7"
        width="18"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7l1.5-2.5h5L16 7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function PencilIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 20l2.2-.7L18 7.5 16.5 6 5 17.5 4 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 7l3 3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function FolderIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7h6l2 2h8v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PaletteIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3c-4.5 0-8 3.2-8 7.5 0 2.5 1.8 4.5 4.2 4.5.8 0 1.3-.4 1.3-1.2 0-.8-.5-1.2-1.3-1.2-.9 0-1.5-.7-1.5-1.8C6.7 9.2 9 7 12 7s5.3 2.2 5.3 5.3c0 2.8-2 4.7-4.8 4.7H12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="8.5" cy="10" r="1" fill="currentColor" />
      <circle cx="11.5" cy="8" r="1" fill="currentColor" />
      <circle cx="14.5" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

export function CartoonIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 10h.01M15 10h.01" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9.5 15c1 1 4 1 5 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function getCategoryIcon(id, title = "") {
  const key = (id || title).toLowerCase();
  if (key.includes("illustr")) return PenNibIcon;
  if (key.includes("political") || key.includes("cartoon")) return CartoonIcon;
  if (key.includes("photo")) return CameraIcon;
  if (key.includes("painting")) return PaletteIcon;
  if (key.includes("design") || key.includes("artwork")) return PencilIcon;
  return PencilIcon;
}
