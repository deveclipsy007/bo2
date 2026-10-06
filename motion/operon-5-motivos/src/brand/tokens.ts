// Tokens do Operon Motion System v3.3 (tokens.json do brand kit). Cor só com função; Fluffy tem gradiente próprio.
export const COLORS = {
  paper: '#f5f4f0', white: '#ffffff', ink: '#0b0b0c', night: '#06080e', muted: '#8a8a8e', line: '#e3e3e3',
  blue: '#3d5afe', blueSoft: '#8fa2ff', gold: '#f5b942', amber: '#ff9a3c', cyan: '#5fe0ea',
} as const;

// Georgia itálica é a fonte de ênfase do kit; no render Linux entra Gelasio (clone métrico da Georgia, OFL) embutida.
export const FONTS = {
  display: "Manrope, 'DM Sans', system-ui, sans-serif",
  body: "'DM Sans', system-ui, sans-serif",
  serif: "Gelasio, Georgia, 'Times New Roman', serif",
  data: "ui-monospace, Menlo, 'SF Mono', monospace",
} as const;

export const SURFACE = {
  cardRadius: 30,
  lightShadow: '0 30px 70px rgba(0,0,0,.09), 0 0 0 1px rgba(0,0,0,.05)',
  darkBg: 'linear-gradient(180deg, rgba(34,34,38,.92), rgba(18,18,20,.94))',
  darkShadow: 'inset 0 1px 0 rgba(255,255,255,.1), 0 0 0 1px rgba(255,255,255,.07), 0 40px 90px rgba(0,0,0,.55)',
} as const;
