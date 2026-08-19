import Phaser from "phaser";
import { COLORS, computeLayout, HUD_HEIGHT, SHEEP_RADIUS, type Layout } from "../config/constants.ts";
import { getLevel, type LevelConfig } from "../config/levels.ts";
import { Dog } from "../entities/Dog.ts";
import { Sheep } from "../entities/Sheep.ts";
import { Wolf } from "../entities/Wolf.ts";
import { computeStars } from "../utils/scoring.ts";
import { randomRange } from "../utils/steering.ts";
import { makeButton } from "../utils/ui.ts";

interface GameSceneData {
  levelId: number;
}

export class GameScene extends Phaser.Scene {
  private level!: LevelConfig;
  private layout!: Layout;
  private dogs: Dog[] = [];
  private sheep: Sheep[] = [];
  private wolves: Wolf[] = [];
  private activeDogIndex = 0;
  private startTime = 0;
  private ended = false;
  private sheepLostCount = 0;
  private lastLiveStars = 3;

  private timerText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private starsText!: Phaser.GameObjects.Text;
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
    this.lastLiveStars = 3;
  }

  create(): void {
    this.layout = computeLayout(this.scale.width, this.scale.height);
    const { width, height, field, penCenter } = this.layout;

    this.add.rectangle(0, 0, width, height, COLORS.background).setOrigin(0).setDepth(-2);
    this.add.rectangle(0, HUD_HEIGHT, width, height - HUD_HEIGHT, COLORS.forestMid).setOrigin(0).setDepth(-1);
    this.add.tileSprite(field.x, field.y, field.width, field.height, "grass_tile").setOrigin(0).setDepth(0);
    this.drawForestEdge(field);

    this.add
      .circle(penCenter.x, penCenter.y, this.level.penRadius, COLORS.pen, 1)
      .setStrokeStyle(5, COLORS.penBorder, 1)
      .setDepth(2);
    this.add
      .text(penCenter.x, penCenter.y, "ZAGRODA", { fontFamily: "sans-serif", fontSize: "13px", color: "#5c4326" })
      .setOrigin(0.5)
      .setDepth(3);

    this.spawnDogs();
    this.spawnSheep();
    this.scheduleWolfSpawn();

    this.buildHud();

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.ended) return;
      if (pointer.y < field.y - 4) return;
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

  /** Scatters tree-canopy blobs along the field's border to read as a wavy forest edge. */
  private drawForestEdge(field: Layout["field"]): void {
    const g = this.add.graphics().setDepth(1);
    const spacing = 22;
    const palette = [COLORS.forestDark, COLORS.forestMid];
    let seed = 11;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const blob = (cx: number, cy: number) => {
      const r = 12 + rand() * 11;
      g.fillStyle(palette[Math.floor(rand() * palette.length)], 1);
      g.fillCircle(cx, cy, r);
    };

    for (let x = field.x; x <= field.x + field.width; x += spacing) {
      blob(x + (rand() - 0.5) * 10, field.y + (rand() - 0.5) * 10);
      blob(x + (rand() - 0.5) * 10, field.y + field.height + (rand() - 0.5) * 10);
    }
    for (let y = field.y; y <= field.y + field.height; y += spacing) {
      blob(field.x + (rand() - 0.5) * 10, y + (rand() - 0.5) * 10);
      blob(field.x + field.width + (rand() - 0.5) * 10, y + (rand() - 0.5) * 10);
    }
  }

  private buildHud(): void {
    const width = this.layout.width;
    this.add.rectangle(0, 0, width, HUD_HEIGHT, COLORS.hudBg, 1).setOrigin(0).setDepth(20);

    this.timerText = this.add
      .text(16, HUD_HEIGHT / 2, "0.0 s", { fontFamily: "sans-serif", fontSize: "20px", color: "#ffffff" })
      .setOrigin(0, 0.5)
      .setDepth(21);

    this.starsText = this.add
      .text(130, HUD_HEIGHT / 2, "★★★", { fontFamily: "sans-serif", fontSize: "20px", color: "#facc15" })
      .setOrigin(0, 0.5)
      .setDepth(21);

    this.statusText = this.add
      .text(width / 2, HUD_HEIGHT / 2, "", { fontFamily: "sans-serif", fontSize: "18px", color: "#c7e6a3" })
      .setOrigin(0.5)
      .setDepth(21);

    makeButton(this, width - 80, HUD_HEIGHT / 2, 120, 36, "Menu", () => this.confirmExit(), 15);

    if (this.dogs.length > 1) {
      this.add
        .text(width - 220, HUD_HEIGHT / 2, "Psy: [1][2][3]", {
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
    const { dogBounds } = this.layout;
    const count = this.level.dogCount;
    const y = dogBounds.y + dogBounds.height - 20;
    for (let i = 0; i < count; i++) {
      const x = dogBounds.x + ((i + 1) * dogBounds.width) / (count + 1);
      const dog = new Dog(this, x, y, i, this.level.dogSpeed, this.level.dogInfluenceRadius, dogBounds);
      this.dogs.push(dog);
    }
    this.setActiveDog(0);
  }

  private setActiveDog(index: number): void {
    this.activeDogIndex = index;
    this.dogs.forEach((d, i) => d.setActiveVisual(i === index));
  }

  private spawnSheep(): void {
    const { animalBounds, penCenter } = this.layout;
    const minDistFromPen = this.level.penRadius + 60;
    for (let i = 0; i < this.level.sheepCount; i++) {
      let x = 0;
      let y = 0;
      let attempts = 0;
      do {
        x = randomRange(animalBounds.x, animalBounds.x + animalBounds.width);
        y = randomRange(animalBounds.y, animalBounds.y + animalBounds.height);
        attempts++;
      } while (Phaser.Math.Distance.Between(x, y, penCenter.x, penCenter.y) < minDistFromPen && attempts < 40);
      this.sheep.push(
        new Sheep(
          this,
          x,
          y,
          this.level.sheepWanderSpeed,
          this.level.sheepFleeMinSpeed,
          this.level.sheepFleeMaxSpeed,
          animalBounds,
        ),
      );
    }
  }

  private scheduleWolfSpawn(): void {
    if (this.level.wolfCount === 0) return;
    const [min, max] = this.level.wolfSpawnDelayMs;
    this.time.delayedCall(randomRange(min, max), () => {
      if (this.ended) return;
      const activeWolves = this.wolves.filter((w) => !w.eliminated);
      if (activeWolves.length < this.level.wolfCount) {
        this.warnThenSpawnWolf();
      } else {
        this.scheduleWolfSpawn();
      }
    });
  }

  private warnThenSpawnWolf(): void {
    this.showToast("UWAGA: nadciąga wilk!", "#fbbf24");
    this.time.delayedCall(800, () => {
      if (this.ended) return;
      this.spawnWolf();
      this.scheduleWolfSpawn();
    });
  }

  private spawnWolf(): void {
    const { field, animalBounds } = this.layout;
    const edge = Math.floor(randomRange(0, 4));
    let x: number;
    let y: number;
    if (edge === 0) {
      x = randomRange(field.x, field.x + field.width);
      y = field.y;
    } else if (edge === 1) {
      x = field.x + field.width;
      y = randomRange(field.y, field.y + field.height);
    } else if (edge === 2) {
      x = randomRange(field.x, field.x + field.width);
      y = field.y + field.height;
    } else {
      x = field.x;
      y = randomRange(field.y, field.y + field.height);
    }
    const wolf = new Wolf(this, x, y, this.level.wolfSpeed, animalBounds, field);
    wolf.on("catch", (sheep: Sheep) => this.onSheepCaught(sheep));
    wolf.on("eliminated", () => this.showToast("Wilk przepędzony poza planszę!", "#a3e635"));
    wolf.on("gaveUp", () => this.showToast("Wilk się poddaje i się wycofuje.", "#9ca3af"));
    this.wolves.push(wolf);
  }

  private onSheepCaught(sheep: Sheep): void {
    if (sheep.caught) return;
    sheep.caught = true;
    sheep.setVisible(false);
    this.sheepLostCount++;
    const remaining = this.sheep.filter((s) => !s.caught).length;
    if (remaining === 0) {
      this.showToast("Wilki złapały wszystkie owce...", "#ff6b6b");
      this.time.delayedCall(900, () => this.endLevel(false));
    } else {
      this.showToast("Wilk złapał owcę! Reszta wciąż czeka na zagrodę.", "#ff6b6b");
    }
  }

  private showToast(message: string, color: string): void {
    this.toast?.destroy();
    this.toast = this.add
      .text(this.layout.width / 2, HUD_HEIGHT + 24, message, {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color,
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

    const liveStars = computeStars(elapsedSec, this.level.timeThresholds, this.sheepLostCount);
    this.starsText.setText("★".repeat(liveStars) + "☆".repeat(3 - liveStars));
    if (liveStars < this.lastLiveStars) {
      this.showToast("Straciłeś gwiazdkę!", "#fbbf24");
    }
    this.lastLiveStars = liveStars;

    const penCenter = this.layout.penCenter;
    const liveSheep = this.sheep.filter((s) => !s.caught);
    const inPen = liveSheep.filter(
      (s) => Phaser.Math.Distance.Between(s.x, s.y, penCenter.x, penCenter.y) < this.level.penRadius - SHEEP_RADIUS * 0.3,
    );
    this.statusText.setText(
      `W zagrodzie: ${inPen.length} / ${this.level.sheepCount}` +
        (this.sheepLostCount > 0 ? `  (stracone: ${this.sheepLostCount})` : ""),
    );

    if (liveSheep.length > 0 && inPen.length === liveSheep.length) {
      this.endLevel(true);
    }
  }

  private endLevel(success: boolean): void {
    if (this.ended) return;
    this.ended = true;
    const elapsedMs = this.time.now - this.startTime;
    this.time.delayedCall(200, () => {
      this.scene.start("Result", {
        levelId: this.level.id,
        elapsedMs,
        success,
        sheepLost: this.sheepLostCount,
      });
    });
  }
}
