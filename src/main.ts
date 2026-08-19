import Phaser from "phaser";
import { COLORS } from "./config/constants.ts";
import { BootScene } from "./scenes/BootScene.ts";
import { MenuScene } from "./scenes/MenuScene.ts";
import { AboutScene } from "./scenes/AboutScene.ts";
import { LevelSelectScene } from "./scenes/LevelSelectScene.ts";
import { GameScene } from "./scenes/GameScene.ts";
import { ResultScene } from "./scenes/ResultScene.ts";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "app",
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: COLORS.background,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, AboutScene, LevelSelectScene, GameScene, ResultScene],
});
