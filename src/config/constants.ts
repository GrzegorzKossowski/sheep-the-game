export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 640;
export const HUD_HEIGHT = 56;

// Outer field: where dogs and fleeing/exiting wolves may roam (close to canvas edge).
export const FIELD = {
  x: 16,
  y: HUD_HEIGHT + 16,
  width: CANVAS_WIDTH - 32,
  height: CANVAS_HEIGHT - HUD_HEIGHT - 32,
};

// Inset "safe" containment for sheep and hunting wolves, rounded at the corners
// so animals can never get wedged into a literal corner.
export const ANIMAL_MARGIN = 46;
export const ANIMAL_CORNER_RADIUS = 90;

export const ANIMAL_BOUNDS = {
  x: FIELD.x + ANIMAL_MARGIN,
  y: FIELD.y + ANIMAL_MARGIN,
  width: FIELD.width - ANIMAL_MARGIN * 2,
  height: FIELD.height - ANIMAL_MARGIN * 2,
};

export const DOG_MARGIN = 6;
export const DOG_BOUNDS = {
  x: FIELD.x + DOG_MARGIN,
  y: FIELD.y + DOG_MARGIN,
  width: FIELD.width - DOG_MARGIN * 2,
  height: FIELD.height - DOG_MARGIN * 2,
};

export const PEN_CENTER = {
  x: FIELD.x + FIELD.width / 2,
  y: FIELD.y + FIELD.height / 2,
};

export const COLORS = {
  background: 0x1b1f16,
  grass: 0x5c9a4a,
  grassAlt: 0x549144,
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

export const SHEEP_WANDER_SPEED = 34;
export const SHEEP_FLEE_MIN_SPEED = 90;
export const SHEEP_FLEE_MAX_SPEED = 175;
export const SHEEP_FLEE_JITTER_DEG = 18;
export const SHEEP_SEPARATION_RADIUS = 26;

export const SAVE_KEY = "sheep-the-game:save";
export const TOTAL_LEVELS = 5;
