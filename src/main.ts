import Phaser from "phaser";
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from "./config/constants.ts";
import { BootScene } from "./scenes/BootScene.ts";
import { MenuScene } from "./scenes/MenuScene.ts";
import { AboutScene } from "./scenes/AboutScene.ts";
import { LevelSelectScene } from "./scenes/LevelSelectScene.ts";
import { GameScene } from "./scenes/GameScene.ts";
import { ResultScene } from "./scenes/ResultScene.ts";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "app",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: COLORS.background,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, AboutScene, LevelSelectScene, GameScene, ResultScene],
});
