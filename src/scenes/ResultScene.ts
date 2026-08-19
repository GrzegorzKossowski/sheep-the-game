import Phaser from "phaser";
import { COLORS, TOTAL_LEVELS } from "../config/constants.ts";
import { getLevel } from "../config/levels.ts";
import { recordLevelResult } from "../utils/save.ts";
import { computeStars } from "../utils/scoring.ts";
import { makeButton } from "../utils/ui.ts";

interface ResultSceneData {
  levelId: number;
  elapsedMs: number;
  success: boolean;
  sheepLost: number;
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("Result");
  }

  create(data: ResultSceneData): void {
    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const baseY = H / 2 - 230;

    this.add.rectangle(0, 0, W, H, COLORS.background).setOrigin(0);

    const level = getLevel(data.levelId);
    const elapsedSec = data.elapsedMs / 1000;
    const stars = data.success ? computeStars(elapsedSec, level.timeThresholds, data.sheepLost) : 0;

    recordLevelResult(data.levelId, stars, data.elapsedMs, data.success);

    const hasLosses = data.sheepLost > 0;
    let title = "Poziom nieudany";
    let titleColor = "#f87171";
    if (data.success) {
      title = hasLosses ? "Poziom ukończony (ze stratami)" : "Poziom ukończony!";
      titleColor = hasLosses ? "#fbbf24" : "#a3e635";
    }

    this.add.text(cx, baseY, title, { fontFamily: "sans-serif", fontSize: "32px", color: titleColor }).setOrigin(0.5);

    if (data.success) {
      const starStr = "★".repeat(stars) + "☆".repeat(3 - stars);
      this.add
        .text(cx, baseY + 70, starStr, { fontFamily: "sans-serif", fontSize: "56px", color: "#facc15" })
        .setOrigin(0.5);
      this.add
        .text(cx, baseY + 135, `Czas: ${elapsedSec.toFixed(1)} s`, {
          fontFamily: "sans-serif",
          fontSize: "20px",
          color: "#ffffff",
        })
        .setOrigin(0.5);
      if (hasLosses) {
        this.add
          .text(cx, baseY + 164, `Stracone owce: ${data.sheepLost} (gwiazdki obniżone)`, {
            fontFamily: "sans-serif",
            fontSize: "16px",
            color: "#fca5a5",
          })
          .setOrigin(0.5);
      }
      if (stars === 0) {
        this.add
          .text(cx, baseY + (hasLosses ? 192 : 172), "Poziom zaliczony, ale bez gwiazdek — spróbuj szybciej.", {
            fontFamily: "sans-serif",
            fontSize: "15px",
            color: "#9ca3af",
          })
          .setOrigin(0.5);
      }
    } else {
      this.add
        .text(cx, baseY + 100, "Wilki złapały wszystkie owce zanim zdążyłeś je zebrać.\nSpróbuj ponownie.", {
          fontFamily: "sans-serif",
          fontSize: "18px",
          color: "#e5e5e5",
          align: "center",
        })
        .setOrigin(0.5);
    }

    const y = baseY + 250;
    makeButton(this, cx - 170, y, 160, 48, "Powtórz", () => this.scene.start("Game", { levelId: data.levelId }));

    if (data.success && data.levelId < TOTAL_LEVELS) {
      makeButton(this, cx, y, 160, 48, "Następny", () => this.scene.start("Game", { levelId: data.levelId + 1 }));
    }

    makeButton(this, cx + 170, y, 160, 48, "Poziomy", () => this.scene.start("LevelSelect"));
  }
}
