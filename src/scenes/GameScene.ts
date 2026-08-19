import Phaser from "phaser";
import {
  ANIMAL_BOUNDS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLORS,
  DOG_BOUNDS,
  FIELD,
  HUD_HEIGHT,
  PEN_CENTER,
  SHEEP_RADIUS,
} from "../config/constants.ts";
import { getLevel, type LevelConfig } from "../config/levels.ts";
import { Dog } from "../entities/Dog.ts";
import { Sheep } from "../entities/Sheep.ts";
import { Wolf } from "../entities/Wolf.ts";
import { randomRange } from "../utils/steering.ts";
import { makeButton } from "../utils/ui.ts";

interface GameSceneData {
  levelId: number;
}

export class GameScene extends Phaser.Scene {
  private level!: LevelConfig;
  private dogs: Dog[] = [];
  private sheep: Sheep[] = [];
  private wolves: Wolf[] = [];
  private activeDogIndex = 0;
  private startTime = 0;
  private ended = false;
  private sheepLostCount = 0;

  private timerText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private toast?: Phaser.GameObjects.Text;

  constructor() {
    super("Game");
  }

  init(data: GameSceneData): void {
    this.level = getLevel(data.levelId);
    this.dogs = [];
    this.sheep = [];
    this.wolves = [];
    this.activeDogIndex = 0;
    this.ended = false;
    this.sheepLostCount = 0;
  }

  create(): void {
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, COLORS.background).setOrigin(0);
    this.add
      .tileSprite(FIELD.x, FIELD.y, FIELD.width, FIELD.height, "grass_tile")
      .setOrigin(0)
      .setDepth(0);
    this.add
      .rectangle(FIELD.x, FIELD.y, FIELD.width, FIELD.height)
      .setOrigin(0)
      .setStrokeStyle(3, 0x2f4a24, 1)
      .setDepth(1);

