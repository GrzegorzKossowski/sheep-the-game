import Phaser from "phaser";
import { COLORS } from "../config/constants.ts";

export function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  onClick: () => void,
  fontSize = 20,
): Phaser.GameObjects.Container {
  const bg = scene.add.rectangle(0, 0, width, height, COLORS.panel, 1).setStrokeStyle(2, 0xffffff, 0.25);
  const text = scene.add
    .text(0, 0, label, { fontFamily: "sans-serif", fontSize: `${fontSize}px`, color: "#ffffff" })
    .setOrigin(0.5);
  const container = scene.add.container(x, y, [bg, text]);
  container.setSize(width, height);
  bg.setInteractive({ useHandCursor: true });
  bg.on("pointerover", () => bg.setFillStyle(0x3c4a2c, 1));
  bg.on("pointerout", () => bg.setFillStyle(COLORS.panel, 1));
  bg.on("pointerdown", () => bg.setFillStyle(0x1f2617, 1));
  bg.on("pointerup", () => {
    bg.setFillStyle(0x3c4a2c, 1);
    onClick();
  });
  return container;
}
