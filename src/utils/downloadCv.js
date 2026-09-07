import {
  CV_COLLABORATIONS,
  CV_EXPERIENCE,
  CV_EXPERTISE,
  CV_INTERESTS,
  CV_PROFILE,
  CV_TEACHING,
  CV_TECHNICAL,
} from "../cms/cvContent";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function listHtml(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export function buildCvHtmlDocument() {
  const experienceHtml = CV_EXPERIENCE.map((job) => {
    const highlight = job.highlight
      ? `<div class="highlight">
          <h4>${escapeHtml(job.highlight.title)}</h4>
          <p>${escapeHtml(job.highlight.body)}</p>
          <p><strong>Contributions:</strong></p>
          ${listHtml(job.highlight.contributions)}
        </div>`
      : "";

    return `<article class="job">
      <h3>${escapeHtml(job.title)} — ${escapeHtml(job.organisation)}</h3>
      <p class="meta">${escapeHtml(job.period)}${job.duration ? ` | ${escapeHtml(job.duration)}` : ""}</p>
      <p>${escapeHtml(job.summary)}</p>
      <p><strong>Key Responsibilities</strong></p>
      ${listHtml(job.responsibilities)}
      ${highlight}
    </article>`;
  }).join("");

  const teachingHtml = CV_TEACHING.map(
    (item) => `<article class="job">
      <h3>${escapeHtml(item.title)} — ${escapeHtml(item.organisation)}</h3>
      <p>${escapeHtml(item.summary)}</p>
    </article>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(CV_PROFILE.name)} — Curriculum Vitae</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1a; max-width: 820px; margin: 40px auto; padding: 0 24px; line-height: 1.55; }
    h1 { font-size: 34px; margin: 0 0 6px; letter-spacing: 0.04em; }
    .roles { color: #8a5a1a; font-size: 15px; margin-bottom: 28px; }
    h2 { font-size: 18px; border-bottom: 1px solid #d4cdc2; padding-bottom: 6px; margin: 32px 0 16px; letter-spacing: 0.06em; text-transform: uppercase; }
    h3 { font-size: 17px; margin: 0 0 4px; }
    h4 { margin: 12px 0 6px; }
    .meta { color: #666; font-size: 14px; margin: 0 0 10px; }
    .job { margin-bottom: 24px; }
    .highlight { background: #f8f4ee; border-left: 3px solid #c48a3a; padding: 12px 14px; margin-top: 12px; }
    ul { margin: 8px 0 0; padding-left: 20px; }
    li { margin-bottom: 4px; }
    .grid { display: grid; grid-template-columns: 180px 1fr; gap: 8px 16px; }
    .label { color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip { border: 1px solid #d4cdc2; border-radius: 999px; padding: 4px 10px; font-size: 13px; background: #faf8f5; }
    blockquote { margin: 0; padding: 16px 18px; border-left: 3px solid #c48a3a; background: #faf7f2; font-style: italic; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(CV_PROFILE.name).toUpperCase()}</h1>
  <p class="roles">${escapeHtml(CV_PROFILE.roles)}</p>

  <h2>Personal Details</h2>
  <div class="grid">
    <span class="label">Date of Birth</span><span>${escapeHtml(CV_PROFILE.personal.dateOfBirth)}</span>
    <span class="label">Qualification</span><span>${escapeHtml(CV_PROFILE.personal.qualification)}</span>
    <span class="label">Institution</span><span>${escapeHtml(CV_PROFILE.personal.institution)}</span>
    <span class="label">Graduation</span><span>${escapeHtml(CV_PROFILE.personal.graduationYear)}</span>
    <span class="label">Specialisation</span><span>${escapeHtml(CV_PROFILE.personal.specialisation)}</span>
  </div>

  <h2>Professional Experience</h2>
  ${experienceHtml}

  <h2>Teaching &amp; Academic Contributions</h2>
  ${teachingHtml}

  <h2>Additional Professional Collaborations</h2>
  ${listHtml(CV_COLLABORATIONS)}

  <h2>Creative Expertise</h2>
  <div class="chips">${CV_EXPERTISE.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>

  <h2>Technical Skills</h2>
  <div class="chips">${CV_TECHNICAL.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>

  <h2>Areas of Interest</h2>
  <div class="chips">${CV_INTERESTS.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>

  <h2>Creative Philosophy</h2>
  <blockquote>“${escapeHtml(CV_PROFILE.philosophy)}”</blockquote>
</body>
</html>`;
}

export function downloadCv() {
  const html = buildCvHtmlDocument();
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Uttam-Ghosh-CV.html";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
