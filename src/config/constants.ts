import type { RectBounds } from "../utils/steering.ts";

export const HUD_HEIGHT = 56;
export const FOREST_MARGIN = 44;

// Inset "safe" containment for sheep and hunting wolves, rounded at the corners
// so animals can never get wedged into a literal corner.
export const ANIMAL_MARGIN = 46;
export const ANIMAL_CORNER_RADIUS = 90;
export const DOG_MARGIN = 6;

export interface Layout {
  width: number;
  height: number;
  field: RectBounds;
  animalBounds: RectBounds;
  dogBounds: RectBounds;
  penCenter: { x: number; y: number };
}

/** Computes the play-area layout for the current window size, called once per GameScene session. */
export function computeLayout(width: number, height: number): Layout {
  const field: RectBounds = {
    x: FOREST_MARGIN,
    y: HUD_HEIGHT + FOREST_MARGIN,
    width: width - FOREST_MARGIN * 2,
    height: height - HUD_HEIGHT - FOREST_MARGIN * 2,
  };
  const animalBounds: RectBounds = {
    x: field.x + ANIMAL_MARGIN,
    y: field.y + ANIMAL_MARGIN,
    width: field.width - ANIMAL_MARGIN * 2,
    height: field.height - ANIMAL_MARGIN * 2,
  };
  const dogBounds: RectBounds = {
    x: field.x + DOG_MARGIN,
    y: field.y + DOG_MARGIN,
    width: field.width - DOG_MARGIN * 2,
    height: field.height - DOG_MARGIN * 2,
  };
  const penCenter = { x: field.x + field.width / 2, y: field.y + field.height / 2 };
  return { width, height, field, animalBounds, dogBounds, penCenter };
}

export const COLORS = {
  background: 0x1b1f16,
  grass: 0x5c9a4a,
  grassAlt: 0x549144,
  forestDark: 0x1c3318,
  forestMid: 0x24421e,
  pen: 0xc9a066,
  penBorder: 0x8a6a3c,
  dog: 0x3b82f6,
  dogActive: 0xfacc15,
  sheep: 0xffffff,
  sheepOutline: 0x222222,
  wolf: 0x7a1f1f,
  wolfEye: 0xff5555,
  hudBg: 0x11150c,
  text: 0xffffff,
  panel: 0x2b3320,
};

export const SHEEP_RADIUS = 9;
export const DOG_RADIUS = 11;
export const WOLF_RADIUS = 11;

export const SHEEP_FLEE_JITTER_DEG = 18;
export const SHEEP_SEPARATION_RADIUS = 26;

export const SAVE_KEY = "sheep-the-game:save";
export const TOTAL_LEVELS = 5;
