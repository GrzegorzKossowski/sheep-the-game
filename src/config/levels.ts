export interface LevelConfig {
  id: number;
  sheepCount: number;
  dogCount: number;
  wolfCount: number;
  dogSpeed: number;
  dogInfluenceRadius: number;
  sheepWanderSpeed: number;
  sheepFleeMinSpeed: number;
  sheepFleeMaxSpeed: number;
  wolfSpeed: number;
  wolfSpawnDelayMs: [number, number];
  penRadius: number;
  timeThresholds: { threeStar: number; twoStar: number; oneStar: number };
}

// As sheepCount/dogCount/wolfCount grow, sheep move calmer (lower flee/wander speed)
// so the extra animals stay manageable instead of compounding into chaos.
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    sheepCount: 2,
    dogCount: 1,
    wolfCount: 0,
    dogSpeed: 150,
    dogInfluenceRadius: 140,
    sheepWanderSpeed: 14,
    sheepFleeMinSpeed: 60,
    sheepFleeMaxSpeed: 115,
    wolfSpeed: 0,
    wolfSpawnDelayMs: [999999, 999999],
    penRadius: 60,
    timeThresholds: { threeStar: 28, twoStar: 48, oneStar: 78 },
  },
  {
    id: 2,
    sheepCount: 3,
    dogCount: 1,
    wolfCount: 0,
    dogSpeed: 150,
    dogInfluenceRadius: 150,
    sheepWanderSpeed: 13,
    sheepFleeMinSpeed: 52,
    sheepFleeMaxSpeed: 100,
    wolfSpeed: 0,
    wolfSpawnDelayMs: [999999, 999999],
    penRadius: 65,
    timeThresholds: { threeStar: 38, twoStar: 65, oneStar: 105 },
  },
  {
    id: 3,
    sheepCount: 4,
    dogCount: 2,
    wolfCount: 1,
    dogSpeed: 155,
    dogInfluenceRadius: 160,
    sheepWanderSpeed: 11,
    sheepFleeMinSpeed: 46,
    sheepFleeMaxSpeed: 90,
    wolfSpeed: 102,
    wolfSpawnDelayMs: [8000, 13000],
    penRadius: 72,
    timeThresholds: { threeStar: 50, twoStar: 85, oneStar: 135 },
  },
  {
    id: 4,
    sheepCount: 5,
    dogCount: 2,
    wolfCount: 1,
    dogSpeed: 155,
    dogInfluenceRadius: 170,
    sheepWanderSpeed: 10,
    sheepFleeMinSpeed: 40,
    sheepFleeMaxSpeed: 80,
    wolfSpeed: 92,
    wolfSpawnDelayMs: [7000, 12000],
    penRadius: 78,
    timeThresholds: { threeStar: 62, twoStar: 105, oneStar: 165 },
  },
  {
    id: 5,
    sheepCount: 6,
    dogCount: 3,
    wolfCount: 2,
    dogSpeed: 160,
    dogInfluenceRadius: 180,
    sheepWanderSpeed: 9,
    sheepFleeMinSpeed: 34,
    sheepFleeMaxSpeed: 70,
    wolfSpeed: 80,
    wolfSpawnDelayMs: [7000, 11000],
    penRadius: 84,
    timeThresholds: { threeStar: 78, twoStar: 125, oneStar: 195 },
  },
];

export function getLevel(id: number): LevelConfig {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Unknown level id: ${id}`);
  return level;
}
