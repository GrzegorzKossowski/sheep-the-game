import Phaser from "phaser";
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from "../config/constants.ts";
import { makeButton } from "../utils/ui.ts";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, COLORS.background).setOrigin(0);
    this.add
      .text(CANVAS_WIDTH / 2, 170, "🐑 Sheep the Game", {
        fontFamily: "sans-serif",
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.add
      .text(CANVAS_WIDTH / 2, 225, "Zbierz owce do zagrody, zanim złapią je wilki", {
        fontFamily: "sans-serif",
        fontSize: "16px",
        color: "#c7c7c7",
      })
      .setOrigin(0.5);

    makeButton(this, CANVAS_WIDTH / 2, 320, 220, 56, "Start", () => this.scene.start("LevelSelect"), 24);
    makeButton(this, CANVAS_WIDTH / 2, 390, 220, 56, "Zasady (About)", () => this.scene.start("About"), 20);
  }
}
