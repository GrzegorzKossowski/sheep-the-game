import Phaser from "phaser";
import {
  ANIMAL_BOUNDS,
  ANIMAL_CORNER_RADIUS,
  SHEEP_FLEE_JITTER_DEG,
  SHEEP_FLEE_MAX_SPEED,
  SHEEP_FLEE_MIN_SPEED,
  SHEEP_SEPARATION_RADIUS,
  SHEEP_WANDER_SPEED,
} from "../config/constants.ts";
import { clampToRoundedRect, randomRange } from "../utils/steering.ts";
import type { Dog } from "./Dog.ts";
import type { Wolf } from "./Wolf.ts";

const WOLF_FLEE_RADIUS = 170;
const JITTER_REROLL_MIN_MS = 350;
const JITTER_REROLL_MAX_MS = 750;

export class Sheep extends Phaser.GameObjects.Image {
  private wanderAngle = Math.random() * Math.PI * 2;
  private jitterAngle = 0;
  private jitterTimer = 0;
  caught = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "sheep");
    scene.add.existing(this);
    this.setDepth(5);
    this.rerollJitter();
  }

  private rerollJitter(): void {
    const deg = randomRange(-SHEEP_FLEE_JITTER_DEG, SHEEP_FLEE_JITTER_DEG);
    this.jitterAngle = Phaser.Math.DegToRad(deg);
    this.jitterTimer = randomRange(JITTER_REROLL_MIN_MS, JITTER_REROLL_MAX_MS);
  }

  update(deltaSec: number, dogs: Dog[], wolves: Wolf[], flock: Sheep[]): void {
    if (this.caught) return;

    this.jitterTimer -= deltaSec * 1000;
    if (this.jitterTimer <= 0) this.rerollJitter();

    let awayX = 0;
    let awayY = 0;
    let maxWeight = 0;

    for (const dog of dogs) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, dog.x, dog.y);
      if (dist >= dog.influenceRadius) continue;
      const weight = 1 - dist / dog.influenceRadius;
      const dx = this.x - dog.x;
      const dy = this.y - dog.y;
      const len = Math.max(Math.hypot(dx, dy), 0.001);
      awayX += (dx / len) * weight;
      awayY += (dy / len) * weight;
      if (weight > maxWeight) maxWeight = weight;
    }

    for (const wolf of wolves) {
      if (wolf.eliminated) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, wolf.x, wolf.y);
      if (dist >= WOLF_FLEE_RADIUS) continue;
      const weight = (1 - dist / WOLF_FLEE_RADIUS) * 1.3;
      const dx = this.x - wolf.x;
      const dy = this.y - wolf.y;
      const len = Math.max(Math.hypot(dx, dy), 0.001);
      awayX += (dx / len) * weight;
      awayY += (dy / len) * weight;
      if (weight > maxWeight) maxWeight = weight;
    }

    let dirX: number;
    let dirY: number;
    let speed: number;

    const fleeing = maxWeight > 0;
    if (fleeing) {
      const baseAngle = Math.atan2(awayY, awayX);
      const finalAngle = baseAngle + this.jitterAngle;
      dirX = Math.cos(finalAngle);
      dirY = Math.sin(finalAngle);
      speed = Phaser.Math.Linear(SHEEP_FLEE_MIN_SPEED, SHEEP_FLEE_MAX_SPEED, Math.min(maxWeight, 1));
      this.wanderAngle = finalAngle;
    } else {
      this.wanderAngle += randomRange(-0.6, 0.6) * deltaSec;
      dirX = Math.cos(this.wanderAngle);
      dirY = Math.sin(this.wanderAngle);
      speed = SHEEP_WANDER_SPEED;
    }

    let sepX = 0;
    let sepY = 0;
    for (const other of flock) {
      if (other === this || other.caught) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, other.x, other.y);
      if (dist >= SHEEP_SEPARATION_RADIUS || dist <= 0.001) continue;
      const weight = 1 - dist / SHEEP_SEPARATION_RADIUS;
      sepX += ((this.x - other.x) / dist) * weight;
      sepY += ((this.y - other.y) / dist) * weight;
    }

    const vx = dirX * speed + sepX * 40;
    const vy = dirY * speed + sepY * 40;

    this.x += vx * deltaSec;
    this.y += vy * deltaSec;

    const clamped = clampToRoundedRect(this.x, this.y, ANIMAL_BOUNDS, ANIMAL_CORNER_RADIUS);
    this.x = clamped.x;
    this.y = clamped.y;
  }
}
