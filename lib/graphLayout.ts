export interface PositionedNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export const stableIdFromLabel = (label: string) => {
  const base = label
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-я0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return base || `interest-${Date.now().toString(36)}`;
};

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

export const generateInitialLayout = (
  labels: string[],
  center: { x: number; y: number },
  radiusRange: { min: number; max: number } = { min: 240, max: 360 },
  minSeparation = 110,
  existingPoints: Array<{ x: number; y: number }> = []
): PositionedNode[] => {
  const uniqueLabels = Array.from(new Set(labels.filter(Boolean)));
  const count = uniqueLabels.length || 1;
  const angleStep = (Math.PI * 2) / count;

  const placed: PositionedNode[] = [];

  uniqueLabels.forEach((label, index) => {
    const baseAngle = angleStep * index + randomBetween(-0.18, 0.18);
    let angle = baseAngle;
    let radius = randomBetween(radiusRange.min, radiusRange.max);
    let attempts = 0;

    while (attempts < 12) {
      const jitter = randomBetween(-18, 18);
      const x = center.x + Math.cos(angle) * radius + jitter;
      const y = center.y + Math.sin(angle) * radius + jitter;

      const isFarEnough = [...placed, ...existingPoints].every((node) => Math.hypot(node.x - x, node.y - y) >= minSeparation);
      if (isFarEnough) {
        placed.push({ id: stableIdFromLabel(label), label, x, y });
        return;
      }

      angle += angleStep * 0.35;
      radius += 12;
      attempts += 1;
    }

    const fallbackX = center.x + Math.cos(baseAngle) * (radiusRange.max + 40);
    const fallbackY = center.y + Math.sin(baseAngle) * (radiusRange.max + 40);
    placed.push({ id: stableIdFromLabel(label), label, x: fallbackX, y: fallbackY });
  });

  return placed;
};
