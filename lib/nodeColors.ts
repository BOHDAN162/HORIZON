export type ThemeMode = 'light' | 'dark';

type PaletteEntry = {
  dark: [string, string];
  light: [string, string];
};

export type NodeVisual = {
  gradient: string;
  glow: string;
  text: string;
};

const palette: PaletteEntry[] = [
  { dark: ['#9b7bff', '#6dd7ff'], light: ['#c7b8ff', '#7bd5ff'] },
  { dark: ['#ff9bd5', '#ff7b7b'], light: ['#ffd1e9', '#ff9fb0'] },
  { dark: ['#6bd6ff', '#7ce7c5'], light: ['#a8e8ff', '#a3f2da'] },
  { dark: ['#ffd166', '#ff7f50'], light: ['#ffe6a8', '#ffb8a1'] },
  { dark: ['#8ce1ff', '#7f7cff'], light: ['#b9ecff', '#b7b4ff'] },
  { dark: ['#7ce0c3', '#4ac7ff'], light: ['#b7f0dc', '#90d8ff'] },
  { dark: ['#ffb3b8', '#ff6fb1'], light: ['#ffd7dc', '#ff9acb'] },
  { dark: ['#7fb4ff', '#9f7bff'], light: ['#b8d4ff', '#cdb5ff'] },
];

const lighten = (hex: string, amount: number) => {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.min(255, Math.round(((num >> 16) & 0xff) + 255 * amount));
  const g = Math.min(255, Math.round(((num >> 8) & 0xff) + 255 * amount));
  const b = Math.min(255, Math.round((num & 0xff) + 255 * amount));
  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const hashColorIndex = (label: string) => {
  const normalized = label.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash + normalized.charCodeAt(i) * 7 + i * 11) % 997;
  }
  return hash % palette.length;
};

export const getNodeVisual = (index: number, theme: ThemeMode): NodeVisual => {
  const entry = palette[index % palette.length];
  const [start, end] = theme === 'dark' ? entry.dark : entry.light;
  const soft = lighten(start, theme === 'dark' ? 0.1 : 0.22);
  return {
    gradient: `radial-gradient(circle at 30% 30%, ${soft}, ${start} 65%, ${end})`,
    glow: theme === 'dark' ? start : end,
    text: theme === 'dark' ? '#e9eef7' : '#0f172a',
  };
};

export const resolveNodeVisual = (label: string, theme: ThemeMode) => getNodeVisual(hashColorIndex(label), theme);
