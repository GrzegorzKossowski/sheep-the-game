import Phaser from "phaser";
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from "../config/constants.ts";
import { makeButton } from "../utils/ui.ts";

const RULES = [
  "Twoim zadaniem jest zagonić wszystkie owce do zagrody na środku łąki.",
  "",
  "Sterowanie:",
  "  • LMB (lewy przycisk myszy) – wyślij aktywnego psa w klikane miejsce",
  "  • Klawisze 1 / 2 / 3 – przełącz, który pies jest aktywny",
  "",
  "Zachowanie zwierząt:",
  "  • Owce uciekają od psów w przeciwną stronę, z lekkim losowym odchyleniem",
  "  • Im bliżej psa, tym szybciej owca ucieka",
  "  • Owce puszczone samopas błądzą powoli po łące",
  "  • Uwaga na wilki! Są szybsze od owiec i mogą je złapać",
  "  • Podprowadź psa blisko wilka, aby wypłoszyć go poza planszę",
  "",
  "Wynik:",
  "  • Im szybciej zapędzisz wszystkie owce, tym więcej gwiazdek i monet zdobędziesz",
  "  • Utrata owcy na rzecz wilka kończy poziom niepowodzeniem – spróbuj ponownie",
];

export class AboutScene extends Phaser.Scene {
  constructor() {
    super("About");
  }

  create(): void {
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, COLORS.background).setOrigin(0);
    this.add
      .text(CANVAS_WIDTH / 2, 40, "Zasady gry", { fontFamily: "sans-serif", fontSize: "32px", color: "#ffffff" })
      .setOrigin(0.5, 0);

    this.add.text(60, 100, RULES.join("\n"), {
      fontFamily: "sans-serif",
      fontSize: "16px",
      color: "#e5e5e5",
      lineSpacing: 6,
    });

    makeButton(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50, 160, 48, "Wstecz", () => this.scene.start("Menu"));
  }
}
