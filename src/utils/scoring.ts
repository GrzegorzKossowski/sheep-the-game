export interface TimeThresholds {
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export function computeStars(elapsedSec: number, thresholds: TimeThresholds, sheepLost: number): number {
  let stars = 0;
  if (elapsedSec <= thresholds.threeStar) stars = 3;
  else if (elapsedSec <= thresholds.twoStar) stars = 2;
  else if (elapsedSec <= thresholds.oneStar) stars = 1;
  return Math.max(stars - sheepLost, 0);
}
