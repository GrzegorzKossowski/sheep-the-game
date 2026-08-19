import Phaser from "phaser";
import { COLORS, DOG_RADIUS, SHEEP_RADIUS, WOLF_RADIUS } from "../config/constants.ts";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    this.makeSheepTexture();
    this.makeDogTexture();
    this.makeWolfTexture();
    this.makeGrassTexture();
    this.scene.start("Menu");
  }

  // Animals are drawn as vector shapes (not emoji/text) so they render identically on every
  // device, regardless of whether the system has a color-emoji font installed.

  private makeSheepTexture(): void {
    const r = SHEEP_RADIUS;
    const size = Math.round(r * 2.8);
    const cx = size / 2;
    const cy = size / 2;
    const g = this.add.graphics();

    g.fillStyle(0x000000, 0.2);
    g.fillCircle(cx, cy + 1, r * 1.05);

    g.fillStyle(COLORS.sheepOutline, 1);
    g.fillCircle(cx, cy, r + 1.5);
    g.fillStyle(COLORS.sheep, 1);
    g.fillCircle(cx, cy, r);
    g.fillCircle(cx - r * 0.5, cy - r * 0.3, r * 0.55);
    g.fillCircle(cx + r * 0.5, cy - r * 0.3, r * 0.55);
    g.fillCircle(cx - r * 0.4, cy + r * 0.4, r * 0.5);
    g.fillCircle(cx + r * 0.4, cy + r * 0.4, r * 0.5);

    g.fillStyle(0x555555, 1);
    g.fillEllipse(cx + r * 0.55, cy, r * 0.75, r * 0.6);
    g.fillStyle(0x111111, 1);
    g.fillCircle(cx + r * 0.65, cy - r * 0.18, r * 0.12);
    g.fillCircle(cx + r * 0.65, cy + r * 0.18, r * 0.12);

    g.generateTexture("sheep", size, size);
    g.destroy();
  }

  private makeDogTexture(): void {
    const r = DOG_RADIUS;
    const size = Math.round(r * 2.8);
    const cx = size / 2;
    const cy = size / 2;
    const g = this.add.graphics();

    g.fillStyle(0x000000, 0.2);
    g.fillCircle(cx, cy + 1, r * 1.05);

    g.fillStyle(0x1e3a8a, 1);
    g.fillTriangle(cx - r * 0.9, cy - r * 0.2, cx - r * 0.3, cy - r * 1.15, cx - r * 0.1, cy - r * 0.3);
    g.fillTriangle(cx + r * 0.9, cy - r * 0.2, cx + r * 0.3, cy - r * 1.15, cx + r * 0.1, cy - r * 0.3);

    g.fillCircle(cx, cy, r + 1.5);
    g.fillStyle(COLORS.dog, 1);
    g.fillCircle(cx, cy, r);

    g.fillStyle(0xdbeafe, 1);
    g.fillEllipse(cx, cy + r * 0.35, r * 0.9, r * 0.55);
    g.fillStyle(0x1e293b, 1);
    g.fillCircle(cx, cy + r * 0.45, r * 0.14);
    g.fillStyle(0x111111, 1);
    g.fillCircle(cx - r * 0.32, cy - r * 0.1, r * 0.12);
    g.fillCircle(cx + r * 0.32, cy - r * 0.1, r * 0.12);

    g.generateTexture("dog", size, size);
    g.destroy();
  }

  private makeWolfTexture(): void {
    const r = WOLF_RADIUS;
    const size = Math.round(r * 2.8);
    const cx = size / 2;
    const cy = size / 2;
    const g = this.add.graphics();

    g.fillStyle(0x000000, 0.25);
    g.fillCircle(cx, cy + 1, r * 1.05);

    g.fillStyle(0x2a0a0a, 1);
    g.fillTriangle(cx - r * 0.75, cy - r * 0.15, cx - r * 0.45, cy - r * 1.15, cx - r * 0.1, cy - r * 0.35);
    g.fillTriangle(cx + r * 0.75, cy - r * 0.15, cx + r * 0.45, cy - r * 1.15, cx + r * 0.1, cy - r * 0.35);

    g.fillCircle(cx, cy, r + 1.5);
    g.fillStyle(COLORS.wolf, 1);
    g.fillCircle(cx, cy, r);

    g.fillStyle(0x9ca3af, 1);
    g.fillEllipse(cx, cy + r * 0.35, r * 0.85, r * 0.5);
    g.fillStyle(0x000000, 1);
    g.fillCircle(cx, cy + r * 0.5, r * 0.13);
    g.fillStyle(COLORS.wolfEye, 1);
    g.fillCircle(cx - r * 0.3, cy - r * 0.15, r * 0.13);
    g.fillCircle(cx + r * 0.3, cy - r * 0.15, r * 0.13);

    g.generateTexture("wolf", size, size);
    g.destroy();
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
