import { useEffect, useState } from "react";
import {
  createEmptyTimelineItem,
} from "../../cms/aboutDefaults";
import { useAboutContent } from "../../cms/useAboutContent";
import { detectAboutPublishes } from "../../cms/publishDetector";
import { notifyContentPublished } from "../../api/newsletterApi";

const AdminAboutSection = ({ onMessage }) => {
  const { content, loading, setContent, restoreDefaults } = useAboutContent();
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!loading && content) {
      setDraft({
        quote: content.quote,
        bioParagraphs: [...content.bioParagraphs],
        timeline: content.timeline.map((item) => ({ ...item })),
      });
    }
  }, [content, loading]);

  const updateBio = (index, value) => {
    setDraft((prev) => {
      const nextParagraphs = [...prev.bioParagraphs];
      nextParagraphs[index] = value;
      return { ...prev, bioParagraphs: nextParagraphs };
    });
    onMessage("");
  };

  const addBioParagraph = () => {
    setDraft((prev) => ({
      ...prev,
      bioParagraphs: [...prev.bioParagraphs, ""],
    }));
    onMessage("");
  };

  const removeBioParagraph = (index) => {
    setDraft((prev) => ({
      ...prev,
      bioParagraphs: prev.bioParagraphs.filter((_, i) => i !== index),
    }));
    onMessage("");
  };

  const updateTimelineItem = (id, patch) => {
    setDraft((prev) => ({
      ...prev,
      timeline: prev.timeline.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }));
    onMessage("");
  };

  const addTimelineItem = () => {
    setDraft((prev) => ({
      ...prev,
      timeline: [...prev.timeline, createEmptyTimelineItem()],
    }));
    onMessage("");
  };

  const removeTimelineItem = (id) => {
    const item = draft?.timeline.find((entry) => entry.id === id);
    const confirmed = window.confirm(
      `Delete timeline chapter "${item?.title || "this item"}"?`
    );
    if (!confirmed) return;

    setDraft((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((entry) => entry.id !== id),
    }));
    onMessage("");
  };

  const handleSave = async () => {
    if (!draft.quote.trim() && draft.bioParagraphs.every((p) => !p.trim())) {
      setErrors({ form: "Add a quote or at least one bio paragraph." });
      onMessage("");
      return;
    }

    const invalidTimeline = draft.timeline.find(
      (item) => !item.period.trim() || !item.title.trim()
    );
    if (invalidTimeline) {
      setErrors({ form: "Each timeline chapter needs a period and title." });
      onMessage("");
      return;
    }

    try {
      await setContent({
        quote: draft.quote.trim(),
        bioParagraphs: draft.bioParagraphs.map((p) => p.trim()).filter(Boolean),
        timeline: draft.timeline.map((item) => ({
          ...item,
          period: item.period.trim(),
          title: item.title.trim(),
          description: item.description?.trim() || "",
        })),
      });
      setErrors({});

      const savedContent = {
        quote: draft.quote.trim(),
        bioParagraphs: draft.bioParagraphs.map((p) => p.trim()).filter(Boolean),
        timeline: draft.timeline.map((item) => ({
          ...item,
          period: item.period.trim(),
          title: item.title.trim(),
          description: item.description?.trim() || "",
        })),
      };
      const updates = detectAboutPublishes(content, savedContent);
      const notifyResult = await notifyContentPublished(updates);

      onMessage(
        notifyResult?.queued
          ? "About text saved. Newsletter readers will be emailed if the story changed."
          : "About text saved. Visitors can see it on the home page."
      );
    } catch (error) {
      setErrors({ form: error.message || "Failed to save about content." });
      onMessage("");
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm("Reset About bio and timeline to defaults?");
    if (!confirmed) return;

    await restoreDefaults();
    setErrors({});
    onMessage("Restored the original About text.");
  };

  if (loading || !draft) {
    return <p className="admin-hint">Loading about content…</p>;
  }

  return (
    <>
      <div className="admin-section-actions">
        <button type="button" className="admin-btn danger" onClick={handleReset}>
          Restore original About
        </button>
        <button type="button" className="admin-btn primary" onClick={handleSave}>
          Save to website
        </button>
      </div>

      {errors.form ? <p className="admin-error">{errors.form}</p> : null}

      <article className="admin-card admin-card-wide about-admin-card">
        <div className="about-admin-header">
          <h2>Quote and bio</h2>
          <p className="admin-hint">
            This is the short introduction on the home page. The full CV on the
            Creative Journey page is separate.
          </p>
        </div>

        <div className="admin-fields">
          <div className="admin-field">
            <label htmlFor="about-quote">Quote shown above the bio</label>
            <input
              id="about-quote"
              type="text"
              value={draft.quote}
              placeholder="A short line displayed above your bio"
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, quote: event.target.value }))
              }
            />
            <p className="admin-field-hint">
              Keep it brief — this appears as an italic pull quote.
            </p>
          </div>

          <div className="admin-field about-bio-field">
            <div className="about-field-header">
              <label>Bio paragraphs</label>
              <span className="about-paragraph-count">
                {draft.bioParagraphs.length}{" "}
                {draft.bioParagraphs.length === 1 ? "paragraph" : "paragraphs"}
              </span>
            </div>

            <div className="bio-paragraph-list">
              {draft.bioParagraphs.map((paragraph, index) => (
                <div key={`bio-${index}`} className="bio-paragraph-card">
                  <div className="bio-paragraph-card-header">
                    <span className="bio-paragraph-number">
                      Paragraph {index + 1}
                    </span>
                    <button
                      type="button"
                      className="admin-btn danger bio-paragraph-remove"
                      onClick={() => removeBioParagraph(index)}
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    className="admin-textarea bio-paragraph-textarea"
                    rows={4}
                    value={paragraph}
                    placeholder={`Write paragraph ${index + 1} of your bio…`}
                    onChange={(event) => updateBio(index, event.target.value)}
                  />
                  <span className="bio-paragraph-chars">
                    {paragraph.length} characters
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="admin-btn secondary"
              onClick={addBioParagraph}
            >
              + Add paragraph
            </button>
          </div>
        </div>
      </article>

      <section className="about-timeline-section">
        <div className="about-admin-section-header">
          <div>
            <h2>Career chapters</h2>
            <p className="admin-hint">
              These appear as “My Journey” under the bio.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn secondary"
            onClick={addTimelineItem}
          >
            + Add a chapter
          </button>
        </div>

        <div className="admin-list about-timeline-list">
          {draft.timeline.map((item, index) => (
            <article
              key={item.id}
              className="admin-card admin-card-wide timeline-admin-card"
            >
              <div className="timeline-admin-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="admin-fields">
                <div className="admin-field-grid">
                  <div className="admin-field">
                    <label htmlFor={`period-${item.id}`}>Years or period</label>
                    <input
                      id={`period-${item.id}`}
                      type="text"
                      value={item.period}
                      placeholder="e.g. 1980s"
                      onChange={(event) =>
                        updateTimelineItem(item.id, {
                          period: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor={`timeline-title-${item.id}`}>Chapter title</label>
                    <input
                      id={`timeline-title-${item.id}`}
                      type="text"
                      value={item.title}
                      placeholder="Chapter title"
                      onChange={(event) =>
                        updateTimelineItem(item.id, {
                          title: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label htmlFor={`timeline-desc-${item.id}`}>What happened in this chapter</label>
                  <textarea
                    id={`timeline-desc-${item.id}`}
                    className="admin-textarea"
                    rows={4}
                    value={item.description}
                    placeholder="What happened during this chapter?"
                    onChange={(event) =>
                      updateTimelineItem(item.id, {
                        description: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="admin-card-actions">
                  <button
                    type="button"
                    className="admin-btn danger"
                    onClick={() => removeTimelineItem(item.id)}
                  >
                    Delete this chapter
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};

export default AdminAboutSection;
