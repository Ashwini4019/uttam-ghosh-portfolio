import { config } from "../config.js";

const CONTENT_TYPE_LABELS = {
  artwork: "New Artwork",
  illustration: "New Illustration",
  photograph: "New Photograph",
  political_cartoon: "New Political Cartoon",
  painting: "New Painting",
  design: "New Design",
  blog_post: "New Blog Post",
  exhibition: "New Exhibition",
  category: "New Category",
  portfolio_update: "Portfolio Update",
  place: "New Place Visited",
  about: "About Update",
};

export function getContentTypeLabel(contentType) {
  return CONTENT_TYPE_LABELS[contentType] || "Portfolio Update";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveImage(imageUrl) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return "";
}

export function buildNewsletterHtml({
  title,
  description,
  contentType,
  imageUrl,
  linkUrl,
  unsubscribeUrl,
}) {
  const label = getContentTypeLabel(contentType);
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const featuredImage = resolveImage(imageUrl);
  const logoUrl = `${config.siteUrl}/favicon.svg`;

  const imageBlock = featuredImage
    ? `<tr>
        <td style="padding:0 32px 24px;">
          <img src="${featuredImage}" alt="${safeTitle}" width="536" style="width:100%;max-width:536px;border-radius:12px;display:block;border:0;" />
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f3ece2;font-family:Georgia,'Times New Roman',serif;color:#1f1f1f;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3ece2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1f1f1f;padding:28px 32px;text-align:center;">
              <img src="${logoUrl}" alt="${escapeHtml(config.siteName)}" width="48" height="48" style="display:inline-block;border-radius:8px;" />
              <p style="margin:14px 0 0;color:#f59d28;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;">${escapeHtml(config.artistName)}</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:700;">${escapeHtml(label)}</h1>
            </td>
          </tr>
          ${imageBlock}
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;font-size:28px;line-height:1.3;color:#1f1f1f;">${safeTitle}</h2>
              <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:#555;font-family:Arial,Helvetica,sans-serif;">${safeDescription || "A new update has been published on the portfolio."}</p>
              <a href="${linkUrl}" style="display:inline-block;background:#f59d28;color:#111;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;font-family:Arial,Helvetica,sans-serif;">View on Website</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;font-family:Arial,Helvetica,sans-serif;">
              <hr style="border:none;border-top:1px solid #e8dfd2;margin:0 0 20px;" />
              <p style="margin:0 0 12px;font-size:13px;color:#777;">Follow ${escapeHtml(config.artistName)}</p>
              <p style="margin:0 0 20px;">
                <a href="${config.linkedInUrl}" style="color:#b87333;text-decoration:none;font-size:14px;font-weight:600;">LinkedIn</a>
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#999;">
                You are receiving this email because you subscribed to updates from ${escapeHtml(config.siteName)}.
                <br />
                <a href="${unsubscribeUrl}" style="color:#999;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildConfirmationHtml({ confirmUrl, name }) {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hello,";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Confirm your subscription</title></head>
<body style="margin:0;padding:32px 16px;background:#f3ece2;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr><td align="center">
      <table role="presentation" width="560" style="max-width:560px;background:#fff;border-radius:16px;padding:32px;">
        <tr><td>
          <h1 style="margin:0 0 16px;font-family:Georgia,serif;color:#1f1f1f;">Confirm your subscription</h1>
          <p style="color:#555;line-height:1.6;">${greeting}</p>
          <p style="color:#555;line-height:1.6;">Please confirm your email to receive automatic notifications when ${escapeHtml(config.artistName)} publishes new artwork, exhibitions, blog posts, and portfolio updates.</p>
          <a href="${confirmUrl}" style="display:inline-block;margin-top:12px;background:#f59d28;color:#111;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:999px;">Confirm subscription</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildSubscriptionWelcomeHtml({
  name,
  unsubscribeUrl,
  confirmUrl = "",
}) {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hello,";
  const logoUrl = `${config.siteUrl}/favicon.svg`;
  const confirmBlock = confirmUrl
    ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#555;font-family:Arial,Helvetica,sans-serif;">
         One more step: please <a href="${confirmUrl}" style="color:#b87333;font-weight:600;">confirm your email address</a> to start receiving portfolio updates.
       </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank you for subscribing</title>
</head>
<body style="margin:0;padding:0;background:#f3ece2;font-family:Georgia,'Times New Roman',serif;color:#1f1f1f;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3ece2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1f1f1f;padding:28px 32px;text-align:center;">
              <img src="${logoUrl}" alt="${escapeHtml(config.siteName)}" width="48" height="48" style="display:inline-block;border-radius:8px;" />
              <p style="margin:14px 0 0;color:#f59d28;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;">${escapeHtml(config.artistName)}</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:700;">Thank You</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;font-size:28px;line-height:1.3;color:#1f1f1f;">Thank you for subscribing</h2>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#555;font-family:Arial,Helvetica,sans-serif;">${greeting}</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#555;font-family:Arial,Helvetica,sans-serif;">
                Thank you for joining the ${escapeHtml(config.siteName)} newsletter. You&apos;ll receive an email when new artwork, illustrations, photographs, exhibitions, blog posts, or portfolio updates are published.
              </p>
              ${confirmBlock}
              <a href="${config.siteUrl}" style="display:inline-block;background:#f59d28;color:#111;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;font-family:Arial,Helvetica,sans-serif;">Visit Portfolio</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;font-family:Arial,Helvetica,sans-serif;">
              <hr style="border:none;border-top:1px solid #e8dfd2;margin:0 0 20px;" />
              <p style="margin:0 0 12px;font-size:13px;color:#777;">Follow ${escapeHtml(config.artistName)}</p>
              <p style="margin:0 0 20px;">
                <a href="${config.linkedInUrl}" style="color:#b87333;text-decoration:none;font-size:14px;font-weight:600;">LinkedIn</a>
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#999;">
                You received this email because you subscribed to the newsletter at ${escapeHtml(config.siteName)}.
                <br />
                <a href="${unsubscribeUrl}" style="color:#999;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildAdminNewSubscriberHtml({ name, email, subscribedAt }) {
  const safeName = escapeHtml(name || "Not given");
  const safeEmail = escapeHtml(email);
  const when = escapeHtml(
    subscribedAt
      ? new Date(subscribedAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Just now"
  );
  const adminUrl = `${config.siteUrl}/admin`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New newsletter subscriber</title>
</head>
<body style="margin:0;padding:32px 16px;background:#f3ece2;font-family:Arial,Helvetica,sans-serif;color:#1f1f1f;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr><td align="center">
      <table role="presentation" width="560" style="max-width:560px;background:#fff;border-radius:16px;padding:32px;">
        <tr><td>
          <p style="margin:0 0 8px;color:#f59d28;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">New subscriber</p>
          <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;">Someone joined the newsletter</h1>
          <p style="color:#555;line-height:1.7;margin:0 0 12px;">A visitor subscribed on the website.</p>
          <p style="margin:0 0 8px;font-size:15px;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin:0 0 8px;font-size:15px;"><strong>Email:</strong> ${safeEmail}</p>
          <p style="margin:0 0 24px;font-size:15px;"><strong>When:</strong> ${when}</p>
          <a href="${adminUrl}" style="display:inline-block;background:#3d8f62;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;">Open subscriber list</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
