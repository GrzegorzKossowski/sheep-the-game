import Phaser from "phaser";
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, TOTAL_LEVELS } from "../config/constants.ts";
import { getLevel } from "../config/levels.ts";
import { recordLevelResult } from "../utils/save.ts";
import { makeButton } from "../utils/ui.ts";

interface ResultSceneData {
  levelId: number;
  elapsedMs: number;
  success: boolean;
}

function computeStars(elapsedSec: number, thresholds: { threeStar: number; twoStar: number; oneStar: number }): number {
  if (elapsedSec <= thresholds.threeStar) return 3;
  if (elapsedSec <= thresholds.twoStar) return 2;
  if (elapsedSec <= thresholds.oneStar) return 1;
  return 0;
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("Result");
  }

  create(data: ResultSceneData): void {
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, COLORS.background).setOrigin(0);

    const level = getLevel(data.levelId);
    const elapsedSec = data.elapsedMs / 1000;
    const stars = data.success ? computeStars(elapsedSec, level.timeThresholds) : 0;
    const coinsEarned = data.success ? Math.max(stars * 10 + level.id * 2, 5) : 0;

    recordLevelResult(data.levelId, stars, data.elapsedMs, coinsEarned);

    this.add
      .text(CANVAS_WIDTH / 2, 90, data.success ? "Poziom ukończony!" : "Poziom nieudany", {
        fontFamily: "sans-serif",
        fontSize: "36px",
        color: data.success ? "#a3e635" : "#f87171",
      })
      .setOrigin(0.5);

    if (data.success) {
      const starStr = "★".repeat(stars) + "☆".repeat(3 - stars);
      this.add
        .text(CANVAS_WIDTH / 2, 160, starStr, { fontFamily: "sans-serif", fontSize: "56px", color: "#facc15" })
        .setOrigin(0.5);
      this.add
        .text(CANVAS_WIDTH / 2, 230, `Czas: ${elapsedSec.toFixed(1)} s`, {
          fontFamily: "sans-serif",
          fontSize: "20px",
          color: "#ffffff",
        })
        .setOrigin(0.5);
      this.add
        .text(CANVAS_WIDTH / 2, 262, `Zdobyte monety: +${coinsEarned}`, {
          fontFamily: "sans-serif",
          fontSize: "18px",
          color: "#facc15",
        })
        .setOrigin(0.5);
    } else {
      this.add
        .text(CANVAS_WIDTH / 2, 190, "Wilk złapał owcę zanim zdążyłeś je zebrać.\nSpróbuj ponownie.", {
          fontFamily: "sans-serif",
          fontSize: "18px",
          color: "#e5e5e5",
          align: "center",
        })
        .setOrigin(0.5);
    }

    const y = 340;
    makeButton(this, CANVAS_WIDTH / 2 - 170, y, 160, 48, "Powtórz", () =>
      this.scene.start("Game", { levelId: data.levelId }),
    );

    if (data.success && stars > 0 && data.levelId < TOTAL_LEVELS) {
      makeButton(this, CANVAS_WIDTH / 2, y, 160, 48, "Następny", () =>
        this.scene.start("Game", { levelId: data.levelId + 1 }),
      );
    }

    makeButton(this, CANVAS_WIDTH / 2 + 170, y, 160, 48, "Poziomy", () => this.scene.start("LevelSelect"));
  }
}
