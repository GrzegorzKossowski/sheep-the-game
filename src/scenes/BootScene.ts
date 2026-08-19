import Phaser from "phaser";
import { COLORS, DOG_RADIUS, SHEEP_RADIUS, WOLF_RADIUS } from "../config/constants.ts";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    this.makeDogTexture();
    this.makeSheepTexture();
    this.makeWolfTexture();
    this.makeGrassTexture();
    this.scene.start("Menu");
  }

  private makeDogTexture(): void {
    const r = DOG_RADIUS;
    const g = this.add.graphics();
    g.fillStyle(0x1e3a8a, 1);
    g.fillCircle(r, r, r);
    g.fillStyle(COLORS.dog, 1);
    g.fillCircle(r, r, r - 2);
    g.fillStyle(0xdbeafe, 1);
    g.fillCircle(r - 3, r - 3, 2.5);
    g.generateTexture("dog", r * 2, r * 2);
    g.destroy();
  }

  private makeSheepTexture(): void {
    const r = SHEEP_RADIUS;
    const g = this.add.graphics();
    g.fillStyle(COLORS.sheepOutline, 1);
    g.fillCircle(r, r, r);
    g.fillStyle(COLORS.sheep, 1);
    g.fillCircle(r, r, r - 2);
    g.fillStyle(0x333333, 1);
    g.fillCircle(r + 3, r - 1, 1.6);
    g.generateTexture("sheep", r * 2, r * 2);
    g.destroy();
  }

  private makeWolfTexture(): void {
    const r = WOLF_RADIUS;
    const g = this.add.graphics();
    g.fillStyle(0x2a0a0a, 1);
    g.fillCircle(r, r, r);
    g.fillStyle(COLORS.wolf, 1);
    g.fillCircle(r, r, r - 2);
    g.fillStyle(COLORS.wolfEye, 1);
    g.fillCircle(r + 3, r - 2, 1.6);
    g.fillCircle(r + 3, r + 2, 1.6);
    g.generateTexture("wolf", r * 2, r * 2);
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
