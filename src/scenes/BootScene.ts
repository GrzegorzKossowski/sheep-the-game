import Phaser from "phaser";
import { COLORS, DOG_RADIUS, SHEEP_RADIUS, WOLF_RADIUS } from "../config/constants.ts";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    this.makeEmojiTexture("dog", "🐶", DOG_RADIUS);
    this.makeEmojiTexture("sheep", "🐑", SHEEP_RADIUS);
    this.makeEmojiTexture("wolf", "🐺", WOLF_RADIUS);
    this.makeGrassTexture();
    this.scene.start("Menu");
  }

  /** Renders an emoji onto a soft shadow disc so it reads clearly against the grass. */
  private makeEmojiTexture(key: string, emoji: string, radius: number): void {
    const size = Math.round(radius * 2.8);
    const canvasTexture = this.textures.createCanvas(key, size, size)!;
    const ctx = canvasTexture.getContext();

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `${Math.round(size * 0.82)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, size / 2, size / 2 + size * 0.03);

    canvasTexture.refresh();
  }

  private makeGrassTexture(): void {
    const size = 64;
    const g = this.add.graphics();
    g.fillStyle(COLORS.grass, 1);
    g.fillRect(0, 0, size, size);
    g.fillStyle(COLORS.grassAlt, 1);
    let seed = 42;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 40; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const len = 3 + rand() * 4;
      g.fillRect(x, y, 1.5, len);
    }
    g.generateTexture("grass_tile", size, size);
    g.destroy();
  }
}
