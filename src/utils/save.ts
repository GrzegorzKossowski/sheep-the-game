import { SAVE_KEY, TOTAL_LEVELS } from "../config/constants.ts";

export interface LevelRecord {
  bestStars: number;
  bestTimeMs: number;
}

export interface SaveData {
  unlockedLevel: number;
  levels: Record<number, LevelRecord>;
  coins: number;
}

function defaultSave(): SaveData {
  return { unlockedLevel: 1, levels: {}, coins: 0 };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as SaveData;
    if (!parsed || typeof parsed.unlockedLevel !== "number") return defaultSave();
    return parsed;
  } catch {
    return defaultSave();
  }
}

export function writeSave(data: SaveData): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function resetSave(): SaveData {
  const fresh = defaultSave();
  writeSave(fresh);
  return fresh;
}

export function recordLevelResult(
  levelId: number,
  stars: number,
  timeMs: number,
  coinsEarned: number,
): SaveData {
  const save = loadSave();
  const existing = save.levels[levelId];
  save.levels[levelId] = {
    bestStars: Math.max(existing?.bestStars ?? 0, stars),
    bestTimeMs: existing?.bestTimeMs ? Math.min(existing.bestTimeMs, timeMs) : timeMs,
  };
  if (stars > 0 && levelId >= save.unlockedLevel && levelId < TOTAL_LEVELS) {
    save.unlockedLevel = levelId + 1;
  }
  save.coins += coinsEarned;
  writeSave(save);
  return save;
}
