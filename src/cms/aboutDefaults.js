export const ABOUT_STORAGE_KEY = "uttam-ghosh-about-content-v2";

export const DEFAULT_ABOUT = {
  quote: "Visualising concepts, creating illustrations quickly, and my love for colour are what keep me going.",
  bioParagraphs: [
    "Uttam Ghosh is an illustrator, cartoonist, designer, and photographer whose career spans editorial media, advertising, and visual storytelling.",
    "A graduate of Sir J. J. Institute of Applied Art, Mumbai (BFA Applied Art, 1985), he went on to shape the visual identity of India’s first Sunday newspaper and later spent 23 years as Joint Creative Head at Rediff.com.",
    "His work moves between political cartoons, editorial illustration, design, and news photography — always grounded in a love of colour, concept, and clear visual communication.",
  ],
  timeline: [
    {
      id: "education",
      period: "1985",
      title: "Sir J. J. Institute of Applied Art",
      description:
        "Bachelor of Fine Arts in Applied Art, with a specialisation in Illustration — the foundation of a lifelong practice in visual storytelling.",
    },
    {
      id: "gannon",
      period: "1985–1987",
      title: "Visualiser — Gannon Advertising",
      description:
        "Advertising layouts, graphics, and illustrations, including an award-winning Anti-Drug Abuse campaign for the Federation of Advertising Clubs of India.",
    },
    {
      id: "observer",
      period: "1993–2001",
      title: "Creative Director — The Sunday Observer",
      description:
        "Political cartoons, editorial design, and creative direction for India’s first Sunday newspaper — including the column “Drawing the Lines” and the children’s character “Slurrpy.”",
    },
    {
      id: "rediff",
      period: "2001–2024",
      title: "Joint Creative Head — Rediff.com",
      description:
        "Twenty-three years of editorial cartoons, illustrations, graphics, and digital visual storytelling — also contributing to India Abroad in New York.",
    },
  ],
};

export function createEmptyTimelineItem() {
  return {
    id: crypto.randomUUID(),
    period: "New Chapter",
    title: "Title",
    description: "",
  };
}

export function normalizeAboutContent(stored) {
  const fallback = DEFAULT_ABOUT;

  return {
    quote: typeof stored?.quote === "string" ? stored.quote : fallback.quote,
    bioParagraphs: Array.isArray(stored?.bioParagraphs)
      ? stored.bioParagraphs.filter((p) => typeof p === "string")
      : [...fallback.bioParagraphs],
    timeline: Array.isArray(stored?.timeline)
      ? stored.timeline.map((item) => ({
          id: item.id || crypto.randomUUID(),
          period: item.period?.trim() || "Chapter",
          title: item.title?.trim() || "Untitled",
          description: item.description?.trim() || "",
        }))
      : fallback.timeline.map((item) => ({ ...item })),
  };
}
