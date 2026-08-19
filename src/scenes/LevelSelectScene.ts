import Phaser from "phaser";
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, TOTAL_LEVELS } from "../config/constants.ts";
import { loadSave, resetSave } from "../utils/save.ts";
import { makeButton } from "../utils/ui.ts";

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super("LevelSelect");
  }

  create(): void {
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, COLORS.background).setOrigin(0);
    this.add
      .text(CANVAS_WIDTH / 2, 40, "Wybierz poziom", { fontFamily: "sans-serif", fontSize: "32px", color: "#ffffff" })
      .setOrigin(0.5, 0);

    this.drawGrid();

    makeButton(this, 120, CANVAS_HEIGHT - 50, 180, 48, "Menu główne", () => this.scene.start("Menu"));
    makeButton(this, CANVAS_WIDTH - 150, CANVAS_HEIGHT - 50, 240, 48, "Resetuj postęp", () =>
      this.confirmReset(),
    );

    const save = loadSave();
    this.add
      .text(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50, `Monety: ${save.coins}`, {
        fontFamily: "sans-serif",
        fontSize: "20px",
        color: "#facc15",
      })
      .setOrigin(0.5);
  }

  private drawGrid(): void {
    const save = loadSave();
    const cols = 5;
    const cell = 130;
    const startX = CANVAS_WIDTH / 2 - ((cols - 1) * cell) / 2;
    const y = 220;

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
        this.add.text(x, y + 22, "🔒", { fontSize: "20px" }).setOrigin(0.5);
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

  private confirmReset(): void {
    const overlay = this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.7).setOrigin(0);
    const panel = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 420, 200, COLORS.panel, 1);
    panel.setStrokeStyle(2, 0xffffff, 0.3);
    const text = this.add
      .text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50, "Zresetować cały postęp?\nDla nowego gracza.", {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    const group = [overlay, panel, text];
    const yesBtn = makeButton(this, CANVAS_WIDTH / 2 - 80, CANVAS_HEIGHT / 2 + 40, 140, 48, "Tak, resetuj", () => {
      resetSave();
      group.forEach((g) => g.destroy());
      yesBtn.destroy();
      noBtn.destroy();
      this.scene.restart();
    });
    const noBtn = makeButton(this, CANVAS_WIDTH / 2 + 80, CANVAS_HEIGHT / 2 + 40, 140, 48, "Anuluj", () => {
      group.forEach((g) => g.destroy());
      yesBtn.destroy();
      noBtn.destroy();
    });
  }
}
