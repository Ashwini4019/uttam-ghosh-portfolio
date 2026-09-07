export const REDIFF_URL = "https://www.rediff.com/";

const REDIFF_SPLIT = /(Rediff\.com|rediff\.com|Rediff)/gi;
const REDIFF_MATCH = /^(Rediff\.com|rediff\.com|Rediff)$/i;

export function linkifyRediff(text) {
  if (!text || typeof text !== "string") return text;

  const parts = text.split(REDIFF_SPLIT);

  return parts.map((part, index) => {
    if (REDIFF_MATCH.test(part)) {
      return (
        <a
          key={`rediff-${index}`}
          href={REDIFF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rediff-link"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}
