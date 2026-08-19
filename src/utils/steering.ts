export interface RectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Clamps a point into a rectangle whose four corners are rounded off by
 * `cornerRadius`, so nothing can ever settle into a literal corner pixel.
 */
export function clampToRoundedRect(
  x: number,
  y: number,
  bounds: RectBounds,
  cornerRadius: number,
): { x: number; y: number } {
  const minX = bounds.x;
  const minY = bounds.y;
  const maxX = bounds.x + bounds.width;
  const maxY = bounds.y + bounds.height;

  let cx = Math.min(Math.max(x, minX), maxX);
  let cy = Math.min(Math.max(y, minY), maxY);

  const leftZone = cx < minX + cornerRadius;
  const rightZone = cx > maxX - cornerRadius;
  const topZone = cy < minY + cornerRadius;
  const bottomZone = cy > maxY - cornerRadius;

  if ((leftZone || rightZone) && (topZone || bottomZone)) {
    const ccx = leftZone ? minX + cornerRadius : maxX - cornerRadius;
    const ccy = topZone ? minY + cornerRadius : maxY - cornerRadius;
    const dx = cx - ccx;
    const dy = cy - ccy;
    const dist = Math.hypot(dx, dy);
    if (dist > cornerRadius) {
      const nx = dist === 0 ? 1 : dx / dist;
      const ny = dist === 0 ? 0 : dy / dist;
      cx = ccx + nx * cornerRadius;
      cy = ccy + ny * cornerRadius;
    }
  }

  return { x: cx, y: cy };
}

export function isInsideRect(x: number, y: number, bounds: RectBounds): boolean {
  return (
    x >= bounds.x &&
    x <= bounds.x + bounds.width &&
    y >= bounds.y &&
    y <= bounds.y + bounds.height
  );
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
