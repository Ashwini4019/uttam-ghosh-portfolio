export const CATEGORY_THEMES = {
  illustrations: {
    color: "#3d5c4a",
    light: "#eef3ef",
    label: "Illustrations",
  },
  "political-cartoons": {
    color: "#5c4a3d",
    light: "#f3efea",
    label: "Political Cartoons",
  },
  photographs: {
    color: "#6b7354",
    light: "#f0f1ea",
    label: "Photographs",
  },
  "design-artworks": {
    color: "#8b6f7d",
    light: "#f3eef1",
    label: "Design & Other Artworks",
  },
  designs: {
    color: "#8b6f7d",
    light: "#f3eef1",
    label: "Designs",
  },
  paintings: {
    color: "#6b4a5c",
    light: "#f3eaee",
    label: "Paintings",
  },
};

export function getCategoryTheme(id, title = "") {
  if (CATEGORY_THEMES[id]) return CATEGORY_THEMES[id];

  const key = title.toLowerCase();
  if (key.includes("illustr")) return CATEGORY_THEMES.illustrations;
  if (key.includes("political") || key.includes("cartoon")) {
    return CATEGORY_THEMES["political-cartoons"];
  }
  if (key.includes("photo")) return CATEGORY_THEMES.photographs;
  if (key.includes("painting")) return CATEGORY_THEMES.paintings;
  if (key.includes("design") || key.includes("artwork")) {
    return CATEGORY_THEMES["design-artworks"];
  }

  return {
    color: "#7a6b5a",
    light: "#f2efe9",
    label: title,
  };
}
