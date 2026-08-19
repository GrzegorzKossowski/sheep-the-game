# Sheep the Game

Przeglądarkowa gra logiczno-zręcznościowa: zaganiaj owce do zagrody, zanim złapią je wilki.

Zbudowana w [Phaser 3](https://phaser.io/) + TypeScript + Vite.

## Rozwój lokalny

```bash
npm install
npm run dev
```

Otwórz adres wypisany w terminalu (domyślnie `http://localhost:5173/sheep-the-game/`).

## Build produkcyjny

```bash
npm run build
npm run preview
```

## Deploy na GitHub Pages

Workflow `.github/workflows/deploy.yml` automatycznie buduje i publikuje
zawartość `dist/` na GitHub Pages przy każdym pushu do gałęzi `main`.

W ustawieniach repozytorium (Settings → Pages) wybierz źródło **GitHub Actions**.

Ścieżka bazowa (`base` w `vite.config.ts`) jest ustawiona na `/sheep-the-game/` —
jeśli repozytorium na GitHubie nazywa się inaczej, zaktualizuj tę wartość.

## Zasady gry

Zobacz ekran „Zasady" w grze (Menu → Zasady) lub [src/scenes/AboutScene.ts](src/scenes/AboutScene.ts).

## Struktura projektu

- `src/scenes/` – ekrany gry (Boot, Menu, About, LevelSelect, Game, Result)
- `src/entities/` – logika psów, owiec i wilków (ruch typu "steering")
- `src/config/` – definicje poziomów i stałe rozgrywki
- `src/utils/` – zapis postępu (localStorage), pomocnicze funkcje wektorowe i UI
