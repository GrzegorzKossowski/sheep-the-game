import Phaser from "phaser";
import {
  ANIMAL_BOUNDS,
  ANIMAL_CORNER_RADIUS,
  FIELD,
  SHEEP_RADIUS,
  WOLF_RADIUS,
} from "../config/constants.ts";
import { clampToRoundedRect, randomRange } from "../utils/steering.ts";
import type { Dog } from "./Dog.ts";
import type { Sheep } from "./Sheep.ts";

const DOG_SCARE_RADIUS = 115;
const CATCH_DISTANCE = SHEEP_RADIUS + WOLF_RADIUS - 2;
const EXIT_MARGIN = 40;

type WolfState = "hunting" | "fleeing" | "exiting";

export class Wolf extends Phaser.GameObjects.Image {
  speed: number;
  eliminated = false;
  private mode: WolfState = "hunting";
  private exitAngle = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, speed: number) {
    super(scene, x, y, "wolf");
    this.speed = speed;
    scene.add.existing(this);
    this.setDepth(6);
  }

  update(deltaSec: number, dogs: Dog[], sheep: Sheep[]): void {
    if (this.eliminated) return;

    if (this.mode === "hunting" || this.mode === "fleeing") {
      let nearestDog: Dog | null = null;
      let nearestDogDist = Infinity;
      for (const dog of dogs) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, dog.x, dog.y);
        if (dist < nearestDogDist) {
          nearestDogDist = dist;
          nearestDog = dog;
        }
      }

      if (nearestDog && nearestDogDist < DOG_SCARE_RADIUS) {
        this.mode = "fleeing";
        const angle = Phaser.Math.Angle.Between(nearestDog.x, nearestDog.y, this.x, this.y);
        const step = this.speed * 1.1 * deltaSec;
        this.x += Math.cos(angle) * step;
        this.y += Math.sin(angle) * step;

        const beyondField =
          this.x < FIELD.x - EXIT_MARGIN ||
          this.x > FIELD.x + FIELD.width + EXIT_MARGIN ||
          this.y < FIELD.y - EXIT_MARGIN ||
          this.y > FIELD.y + FIELD.height + EXIT_MARGIN;
        if (beyondField) {
          this.eliminated = true;
          this.emit("eliminated");
          this.destroy();
          return;
        }
        return;
      }

      this.mode = "hunting";
      const target = this.findNearestSheep(sheep);
      if (target) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        if (dist <= CATCH_DISTANCE) {
          this.emit("catch", target);
          this.beginExit();
          return;
        }
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        const step = this.speed * deltaSec;
        this.x += Math.cos(angle) * step;
        this.y += Math.sin(angle) * step;
      }

      const clamped = clampToRoundedRect(this.x, this.y, ANIMAL_BOUNDS, ANIMAL_CORNER_RADIUS);
      this.x = clamped.x;
      this.y = clamped.y;
      return;
    }

    if (this.mode === "exiting") {
      const step = this.speed * deltaSec;
      this.x += Math.cos(this.exitAngle) * step;
      this.y += Math.sin(this.exitAngle) * step;
      const beyondField =
        this.x < FIELD.x - EXIT_MARGIN ||
        this.x > FIELD.x + FIELD.width + EXIT_MARGIN ||
        this.y < FIELD.y - EXIT_MARGIN ||
        this.y > FIELD.y + FIELD.height + EXIT_MARGIN;
      if (beyondField) {
        this.eliminated = true;
        this.emit("exited");
        this.destroy();
      }
    }
  }

  private beginExit(): void {
    this.mode = "exiting";
    const centerX = FIELD.x + FIELD.width / 2;
    const centerY = FIELD.y + FIELD.height / 2;
    this.exitAngle = Phaser.Math.Angle.Between(centerX, centerY, this.x, this.y) + randomRange(-0.2, 0.2);
  }

  private findNearestSheep(sheep: Sheep[]): Sheep | null {
    let nearest: Sheep | null = null;
    let nearestDist = Infinity;
    for (const s of sheep) {
      if (s.caught) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, s.x, s.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = s;
      }
    }
    return nearest;
  }
}
