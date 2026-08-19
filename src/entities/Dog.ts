import Phaser from "phaser";
import { DOG_BOUNDS } from "../config/constants.ts";
import { clampToRoundedRect } from "../utils/steering.ts";

export class Dog extends Phaser.GameObjects.Image {
  index: number;
  speed: number;
  influenceRadius: number;
  targetPoint: Phaser.Math.Vector2 | null = null;
  ring: Phaser.GameObjects.Arc;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    index: number,
    speed: number,
    influenceRadius: number,
  ) {
    super(scene, x, y, "dog");
    this.index = index;
    this.speed = speed;
    this.influenceRadius = influenceRadius;
    scene.add.existing(this);
    this.setDepth(10);

    this.ring = scene.add.circle(x, y, 17, 0x000000, 0);
    this.ring.setStrokeStyle(2, 0xfacc15, 1);
    this.ring.setDepth(9);
    this.ring.setVisible(false);
  }

  moveTo(x: number, y: number): void {
    this.targetPoint = new Phaser.Math.Vector2(x, y);
  }

  setActiveVisual(active: boolean): void {
    this.ring.setVisible(active);
  }

  update(deltaSec: number): void {
    if (this.targetPoint) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPoint.x, this.targetPoint.y);
      if (dist < 5) {
        this.targetPoint = null;
      } else {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetPoint.x, this.targetPoint.y);
        const step = this.speed * deltaSec;
        this.x += Math.cos(angle) * Math.min(step, dist);
        this.y += Math.sin(angle) * Math.min(step, dist);
      }
    }

    const clamped = clampToRoundedRect(this.x, this.y, DOG_BOUNDS, 24);
    this.x = clamped.x;
    this.y = clamped.y;

    this.ring.setPosition(this.x, this.y);
  }

  destroyWithRing(): void {
    this.ring.destroy();
    this.destroy();
  }
}
