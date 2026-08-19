import Phaser from "phaser";
import { ANIMAL_CORNER_RADIUS, SHEEP_RADIUS, WOLF_RADIUS } from "../config/constants.ts";
import type { RectBounds } from "../utils/steering.ts";
import { clampToRoundedRect, randomRange } from "../utils/steering.ts";
import type { Dog } from "./Dog.ts";
import type { Sheep } from "./Sheep.ts";

// Hysteresis gap between entering and leaving "fleeing" mode: without it, a dog parked
// right at the trigger distance makes the wolf flip flee/hunt every frame and vibrate in place.
const DOG_SCARE_ENTER_RADIUS = 115;
const DOG_SCARE_EXIT_RADIUS = 175;
const CATCH_DISTANCE = SHEEP_RADIUS + WOLF_RADIUS - 2;
const EXIT_MARGIN = 40;
const SPAWN_GRACE_MS = 900;
const WARY_DURATION_MS = 2500;
const WARY_SPEED_FACTOR = 0.35;
// A dog can hold a wolf off forever otherwise (park next to it and it just flees in place).
// After this long without a catch the wolf gives up and leaves on its own.
const MAX_HUNT_MS = 20000;

type WolfState = "hunting" | "fleeing" | "wary" | "exiting";

export class Wolf extends Phaser.GameObjects.Image {
  speed: number;
  eliminated = false;
  private mode: WolfState = "hunting";
  private exitAngle = 0;
  private waryAngle = 0;
  private waryMs = 0;
  private graceMs = SPAWN_GRACE_MS;
  private huntMs = 0;
  private animalBounds: RectBounds;
  private field: RectBounds;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    speed: number,
    animalBounds: RectBounds,
    field: RectBounds,
  ) {
    super(scene, x, y, "wolf");
    this.speed = speed;
    this.animalBounds = animalBounds;
    this.field = field;
    scene.add.existing(this);
    this.setDepth(6);
    this.setScale(0);
    scene.tweens.add({ targets: this, scale: 1, duration: SPAWN_GRACE_MS, ease: "Back.Out" });
  }

  update(deltaSec: number, dogs: Dog[], sheep: Sheep[]): void {
    if (this.eliminated) return;

    if (this.graceMs > 0) {
      this.graceMs -= deltaSec * 1000;
      return;
    }

    if (this.mode !== "exiting") {
      this.huntMs += deltaSec * 1000;
      if (this.huntMs > MAX_HUNT_MS) {
        this.emit("gaveUp");
        this.beginExit();
        return;
      }
    }

    switch (this.mode) {
      case "hunting":
        this.updateHunting(deltaSec, dogs, sheep);
        break;
      case "fleeing":
        this.updateFleeing(deltaSec, dogs);
        break;
      case "wary":
        this.updateWary(deltaSec, dogs);
        break;
      case "exiting":
        this.updateExiting(deltaSec);
        break;
    }
  }

  private updateHunting(deltaSec: number, dogs: Dog[], sheep: Sheep[]): void {
    const { dog: nearestDog, dist: nearestDogDist } = this.nearestDog(dogs);
    if (nearestDog && nearestDogDist < DOG_SCARE_ENTER_RADIUS) {
      this.mode = "fleeing";
      this.updateFleeing(deltaSec, dogs);
      return;
    }

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

    this.clampToAnimalBounds();
  }

  private updateFleeing(deltaSec: number, dogs: Dog[]): void {
    const { dog: nearestDog, dist: nearestDogDist } = this.nearestDog(dogs);
    if (!nearestDog || nearestDogDist >= DOG_SCARE_EXIT_RADIUS) {
      this.beginWary();
      return;
    }

    const angle = Phaser.Math.Angle.Between(nearestDog.x, nearestDog.y, this.x, this.y);
    const step = this.speed * 1.1 * deltaSec;
    this.x += Math.cos(angle) * step;
    this.y += Math.sin(angle) * step;

    if (this.isBeyondField()) {
      this.eliminated = true;
      this.emit("eliminated");
      this.destroy();
    }
  }

  /** Scared off but not driven off the field: circles warily at a safe distance before hunting again. */
  private updateWary(deltaSec: number, dogs: Dog[]): void {
    const { dog: nearestDog, dist: nearestDogDist } = this.nearestDog(dogs);
    if (nearestDog && nearestDogDist < DOG_SCARE_ENTER_RADIUS) {
      this.mode = "fleeing";
      this.updateFleeing(deltaSec, dogs);
      return;
    }

    this.waryAngle += randomRange(-1.2, 1.2) * deltaSec;
    const step = this.speed * WARY_SPEED_FACTOR * deltaSec;
    this.x += Math.cos(this.waryAngle) * step;
    this.y += Math.sin(this.waryAngle) * step;
    this.clampToAnimalBounds();

    this.waryMs -= deltaSec * 1000;
    if (this.waryMs <= 0) {
      this.mode = "hunting";
    }
  }

  private updateExiting(deltaSec: number): void {
    const step = this.speed * deltaSec;
    this.x += Math.cos(this.exitAngle) * step;
    this.y += Math.sin(this.exitAngle) * step;
    if (this.isBeyondField()) {
      this.eliminated = true;
      this.emit("exited");
      this.destroy();
    }
  }

  private nearestDog(dogs: Dog[]): { dog: Dog | null; dist: number } {
    let nearestDog: Dog | null = null;
    let nearestDogDist = Infinity;
    for (const dog of dogs) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, dog.x, dog.y);
      if (dist < nearestDogDist) {
        nearestDogDist = dist;
        nearestDog = dog;
      }
    }
    return { dog: nearestDog, dist: nearestDogDist };
  }

  private clampToAnimalBounds(): void {
    const clamped = clampToRoundedRect(this.x, this.y, this.animalBounds, ANIMAL_CORNER_RADIUS);
    this.x = clamped.x;
    this.y = clamped.y;
  }

  private isBeyondField(): boolean {
    return (
      this.x < this.field.x - EXIT_MARGIN ||
      this.x > this.field.x + this.field.width + EXIT_MARGIN ||
      this.y < this.field.y - EXIT_MARGIN ||
      this.y > this.field.y + this.field.height + EXIT_MARGIN
    );
  }

  private beginWary(): void {
    this.mode = "wary";
    this.waryMs = WARY_DURATION_MS;
    this.waryAngle = randomRange(0, Math.PI * 2);
  }

  private beginExit(): void {
    this.mode = "exiting";
    const centerX = this.field.x + this.field.width / 2;
    const centerY = this.field.y + this.field.height / 2;
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
