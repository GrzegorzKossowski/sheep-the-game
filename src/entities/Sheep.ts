import Phaser from "phaser";
import {
  ANIMAL_CORNER_RADIUS,
  SHEEP_FLEE_JITTER_DEG,
  SHEEP_RADIUS,
  SHEEP_SEPARATION_RADIUS,
} from "../config/constants.ts";
import type { RectBounds } from "../utils/steering.ts";
import { clampToRoundedRect, randomRange } from "../utils/steering.ts";
import type { Dog } from "./Dog.ts";
import type { Wolf } from "./Wolf.ts";

const WOLF_FLEE_RADIUS = 170;
const JITTER_REROLL_MIN_MS = 350;
const JITTER_REROLL_MAX_MS = 750;
const SETTLE_SPEED_FACTOR = 0.4;

export class Sheep extends Phaser.GameObjects.Image {
  private wanderAngle = Math.random() * Math.PI * 2;
  private jitterAngle = 0;
  private jitterTimer = 0;
  caught = false;
  /** Once true the sheep has reached the pen and is safe for good — it stops reacting to dogs/wolves. */
  settled = false;
  private wanderSpeed: number;
  private fleeMinSpeed: number;
  private fleeMaxSpeed: number;
  private animalBounds: RectBounds;
  private penCenter: { x: number; y: number };
  private penRadius: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    wanderSpeed: number,
    fleeMinSpeed: number,
    fleeMaxSpeed: number,
    animalBounds: RectBounds,
    penCenter: { x: number; y: number },
    penRadius: number,
  ) {
    super(scene, x, y, "sheep");
    this.wanderSpeed = wanderSpeed;
    this.fleeMinSpeed = fleeMinSpeed;
    this.fleeMaxSpeed = fleeMaxSpeed;
    this.animalBounds = animalBounds;
    this.penCenter = penCenter;
    this.penRadius = penRadius;
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
    if (this.settled) {
      this.updateSettled(deltaSec);
      return;
    }

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
      speed = Phaser.Math.Linear(this.fleeMinSpeed, this.fleeMaxSpeed, Math.min(maxWeight, 1));
      this.wanderAngle = finalAngle;
    } else {
      this.wanderAngle += randomRange(-0.6, 0.6) * deltaSec;
      dirX = Math.cos(this.wanderAngle);
      dirY = Math.sin(this.wanderAngle);
      speed = this.wanderSpeed;
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

    const clamped = clampToRoundedRect(this.x, this.y, this.animalBounds, ANIMAL_CORNER_RADIUS);
    this.x = clamped.x;
    this.y = clamped.y;

    const distToPen = Phaser.Math.Distance.Between(this.x, this.y, this.penCenter.x, this.penCenter.y);
    if (distToPen < this.penRadius - SHEEP_RADIUS * 1.2) {
      this.settled = true;
    }
  }

  /** Grazes calmly inside the pen, ignoring dogs and wolves entirely. Always keeps moving. */
  private updateSettled(deltaSec: number): void {
    this.wanderAngle += randomRange(-0.5, 0.5) * deltaSec;
    const speed = this.wanderSpeed * SETTLE_SPEED_FACTOR;
    const maxDist = this.penRadius - SHEEP_RADIUS * 0.8;

    let nx = this.x + Math.cos(this.wanderAngle) * speed * deltaSec;
    let ny = this.y + Math.sin(this.wanderAngle) * speed * deltaSec;
    if (Phaser.Math.Distance.Between(nx, ny, this.penCenter.x, this.penCenter.y) > maxDist) {
      this.wanderAngle = Phaser.Math.Angle.Between(this.x, this.y, this.penCenter.x, this.penCenter.y) + randomRange(-0.5, 0.5);
      nx = this.x + Math.cos(this.wanderAngle) * speed * deltaSec;
      ny = this.y + Math.sin(this.wanderAngle) * speed * deltaSec;
    }
    this.x = nx;
    this.y = ny;
  }
}
