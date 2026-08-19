import Phaser from "phaser";
import { COLORS } from "../config/constants.ts";
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
  "  • Uwaga na wilki! Są nieco szybsze od owiec i mogą je złapać",
  "  • Pojawienie się wilka jest zapowiadane ostrzeżeniem na ekranie",
  "  • Podprowadź psa blisko wilka, aby wypłoszyć go poza planszę",
  "",
  "Wynik:",
  "  • Im szybciej zapędzisz wszystkie owce, tym więcej gwiazdek i monet zdobędziesz",
  "  • Utrata owcy na rzecz wilka obniża liczbę gwiazdek, ale gra toczy się dalej",
  "  • Poziom kończy się porażką tylko, gdy wilki złapią wszystkie owce",
];

export class AboutScene extends Phaser.Scene {
  constructor() {
    super("About");
  }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(0, 0, W, H, COLORS.background).setOrigin(0);
    this.add
      .text(W / 2, 40, "Zasady gry", { fontFamily: "sans-serif", fontSize: "32px", color: "#ffffff" })
      .setOrigin(0.5, 0);

    this.add.text(Math.max(60, W / 2 - 420), 100, RULES.join("\n"), {
      fontFamily: "sans-serif",
      fontSize: "16px",
      color: "#e5e5e5",
      lineSpacing: 6,
    });

    makeButton(this, W / 2, H - 50, 160, 48, "Wstecz", () => this.scene.start("Menu"));
  }
}
