export const themeTokens = {
  background: "var(--color-bg)",
  foreground: "var(--color-fg)",
  canvas: "var(--color-canvas)",
};

/**
 * Hilfsfunktion, um zukünftige Themes zentral zu verwalten.
 */
export const applyTheme = () => {
  document.documentElement.style.setProperty("--color-bg", "#0f172a");
  document.documentElement.style.setProperty("--color-fg", "#e2e8f0");
  document.documentElement.style.setProperty("--color-canvas", "#1e293b");
};
