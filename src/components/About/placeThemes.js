export const PLACE_THEMES = {
  adivasi: {
    color: "#3d8f62",
    accent: "Tribal & Community",
  },
  drought: {
    color: "#b86f2e",
    accent: "Documentary Reportage",
  },
  election: {
    color: "#4a7199",
    accent: "Political Coverage",
  },
  fashion: {
    color: "#9a5f7d",
    accent: "Editorial Fashion",
  },
};

export function getPlaceTheme(id, title = "") {
  if (PLACE_THEMES[id]) return PLACE_THEMES[id];

  const key = title.toLowerCase();
  if (key.includes("adivasi") || key.includes("tribal")) {
    return PLACE_THEMES.adivasi;
  }
  if (key.includes("drought")) return PLACE_THEMES.drought;
  if (key.includes("election") || key.includes("political")) {
    return PLACE_THEMES.election;
  }
  if (key.includes("fashion")) return PLACE_THEMES.fashion;

  return {
    color: "#8a7355",
    accent: "Photo Assignment",
  };
}
