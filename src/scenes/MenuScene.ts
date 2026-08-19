import Phaser from "phaser";
import { COLORS } from "../config/constants.ts";
import { makeButton } from "../utils/ui.ts";

const AUTHOR_URL = "https://kossowski.eu";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;

    this.add.rectangle(0, 0, W, H, COLORS.background).setOrigin(0);

    const author = this.add
      .text(cx, cy - 212, "Grzegorz Kossowski", {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color: "#93c5fd",
      })
      .setOrigin(0.5);
    author.setInteractive({ useHandCursor: true });
    author.on("pointerover", () => author.setColor("#bfdbfe"));
    author.on("pointerout", () => author.setColor("#93c5fd"));
    author.on("pointerup", () => window.open(AUTHOR_URL, "_blank", "noopener"));

    this.add
      .text(cx, cy - 186, "prezentuje", { fontFamily: "sans-serif", fontSize: "14px", color: "#8a8a8a" })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 150, "Sheep the Game", { fontFamily: "sans-serif", fontSize: "48px", color: "#ffffff" })
      .setOrigin(0.5);
    this.add
      .text(cx, cy - 95, "Zbierz owce do zagrody, zanim złapią je wilki", {
        fontFamily: "sans-serif",
        fontSize: "16px",
        color: "#c7c7c7",
      })
      .setOrigin(0.5);

    makeButton(this, cx, cy, 220, 56, "Start", () => this.scene.start("LevelSelect"), 24);
    makeButton(this, cx, cy + 70, 220, 56, "Zasady (About)", () => this.scene.start("About"), 20);
  }
}
