import Phaser from "phaser";
import { TOTAL_LEVELS } from "../config/constants.ts";
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
    const cy = H / 2;
    const baseY = cy - 175;

    const modal = this.add.container(0, 0).setAlpha(0);
    this.tweens.add({ targets: modal, alpha: 1, duration: 250, ease: "Quad.Out" });

    modal.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0));

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

    modal.add(
      this.add.text(cx, baseY, title, { fontFamily: "sans-serif", fontSize: "28px", color: titleColor }).setOrigin(0.5),
    );

    if (data.success) {
      const starStr = "★".repeat(stars) + "☆".repeat(3 - stars);
      modal.add(
        this.add
          .text(cx, baseY + 60, starStr, { fontFamily: "sans-serif", fontSize: "52px", color: "#facc15" })
          .setOrigin(0.5),
      );
      modal.add(
        this.add
          .text(cx, baseY + 122, `Czas: ${elapsedSec.toFixed(1)} s`, {
            fontFamily: "sans-serif",
            fontSize: "18px",
            color: "#ffffff",
          })
          .setOrigin(0.5),
      );
      if (hasLosses) {
        modal.add(
          this.add
            .text(cx, baseY + 150, `Stracone owce: ${data.sheepLost} (gwiazdki obniżone)`, {
              fontFamily: "sans-serif",
              fontSize: "14px",
              color: "#fca5a5",
            })
            .setOrigin(0.5),
        );
      }
      if (stars === 0) {
        modal.add(
          this.add
            .text(cx, baseY + (hasLosses ? 176 : 150), "Poziom zaliczony, ale bez gwiazdek — spróbuj szybciej.", {
              fontFamily: "sans-serif",
              fontSize: "14px",
              color: "#9ca3af",
            })
            .setOrigin(0.5),
        );
      }
    } else {
      modal.add(
        this.add
          .text(cx, baseY + 90, "Wilki złapały wszystkie owce zanim zdążyłeś je zebrać.\nSpróbuj ponownie.", {
            fontFamily: "sans-serif",
            fontSize: "16px",
            color: "#e5e5e5",
            align: "center",
          })
          .setOrigin(0.5),
      );
    }

    const y = baseY + 210;
    modal.add(makeButton(this, cx - 170, y, 160, 48, "Powtórz", () => this.goToGame(data.levelId)));

    if (data.success && data.levelId < TOTAL_LEVELS) {
      modal.add(makeButton(this, cx, y, 160, 48, "Następny", () => this.goToGame(data.levelId + 1)));
    }

    modal.add(makeButton(this, cx + 170, y, 160, 48, "Poziomy", () => this.goToLevelSelect()));
  }

  /** The Game scene underneath is paused, not stopped — restarting the same key cleans it up. */
  private goToGame(levelId: number): void {
    this.scene.stop();
    this.scene.start("Game", { levelId });
  }

  private goToLevelSelect(): void {
    this.scene.stop();
    this.scene.stop("Game");
    this.scene.start("LevelSelect");
  }
}