    this.add
      .circle(PEN_CENTER.x, PEN_CENTER.y, this.level.penRadius, COLORS.pen, 1)
      .setStrokeStyle(5, COLORS.penBorder, 1)
      .setDepth(2);
    this.add
      .text(PEN_CENTER.x, PEN_CENTER.y, "ZAGRODA", {
        fontFamily: "sans-serif",
        fontSize: "13px",
        color: "#5c4326",
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.spawnDogs();
    this.spawnSheep();
    this.scheduleWolfSpawn();

    this.buildHud();

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.ended) return;
      if (pointer.y < FIELD.y - 4) return;
      const dog = this.dogs[this.activeDogIndex];
      if (dog) dog.moveTo(pointer.x, pointer.y);
    });

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      const num = Number(event.key);
      if (num >= 1 && num <= this.dogs.length) {
        this.setActiveDog(num - 1);
      }
    });

    this.startTime = this.time.now;
  }

  private buildHud(): void {
    this.add.rectangle(0, 0, CANVAS_WIDTH, HUD_HEIGHT, COLORS.hudBg, 1).setOrigin(0).setDepth(20);

    this.timerText = this.add
      .text(16, HUD_HEIGHT / 2, "0.0 s", { fontFamily: "sans-serif", fontSize: "20px", color: "#ffffff" })
      .setOrigin(0, 0.5)
      .setDepth(21);

    this.statusText = this.add
      .text(CANVAS_WIDTH / 2, HUD_HEIGHT / 2, "", {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color: "#c7e6a3",
      })
      .setOrigin(0.5)
      .setDepth(21);

    makeButton(this, CANVAS_WIDTH - 80, HUD_HEIGHT / 2, 120, 36, "Menu", () => this.confirmExit(), 15);

    if (this.dogs.length > 1) {
      this.add
        .text(CANVAS_WIDTH - 220, HUD_HEIGHT / 2, "Psy: [1][2][3]", {
          fontFamily: "sans-serif",
          fontSize: "14px",
          color: "#9ca3af",
        })
        .setOrigin(0.5)
        .setDepth(21);
    }
  }

  private confirmExit(): void {
    this.scene.start("LevelSelect");
  }

  private spawnDogs(): void {
    const count = this.level.dogCount;
    const y = DOG_BOUNDS.y + DOG_BOUNDS.height - 20;
    for (let i = 0; i < count; i++) {
      const x = DOG_BOUNDS.x + ((i + 1) * DOG_BOUNDS.width) / (count + 1);
      const dog = new Dog(this, x, y, i, this.level.dogSpeed, this.level.dogInfluenceRadius);
      this.dogs.push(dog);
    }
    this.setActiveDog(0);
  }

  private setActiveDog(index: number): void {
    this.activeDogIndex = index;
    this.dogs.forEach((d, i) => d.setActiveVisual(i === index));
  }

  private spawnSheep(): void {
    const minDistFromPen = this.level.penRadius + 60;
    for (let i = 0; i < this.level.sheepCount; i++) {
      let x = 0;
      let y = 0;
      let attempts = 0;
      do {
        x = randomRange(ANIMAL_BOUNDS.x, ANIMAL_BOUNDS.x + ANIMAL_BOUNDS.width);
        y = randomRange(ANIMAL_BOUNDS.y, ANIMAL_BOUNDS.y + ANIMAL_BOUNDS.height);
        attempts++;
      } while (Phaser.Math.Distance.Between(x, y, PEN_CENTER.x, PEN_CENTER.y) < minDistFromPen && attempts < 40);
      this.sheep.push(new Sheep(this, x, y));
    }
  }

  private scheduleWolfSpawn(): void {
    if (this.level.wolfCount === 0) return;
    const [min, max] = this.level.wolfSpawnDelayMs;
    this.time.delayedCall(randomRange(min, max), () => {
      if (this.ended) return;
      const activeWolves = this.wolves.filter((w) => !w.eliminated);
      if (activeWolves.length < this.level.wolfCount) {
        this.spawnWolf();
      }
      this.scheduleWolfSpawn();
    });
  }

  private spawnWolf(): void {
    const edge = Math.floor(randomRange(0, 4));
    let x: number;
    let y: number;
    if (edge === 0) {
      x = randomRange(FIELD.x, FIELD.x + FIELD.width);
      y = FIELD.y;
    } else if (edge === 1) {
      x = FIELD.x + FIELD.width;
      y = randomRange(FIELD.y, FIELD.y + FIELD.height);
    } else if (edge === 2) {
      x = randomRange(FIELD.x, FIELD.x + FIELD.width);
      y = FIELD.y + FIELD.height;
    } else {
      x = FIELD.x;
      y = randomRange(FIELD.y, FIELD.y + FIELD.height);
    }
    const wolf = new Wolf(this, x, y, this.level.wolfSpeed);
    wolf.on("catch", (sheep: Sheep) => this.onSheepCaught(sheep));
    this.wolves.push(wolf);
  }

  private onSheepCaught(sheep: Sheep): void {
    if (sheep.caught) return;
    sheep.caught = true;
    sheep.setVisible(false);
    this.sheepLostCount++;
    this.showToast("Wilk złapał owcę!");
    this.time.delayedCall(900, () => this.endLevel(false));
  }

  private showToast(message: string): void {
    this.toast?.destroy();
    this.toast = this.add
      .text(CANVAS_WIDTH / 2, HUD_HEIGHT + 24, message, {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color: "#ff6b6b",
        backgroundColor: "#000000aa",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(30);
    this.time.delayedCall(1500, () => this.toast?.destroy());
  }

  update(_time: number, delta: number): void {
    if (this.ended) return;
    const deltaSec = Math.min(delta / 1000, 0.05);

    for (const dog of this.dogs) dog.update(deltaSec);
    for (const s of this.sheep) s.update(deltaSec, this.dogs, this.wolves, this.sheep);
    for (const w of this.wolves) w.update(deltaSec, this.dogs, this.sheep);

    const elapsedSec = (this.time.now - this.startTime) / 1000;
    this.timerText.setText(`${elapsedSec.toFixed(1)} s`);

    const liveSheep = this.sheep.filter((s) => !s.caught);
    const inPen = liveSheep.filter(
      (s) => Phaser.Math.Distance.Between(s.x, s.y, PEN_CENTER.x, PEN_CENTER.y) < this.level.penRadius - SHEEP_RADIUS * 0.3,
    );
    this.statusText.setText(`W zagrodzie: ${inPen.length} / ${this.level.sheepCount}`);

    if (this.sheepLostCount === 0 && inPen.length === this.level.sheepCount) {
      this.endLevel(true);
    }
  }

  private endLevel(success: boolean): void {
    if (this.ended) return;
    this.ended = true;
    const elapsedMs = this.time.now - this.startTime;
    this.time.delayedCall(200, () => {
      this.scene.start("Result", { levelId: this.level.id, elapsedMs, success });
    });
  }
}
