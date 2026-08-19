import Phaser from "phaser";
import { COLORS, TOTAL_LEVELS } from "../config/constants.ts";
import { loadSave, resetSave } from "../utils/save.ts";
import { makeButton } from "../utils/ui.ts";

export class LevelSelectScene extends Phaser.Scene {
  private W = 0;
  private H = 0;

  constructor() {
    super("LevelSelect");
  }

  create(): void {
    this.W = this.scale.width;
    this.H = this.scale.height;

    this.add.rectangle(0, 0, this.W, this.H, COLORS.background).setOrigin(0);
    this.add
      .text(this.W / 2, 40, "Wybierz poziom", { fontFamily: "sans-serif", fontSize: "32px", color: "#ffffff" })
      .setOrigin(0.5, 0);

    this.drawGrid();

    makeButton(this, 120, this.H - 50, 180, 48, "Menu główne", () => this.scene.start("Menu"));
    makeButton(this, this.W - 150, this.H - 50, 240, 48, "Resetuj postęp", () => this.confirmReset());
  }

  private drawGrid(): void {
    const save = loadSave();
    const cols = 5;
    const cell = 130;
    const startX = this.W / 2 - ((cols - 1) * cell) / 2;
    const y = Math.min(220, this.H / 2 - 60);

    for (let i = 0; i < TOTAL_LEVELS; i++) {
      const levelId = i + 1;
      const x = startX + i * cell;
      const unlocked = levelId <= save.unlockedLevel;
      const record = save.levels[levelId];

      const box = this.add
        .rectangle(x, y, 96, 96, unlocked ? COLORS.panel : 0x1a1d13, 1)
        .setStrokeStyle(2, unlocked ? 0xffffff : 0x444444, unlocked ? 0.4 : 0.4);

      this.add
        .text(x, y - 18, String(levelId), {
          fontFamily: "sans-serif",
          fontSize: "30px",
          color: unlocked ? "#ffffff" : "#555555",
        })
        .setOrigin(0.5);

      if (!unlocked) {
        this.drawLockIcon(x, y + 22);
      } else {
        const stars = record?.bestStars ?? 0;
        const starStr = "★".repeat(stars) + "☆".repeat(3 - stars);
        this.add
          .text(x, y + 22, starStr, { fontFamily: "sans-serif", fontSize: "16px", color: "#facc15" })
          .setOrigin(0.5);
      }

      if (unlocked) {
        box.setInteractive({ useHandCursor: true });
        box.on("pointerover", () => box.setFillStyle(0x3c4a2c, 1));
        box.on("pointerout", () => box.setFillStyle(COLORS.panel, 1));
        box.on("pointerup", () => this.scene.start("Game", { levelId }));
      }
    }
  }

  /** Drawn instead of the 🔒 emoji so it renders identically without relying on a system emoji font. */
  private drawLockIcon(x: number, y: number): void {
    const g = this.add.graphics();
    g.fillStyle(0x777777, 1);
    g.fillRoundedRect(x - 9, y - 2, 18, 14, 3);
    g.lineStyle(3, 0x777777, 1);
    g.beginPath();
    g.arc(x, y - 4, 6, Math.PI, 0, false);
    g.strokePath();
    g.fillStyle(0x2a2f22, 1);
    g.fillCircle(x, y + 4, 2.2);
  }

  private confirmReset(): void {
    const W = this.W;
    const H = this.H;
    const overlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0);
    const panel = this.add.rectangle(W / 2, H / 2, 420, 200, COLORS.panel, 1);
    panel.setStrokeStyle(2, 0xffffff, 0.3);
    const text = this.add
      .text(W / 2, H / 2 - 50, "Zresetować cały postęp?\nDla nowego gracza.", {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    const group = [overlay, panel, text];
    const yesBtn = makeButton(this, W / 2 - 80, H / 2 + 40, 140, 48, "Tak, resetuj", () => {
      resetSave();
      group.forEach((g) => g.destroy());
      yesBtn.destroy();
      noBtn.destroy();
      this.scene.restart();
    });
    const noBtn = makeButton(this, W / 2 + 80, H / 2 + 40, 140, 48, "Anuluj", () => {
      group.forEach((g) => g.destroy());
      yesBtn.destroy();
      noBtn.destroy();
    });
  }
}
