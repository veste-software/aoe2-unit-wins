# AoE2 Unit Wins

**Which Age of Empires II units actually win?** An interactive dashboard of win rates by civilization and unit, built from more than 300,000 real ranked 1v1 games (both players rated 1200+), checked against the game's own unit stats.

Live site: _set after publishing, `https://<account>.github.io/aoe2-unit-wins/`_

## What you can do

- **Overview** - pick any civ and unit and see whether massing it goes with winning, under three increasingly strict tests.
- **Unit rankings** - every civ x unit, ranked by expected win-rate uplift; sort, filter, open a unit for stats, real-game results and model matchups; export CSV.
- **What wins** - all measured civ-unit pairs on one chart, with a noise band so you can tell signal from luck.
- **Counters** - army-vs-army win rates (e.g. Champions vs Arbalesters, Knights vs Spearmen) next to what a stats model predicts.
- **Civs** - bonuses, unique units and techs, and how each unit ranks for that civ.
- **Method** - exactly how it was measured, how the model was checked, and the limits.

## The one thing to know

Counting units over a whole game flatters late-game and unique units: a player who is already winning trains lots of them. So there are three tests (whole game, Imperial Age reached, and a strict test using only Castle-age production). The headline example, Goths massing Huskarls, is +15 points of win rate whole-game but only +4 (not significant) under the strict test. The dashboard shows all three side by side. Everything here is a correlation, not a controlled experiment.

## Data and limits

- Game results: public weekly database dumps from [aoestats.io](https://aoestats.io/api-info/) (ranked 1v1 random map, replay-enhanced games). Unit-level data in those dumps ends in Feb 2024, so units, balance and 11 civs added since are not covered by real games (their rows are stats-model only).
- Unit and civ data: [SiegeEngineers/aoe2techtree](https://github.com/SiegeEngineers/aoe2techtree), DE update 185872.
- Full downloads are in `data/`: `unit-ranking-full.json`, `winrate-by-unit-full.json`, `report.md`, and the compact `data.json` the site runs on.

## Run it locally

It is a static site with no build step and no dependencies:

```
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly will not work because the page loads `data/data.json`.)

## Publishing on GitHub Pages

Settings -> Pages -> Build and deployment -> Deploy from a branch -> `main`, folder `/ (root)`.

## Credits and legal

AoE2 Unit Wins was created under Microsoft's ["Game Content Usage Rules"](https://www.xbox.com/en-US/developers/rules) using assets from Age of Empires II, (c) Microsoft Corporation. It uses no game art, only unit and civilization names and stats. It is an unofficial fan project and is not endorsed by or affiliated with Microsoft. Win-rate data is derived from aoestats.io and unit data from aoe2techtree; see their terms.

Code in `index.html` and `assets/` is released under the MIT License (see `LICENSE`).
