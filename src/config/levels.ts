export interface LevelConfig {
  id: number;
  sheepCount: number;
  dogCount: number;
  wolfCount: number;
  dogSpeed: number;
  dogInfluenceRadius: number;
  wolfSpeed: number;
  wolfSpawnDelayMs: [number, number];
  penRadius: number;
  timeThresholds: { threeStar: number; twoStar: number; oneStar: number };
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    sheepCount: 2,
    dogCount: 1,
    wolfCount: 0,
    dogSpeed: 220,
    dogInfluenceRadius: 140,
    wolfSpeed: 0,
    wolfSpawnDelayMs: [999999, 999999],
    penRadius: 60,
    timeThresholds: { threeStar: 18, twoStar: 32, oneStar: 55 },
  },
  {
    id: 2,
    sheepCount: 3,
    dogCount: 1,
    wolfCount: 0,
    dogSpeed: 230,
    dogInfluenceRadius: 150,
    wolfSpeed: 0,
    wolfSpawnDelayMs: [999999, 999999],
    penRadius: 65,
    timeThresholds: { threeStar: 26, twoStar: 45, oneStar: 75 },
  },
  {
    id: 3,
    sheepCount: 4,
    dogCount: 2,
    wolfCount: 1,
    dogSpeed: 240,
    dogInfluenceRadius: 160,
    wolfSpeed: 275,
    wolfSpawnDelayMs: [4000, 9000],
    penRadius: 72,
    timeThresholds: { threeStar: 34, twoStar: 58, oneStar: 95 },
  },
  {
    id: 4,
    sheepCount: 5,
    dogCount: 2,
    wolfCount: 1,
    dogSpeed: 250,
    dogInfluenceRadius: 170,
    wolfSpeed: 285,
    wolfSpawnDelayMs: [3500, 8000],
    penRadius: 78,
    timeThresholds: { threeStar: 42, twoStar: 70, oneStar: 115 },
  },
  {
    id: 5,
    sheepCount: 6,
    dogCount: 3,
    wolfCount: 2,
    dogSpeed: 260,
    dogInfluenceRadius: 180,
    wolfSpeed: 295,
    wolfSpawnDelayMs: [3000, 7000],
    penRadius: 84,
    timeThresholds: { threeStar: 50, twoStar: 85, oneStar: 135 },
  },
];

export function getLevel(id: number): LevelConfig {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Unknown level id: ${id}`);
  return level;
}
