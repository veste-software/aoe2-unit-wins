# Age of Empires II: DE - best units, civ by civ (calibrated on real games, Elo 1200+)

Generated 2026-10-14. Unit and civ data: aoe2techtree (update 185872). Real-game evidence: aoestats.io replay data, ranked 1v1, **both players rated 1200+**, 2023 - Feb 2024.

## Games analysed

| Test | What it measures | Games, main window | Games, spring 2023 | Pooled |
|---|---|--:|--:|--:|
| all | whole-game production (original method) | 94,424 | 70,119 | **164,543** |
| imp | both reached Imperial; Castle+Imperial production | 58,464 | 43,372 | **101,836** |
| cas | both reached Imperial; Castle-age production only (strict) | 41,397 | 31,049 | **72,446** |

314,436 games meet the base filters (1v1 random map, different civs, both players 1200+, at least 10 minutes); each test then keeps the games with enough army units (and, for the Imperial and Castle-age tests, where both players reached the Imperial Age). Unit data exists only up to Feb 2024.

## Are the correlations real? The age problem

Counting units over the whole game is misleading: a player who loses early never reaches the Castle Age, so they land in the "barely used" group for every Castle-age unit, and a player who is ahead trains lots of late units because they are ahead. That inflates Huskarls, unique units and Paladins and makes early units like Spearmen look bad. The Castle-age test fixes most of this by looking only at what the player built in the Castle Age, before the outcome is clear, in games where both reached the Imperial Age.

**The Goths and Huskarls example under the three tests:**

| Test | Win rate massed | Win rate barely used | Uplift | Relative | Games | z |
|---|--:|--:|--:|--:|--:|--:|
| whole game | 59.2% | 43.9% | +15.4 pts | +31% | 2,250 / 2,078 | +9.8 |
| Imperial reached, Castle+Imperial production | 59.6% | 46.0% | +13.6 pts | +27% | 1,689 / 911 | +6.7 |
| Imperial reached, Castle-age production only | 54.2% | 50.5% | +3.7 pts | +7% | 987 / 981 | +1.7 |

So the headline figure (about +30%) is real as a whole-game correlation, but it nearly disappears (+3.7 points, z = +1.7) when the unit mix is measured before the outcome is clear. Most of the Huskarl effect is Huskarls being trained by Goths who are already winning, not evidence that choosing Huskarls wins games. It is a popular example, but in the ranking it sits much lower (see below).

How much of the pattern is the age effect (average uplift, in win-rate points):

| Test | Early-age lines (Spearman, Skirmisher, Archer, Militia, Scout, Eagle) | Later and unique units |
|---|--:|--:|
| all | -5.1 | +6.5 |
| imp | -3.1 | +5.0 |
| cas | -3.9 | +2.6 |

The gap shrinks from +11.5 to +6.5 points under the strict test. Code check: shuffling the win/loss outcomes leaves at most 0.7% of civ-unit pairs above |z| = 3 (largest |z| 3.4), so the pipeline does not invent effects. Replication between the two windows: all r = 0.93, imp r = 0.91, cas r = 0.71.

## The strongest unit-win correlations

**Strict test (Castle-age composition, both players reached Imperial), strongest positives** (at least 200 games, z >= 3):

| Civ | Unit | Games (massed) | Win rate massed | Win rate barely used | Uplift | Relative | z | Correlation r |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Persians | Knight | 1,777 | 52.7% | 39.6% | +12.8 pts | +26% | +4.4 | +0.117 |
| Romans | Knight | 473 | 58.0% | 46.0% | +11.7 pts | +23% | +3.9 | +0.109 |
| Celts | Woad Raider | 575 | 57.0% | 45.4% | +11.6 pts | +23% | +4.6 | +0.107 |
| Slavs | Knight | 1,557 | 53.6% | 43.6% | +10.0 pts | +20% | +4.2 | +0.099 |
| Sicilians | Knight | 1,286 | 54.6% | 44.5% | +9.9 pts | +20% | +3.8 | +0.139 |
| Khmer | Knight | 2,623 | 50.7% | 41.0% | +9.8 pts | +20% | +4.5 | +0.116 |
| Chinese | Knight | 1,310 | 56.9% | 47.9% | +8.8 pts | +18% | +4.4 | +0.083 |
| Malians | Knight | 2,262 | 55.8% | 47.2% | +8.6 pts | +17% | +5.3 | +0.088 |
| Franks | Knight | 6,551 | 55.7% | 47.2% | +8.5 pts | +17% | +3.0 | +0.102 |
| Lithuanians | Knight | 3,585 | 52.2% | 44.7% | +8.0 pts | +16% | +3.6 | +0.108 |
| Hindustanis | Ghulam | 902 | 59.2% | 51.3% | +7.9 pts | +16% | +3.3 | +0.103 |
| Spanish | Knight | 1,248 | 54.3% | 46.6% | +7.8 pts | +16% | +4.2 | +0.087 |

**Survive every check** (significant in the whole-game, Imperial and Castle-age tests, and positive in each window separately):

| Civ | Unit | Castle-age test | Imperial test | Whole game | Main window | Spring 2023 |
|---|---|--:|--:|--:|--:|--:|
| Persians | Knight | +12.8 (z +4.4) | +9.6 | +12.7 | +10.1 | +19.7 |
| Romans | Knight | +11.7 (z +3.9) | +7.4 | +13.7 | +11.8 | +12.0 |
| Celts | Woad Raider | +11.6 (z +4.6) | +18.5 | +18.5 | +9.7 | +12.7 |
| Slavs | Knight | +10.0 (z +4.2) | +5.3 | +8.4 | +14.1 | +3.8 |
| Sicilians | Knight | +9.9 (z +3.8) | +8.8 | +11.8 | +9.7 | +8.8 |
| Khmer | Knight | +9.8 (z +4.5) | +4.1 | +11.4 | +12.5 | +6.4 |
| Chinese | Knight | +8.8 (z +4.4) | +9.4 | +16.1 | +8.1 | +9.5 |
| Malians | Knight | +8.6 (z +5.3) | +8.5 | +11.6 | +8.9 | +8.3 |
| Franks | Knight | +8.5 (z +3.0) | +9.7 | +17.4 | +7.2 | +8.7 |
| Hindustanis | Ghulam | +7.9 (z +3.3) | +10.2 | +13.0 | +8.6 | +4.4 |
| Spanish | Knight | +7.8 (z +4.2) | +12.6 | +13.0 | +5.2 | +11.0 |
| Turks | Scout Cavalry | +7.7 (z +3.3) | +20.7 | +18.4 | +4.3 | +12.0 |
| Tatars | Cavalry Archer | +7.2 (z +3.7) | +6.5 | +11.3 | +7.5 | +6.5 |
| Portuguese | Knight | +7.1 (z +3.6) | +7.9 | +11.3 | +4.6 | +10.5 |
| Incas | Eagle Scout | +7.0 (z +3.8) | +12.1 | +14.6 | +8.0 | +5.9 |
| Britons | Longbowman | +6.6 (z +2.6) | +12.2 | +12.0 | +7.9 | +4.7 |
| Huns | Cavalry Archer | +6.6 (z +3.8) | +6.1 | +6.2 | +8.1 | +5.1 |
| Aztecs | Eagle Scout | +5.7 (z +2.9) | +11.7 | +10.2 | +5.9 | +5.2 |
| Burmese | Knight | +5.7 (z +2.5) | +5.3 | +5.8 | +2.5 | +9.9 |
| Cumans | Knight | +5.7 (z +2.8) | +6.6 | +11.9 | +3.4 | +8.6 |
| Mayans | Eagle Scout | +4.9 (z +2.9) | +18.5 | +11.5 | +5.8 | +3.2 |

Strongest by correlation coefficient (unit share of the army vs win-minus-expected, strict test):

| Civ | Unit | Games (massed) | Win rate massed | Win rate barely used | Uplift | Relative | z | Correlation r |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Sicilians | Knight | 1,286 | 54.6% | 44.5% | +9.9 pts | +20% | +3.8 | +0.139 |
| Persians | Knight | 1,777 | 52.7% | 39.6% | +12.8 pts | +26% | +4.4 | +0.117 |
| Khmer | Knight | 2,623 | 50.7% | 41.0% | +9.8 pts | +20% | +4.5 | +0.116 |
| Sicilians | Spearman | 433 | 39.7% | 54.0% | -14.4 pts | -29% | -5.3 | -0.113 |
| Romans | Knight | 473 | 58.0% | 46.0% | +11.7 pts | +23% | +3.9 | +0.109 |
| Lithuanians | Knight | 3,585 | 52.2% | 44.7% | +8.0 pts | +16% | +3.6 | +0.108 |

Units to avoid massing (strict test, z <= -3):

| Civ | Unit | Games (massed) | Win rate massed | Win rate barely used | Uplift | Relative | z | Correlation r |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Mongols | Spearman | 514 | 32.9% | 50.6% | -17.8 pts | -36% | -7.8 | -0.090 |
| Italians | Spearman | 288 | 31.6% | 46.9% | -15.4 pts | -31% | -4.9 | -0.099 |
| Malians | Spearman | 505 | 39.5% | 54.7% | -15.3 pts | -31% | -6.5 | -0.098 |
| Slavs | Skirmisher | 278 | 37.3% | 52.2% | -14.5 pts | -29% | -4.6 | -0.089 |
| Sicilians | Spearman | 433 | 39.7% | 54.0% | -14.4 pts | -29% | -5.3 | -0.113 |
| Huns | Spearman | 442 | 43.5% | 57.7% | -14.1 pts | -28% | -5.5 | -0.095 |
| Cumans | Spearman | 377 | 39.5% | 54.6% | -13.8 pts | -28% | -5.0 | -0.096 |
| Teutons | Skirmisher | 458 | 44.6% | 57.3% | -12.5 pts | -25% | -5.0 | -0.100 |

For comparison, the biggest whole-game numbers (contaminated by the age effect; many shrink a lot under the strict test):

| Civ | Unit | Games (massed) | Win rate massed | Win rate barely used | Uplift | Relative | z | Correlation r |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Celts | Woad Raider | 1,494 | 62.0% | 43.5% | +18.5 pts | +37% | +11.0 | +0.172 |
| Turks | Scout Cavalry | 3,973 | 54.8% | 40.1% | +18.4 pts | +37% | +9.5 | +0.098 |
| Italians | Scout Cavalry | 1,151 | 58.9% | 41.3% | +18.3 pts | +37% | +9.6 | +0.136 |
| Franks | Knight | 11,812 | 58.6% | 41.1% | +17.4 pts | +35% | +9.6 | +0.175 |
| Vikings | Berserk | 1,001 | 66.2% | 50.5% | +17.3 pts | +35% | +9.7 | +0.110 |
| Vietnamese | Scout Cavalry | 616 | 58.8% | 42.9% | +17.0 pts | +34% | +7.6 | +0.100 |
| Portuguese | Scout Cavalry | 705 | 61.4% | 44.9% | +16.4 pts | +33% | +7.9 | +0.110 |
| Mongols | Scout Cavalry | 5,976 | 56.7% | 41.5% | +16.4 pts | +33% | +15.7 | +0.106 |
| Chinese | Knight | 1,883 | 60.4% | 44.9% | +16.1 pts | +32% | +10.9 | +0.126 |
| Goths | Huskarl | 2,250 | 59.2% | 43.9% | +15.4 pts | +31% | +9.8 | +0.129 |

### Army vs army (whole-game share >= 40%, win rate of the first side)

| Matchup | Whole game | Imperial test | Castle-age test |
|---|--:|--:|--:|
| Champions vs Arbalesters | 58.8% (4,906) | 58.9% (2,128) | 53.8% (1,808) |
| Knights/Paladins vs Spearmen/Halberdiers | 65.1% (31,252) | 61.8% (22,238) | 57.9% (22,080) |
| Hussars vs Spearmen/Halberdiers | 57.7% (19,038) | 56.9% (16,860) | 55.2% (2,128) |
| Champions vs Knights/Paladins | 56.2% (1,360) | 62.4% (780) | 53.0% (802) |
| Arbalesters vs Knights/Paladins | 37.2% (28,132) | 40.5% (10,792) | 43.3% (20,132) |

## How well the model matches real games

The stats model was checked against real army-vs-army results. Equal-resource fights and kiting, which I added earlier, fit badly; fights at roughly equal unit counts with a small cost weight fit well, in both the Imperial and Castle-age tests.

| Model version | Correlation (Imperial test) | Same winner | Correlation (Castle-age test) | Same winner |
|---|--:|--:|--:|--:|
| earlier model (equal-resource, 75% kiting) | 0.40 | 19/30 | 0.19 | 14/22 |
| equal-resource, no kiting | 0.45 | 19/30 | 0.15 | 13/22 |
| blend (k=1), no kiting | 0.61 | 17/30 | 0.49 | 14/22 |
| used (cost weight k=0.25, no kiting) | 0.66 | 21/30 | 0.62 | 17/22 |
| equal unit counts (k=0), no kiting | 0.67 | 22/30 | 0.64 | 17/22 |

For single civ-unit pairs, the model score correlates r = 0.54 with the strict-test uplift (230 pairs).

## Top 30 overall

*Expected uplift* = win-rate points the civ gains from making this unit the core of its army, blending the strict-test result with the model's prediction (weighted by how many games exist).

| # | Civ | Unit | Expected uplift | Real games (Castle-age test): win rate massed vs barely used | Model score | Stats (fully upgraded) | Cost | Civ bonuses used |
|--:|---|---|--:|---|--:|---|---|---|
| 1 | Celts | Elite Woad Raider | +9.1 pts | 57.0% vs 45.4% (n=575) | 0.26 | 85 HP, 19 atk, 3/5 arm, rng 0 | 70F 25G | Infantry moves +5/10/15/20% faster |
| 2 | Romans | Cavalier | +8.6 pts | 58.0% vs 46.0% (n=473) | 0.34 | 140 HP, 16 atk, 5/6 arm, rng 0 | 60F 75G | Infantry armor upgrade effects are doubled |
| 3 | Khmer | Cavalier | +8.3 pts | 50.7% vs 41.0% (n=2,623) | 0.34 | 140 HP, 16 atk, 5/6 arm, rng 0 | 60F 75G | - |
| 4 | Slavs | Cavalier | +8.2 pts | 53.6% vs 43.6% (n=1,557) | 0.34 | 140 HP, 16 atk, 5/6 arm, rng 0 | 60F 75G | - |
| 5 | Sicilians | Cavalier | +8.2 pts | 54.6% vs 44.5% (n=1,286) | 0.46 | 140 HP, 16 atk, 6/8 arm, rng 0 | 60F 75G | Soldiers receive -40% bonus damage; Hauberk |
| 6 | Malians | Cavalier | +7.9 pts | 55.8% vs 47.2% (n=2,262) | 0.43 | 140 HP, 19 atk, 5/6 arm, rng 0 | 60F 75G | Farimba |
| 7 | Chinese | Cavalier | +7.7 pts | 56.9% vs 47.9% (n=1,310) | 0.34 | 140 HP, 16 atk, 5/6 arm, rng 0 | 60F 75G | - |
| 8 | Lithuanians | Paladin | +7.2 pts | 52.2% vs 44.7% (n=3,585) | 0.54 | 180 HP, 20 atk, 5/7 arm, rng 0 | 60F 75G | Each garrisoned Relic provides +1 attack |
| 9 | Spanish | Paladin | +7.2 pts | 54.3% vs 46.6% (n=1,248) | 0.51 | 180 HP, 18 atk, 5/7 arm, rng 0 | 60F 75G | - |
| 10 | Franks | Paladin | +7.2 pts | 55.7% vs 47.2% (n=6,551) | 0.54 | 192 HP, 18 atk, 5/7 arm, rng 0 | 60F 75G | Mounted Units +20% HP |
| 11 | Mongols | Elite Steppe Lancer | +6.9 pts | 53.5% vs 46.1% (n=2,817) | 0.16 | 124 HP, 15 atk, 2/4 arm, rng 1 | 70F 40G | Scout Cavalry-line and Steppe Lancers +20/30% HP |
| 12 | Turks | Cavalier | +6.4 pts | 55.7% vs 48.8% (n=506) | 0.34 | 140 HP, 16 atk, 5/6 arm, rng 0 | 60F 75G | - |
| 13 | Teutons | Paladin | +6.4 pts | 56.3% vs 48.9% (n=2,766) | 0.51 | 180 HP, 18 atk, 7/7 arm, rng 0 | 60F 75G | Infantry and Mounted Units +1/+2 melee armor |
| 14 | Portuguese | Cavalier | +6.3 pts | 53.0% vs 45.9% (n=1,481) | 0.36 | 140 HP, 16 atk, 5/6 arm, rng 0 | 60F 60G | All units cost -20% gold |
| 15 | Hindustanis | Elite Ghulam † | +6.3 pts | 59.2% vs 51.3% (n=902) | 0.18 | 70 HP, 15 atk, 2/8 arm, rng 0 | 30F 45G | - |
| 16 | Vietnamese | Cavalier | +6.3 pts | 53.1% vs 45.6% (n=556) | 0.29 | 140 HP, 14 atk, 5/6 arm, rng 0 | 60F 75G | - |
| 17 | Italians | Cavalier | +6.2 pts | 49.8% vs 42.3% (n=690) | 0.34 | 140 HP, 16 atk, 5/6 arm, rng 0 | 60F 75G | - |
| 18 | Turks | Hussar | +6.0 pts | 55.4% vs 48.6% (n=839) | 0.06 | 95 HP, 11 atk, 3/7 arm, rng 0 | 80F | Scout Cavalry-line +1 pierce armor |
| 19 | Tatars | Heavy Cavalry Archer | +5.8 pts | 53.3% vs 46.1% (n=1,882) | -0.10 | 80 HP, 11 atk, 6/7 arm, rng 7 | 60G 40W | Silk Armor |
| 20 | Poles | Cavalier | +5.6 pts | 55.1% vs 48.3% (n=1,594) | 0.32 | 140 HP, 16 atk, 4/4 arm, rng 0 | 60F 30G | Szlachta Privileges |
| 21 | Huns | Heavy Cavalry Archer | +5.4 pts | 57.7% vs 51.1% (n=2,268) | -0.19 | 80 HP, 11 atk, 4/4 arm, rng 7 | 48G 32W | Cavalry Archers cost -10/20% |
| 22 | Cumans | Paladin | +5.3 pts | 55.6% vs 50.3% (n=1,249) | 0.52 | 180 HP, 18 atk, 5/7 arm, rng 0 | 60F 75G | Mounted Units move +5/10/15% faster |
| 23 | Gurjaras | Elite Shrivamsha Rider † | +5.1 pts | 54.0% vs 46.9% (n=1,192) | 0.04 | 90 HP, 13 atk, 3/5 arm, rng 0 | 52.5F 30G | Mounted Units deal +20/30/40% bonus damage; Kshatriyas |
| 24 | Japanese | Cavalier | +5.1 pts | 52.1% vs 45.6% (n=523) | 0.27 | 140 HP, 16 atk, 4/4 arm, rng 0 | 60F 75G | - |
| 25 | Burmese | Cavalier | +5.1 pts | 51.8% vs 46.2% (n=1,025) | 0.38 | 140 HP, 16 atk, 5/6 arm, rng 0 | 60F 75G | Manipur Cavalry |
| 26 | Aztecs | Elite Eagle Warrior | +5.0 pts | 51.2% vs 45.5% (n=1,700) | 0.19 | 60 HP, 17 atk, 3/8 arm, rng 0 | 20F 50G | Garland Wars |
| 27 | Burmese | Champion | +4.7 pts | 55.3% vs 47.7% (n=187) | 0.23 | 70 HP, 21 atk, 4/6 arm, rng 0 | 50F 20G | Infantry +1/+2/+3 attack |
| 28 | Bulgarians | Cavalier | +4.7 pts | 54.7% vs 49.6% (n=1,586) | 0.45 | 140 HP, 16 atk, 5/6 arm, rng 0 | 60F 75G | Stirrups |
| 29 | Byzantines | Elite Cataphract † | +4.5 pts | 54.8% vs 49.8% (n=234) | 0.48 | 150 HP, 14 atk, 5/5 arm, rng 0 | 70F 75G | - |
| 30 | Mayans | Elite Eagle Warrior | +4.5 pts | 53.0% vs 48.2% (n=1,457) | 0.28 | 100 HP, 13 atk, 3/8 arm, rng 0 | 20F 50G | Holcans |

† ability with no numbers in the game data, not modelled: Elite Ghulam (pierces multiple targets); Elite Shrivamsha Rider (dodges projectiles); Elite Cataphract (trample (with Logistica)).

## Best units by role (top 8 each)

### Infantry

| # | Civ | Unit | Expected uplift | Real games (Castle-age test): win rate massed vs barely used | Model score | Stats (fully upgraded) | Cost | Civ bonuses used |
|--:|---|---|--:|---|--:|---|---|---|
| 1 | Celts | Elite Woad Raider | +9.1 pts | 57.0% vs 45.4% (n=575) | 0.26 | 85 HP, 19 atk, 3/5 arm, rng 0 | 70F 25G | Infantry moves +5/10/15/20% faster |
| 15 | Hindustanis | Elite Ghulam † | +6.3 pts | 59.2% vs 51.3% (n=902) | 0.18 | 70 HP, 15 atk, 2/8 arm, rng 0 | 30F 45G | - |
| 26 | Aztecs | Elite Eagle Warrior | +5.0 pts | 51.2% vs 45.5% (n=1,700) | 0.19 | 60 HP, 17 atk, 3/8 arm, rng 0 | 20F 50G | Garland Wars |
| 27 | Burmese | Champion | +4.7 pts | 55.3% vs 47.7% (n=187) | 0.23 | 70 HP, 21 atk, 4/6 arm, rng 0 | 50F 20G | Infantry +1/+2/+3 attack |
| 30 | Mayans | Elite Eagle Warrior | +4.5 pts | 53.0% vs 48.2% (n=1,457) | 0.28 | 100 HP, 13 atk, 3/8 arm, rng 0 | 20F 50G | Holcans |
| 38 | Malay | Elite Karambit Warrior † | +4.2 pts | 52.1% vs 46.1% (n=482) | -0.22 | 40 HP, 12 atk, 4/5 arm, rng 0 | 25F 15G | - |
| 39 | Vikings | Elite Berserk † | +4.0 pts | 56.5% vs 51.4% (n=305) | 0.23 | 74 HP, 18 atk, 5/5 arm, rng 0 | 65F 20G | Infantry +20% HP; Chieftains |
| 47 | Slavs | Champion | +3.9 pts | 54.5% vs 49.1% (n=321) | 0.19 | 70 HP, 18 atk, 4/6 arm, rng 0 | 50F 20G | - |

### Cavalry & camels

| # | Civ | Unit | Expected uplift | Real games (Castle-age test): win rate massed vs barely used | Model score | Stats (fully upgraded) | Cost | Civ bonuses used |
|--:|---|---|--:|---|--:|---|---|---|
| 2 | Romans | Cavalier | +8.6 pts | 58.0% vs 46.0% (n=473) | 0.34 | 140 HP, 16 atk, 5/6 arm, rng 0 | 60F 75G | Infantry armor upgrade effects are doubled |
| 3 | Khmer | Cavalier | +8.3 pts | 50.7% vs 41.0% (n=2,623) | 0.34 | 140 HP, 16 atk, 5/6 arm, rng 0 | 60F 75G | - |
| 4 | Slavs | Cavalier | +8.2 pts | 53.6% vs 43.6% (n=1,557) | 0.34 | 140 HP, 16 atk, 5/6 arm, rng 0 | 60F 75G | - |
| 5 | Sicilians | Cavalier | +8.2 pts | 54.6% vs 44.5% (n=1,286) | 0.46 | 140 HP, 16 atk, 6/8 arm, rng 0 | 60F 75G | Soldiers receive -40% bonus damage; Hauberk |
| 6 | Malians | Cavalier | +7.9 pts | 55.8% vs 47.2% (n=2,262) | 0.43 | 140 HP, 19 atk, 5/6 arm, rng 0 | 60F 75G | Farimba |
| 7 | Chinese | Cavalier | +7.7 pts | 56.9% vs 47.9% (n=1,310) | 0.34 | 140 HP, 16 atk, 5/6 arm, rng 0 | 60F 75G | - |
| 8 | Lithuanians | Paladin | +7.2 pts | 52.2% vs 44.7% (n=3,585) | 0.54 | 180 HP, 20 atk, 5/7 arm, rng 0 | 60F 75G | Each garrisoned Relic provides +1 attack |
| 9 | Spanish | Paladin | +7.2 pts | 54.3% vs 46.6% (n=1,248) | 0.51 | 180 HP, 18 atk, 5/7 arm, rng 0 | 60F 75G | - |

### Elephants

| # | Civ | Unit | Expected uplift | Real games (Castle-age test): win rate massed vs barely used | Model score | Stats (fully upgraded) | Cost | Civ bonuses used |
|--:|---|---|--:|---|--:|---|---|---|
| 33 | Persians | Elite War Elephant † | +4.3 pts | model only | 0.57 | 620 HP, 24 atk, 4/7 arm, rng 0 | 170F 85G | - |
| 44 | Bengalis | Elite Battle Elephant | +4.0 pts | model only | 0.52 | 320 HP, 18 atk, 4/7 arm, rng 0 | 100F 70G | Cavalry +2 attack vs. Skirmishers; Elephant Units receive -25% bonus damage; Paiks |
| 45 | Burmese | Elite Battle Elephant | +3.9 pts | model only | 0.51 | 320 HP, 18 atk, 6/9 arm, rng 0 | 100F 70G | Battle Elephants +1 melee/+1 pierce armor; Howdah; Manipur Cavalry |
| 46 | Khmer | Elite Battle Elephant | +3.9 pts | model only | 0.51 | 320 HP, 21 atk, 4/7 arm, rng 0 | 100F 70G | Battle Elephants move +10% faster; Tusk Swords |
| 49 | Vietnamese | Elite Battle Elephant | +3.7 pts | model only | 0.49 | 420 HP, 16 atk, 4/7 arm, rng 0 | 100F 70G | Chatras |
| 67 | Dravidians | Battle Elephant | +2.9 pts | model only | 0.38 | 250 HP, 16 atk, 3/4 arm, rng 0 | 100F 70G | Wootz Steel |
| 155 | Malay | Elite Battle Elephant | +1.0 pts | 48.6% vs 47.9% (n=190) | 0.42 | 300 HP, 18 atk, 2/4 arm, rng 0 | 65F 45.5G | Battle Elephants cost -25/35% |

### Foot archers, skirmishers & gunpowder

| # | Civ | Unit | Expected uplift | Real games (Castle-age test): win rate massed vs barely used | Model score | Stats (fully upgraded) | Cost | Civ bonuses used |
|--:|---|---|--:|---|--:|---|---|---|
| 40 | Britons | Elite Longbowman | +4.0 pts | 52.1% vs 45.7% (n=429) | -0.42 | 40 HP, 11 atk, 3/5 arm, rng 12 | 40G 35W | Foot Archers +1/+2 range; Yeomen |
| 71 | Saracens | Arbalester | +2.8 pts | 46.1% vs 41.6% (n=1,711) | -0.50 | 40 HP, 10 atk, 3/4 arm, rng 8 | 45G 25W | - |
| 79 | Koreans | Arbalester | +2.4 pts | 46.6% vs 42.5% (n=1,319) | -0.48 | 40 HP, 10 atk, 3/4 arm, rng 8 | 45G 12.5W | Ranged Soldiers and Infantry cost -50% wood |
| 101 | Vietnamese | Imperial Skirmisher | +1.7 pts | 50.9% vs 46.7% (n=343) | -0.55 | 42 HP, 8 atk, 3/9 arm, rng 8 | 25F 35W | Foot Archers and Skirmishers +20% HP |
| 119 | Koreans | Elite Skirmisher | +1.4 pts | 50.3% vs 44.1% (n=240) | -0.72 | 35 HP, 7 atk, 3/8 arm, rng 8 | 25F 17.5W | Ranged Soldiers and Infantry cost -50% wood |
| 128 | Goths | Crossbowman | +1.3 pts | 57.0% vs 52.1% (n=268) | -0.78 | 35 HP, 9 atk, 3/4 arm, rng 8 | 45G 25W | - |
| 152 | Bohemians | Hand Cannoneer | +1.1 pts | 49.7% vs 47.7% (n=314) | -0.34 | 40 HP, 17 atk, 4/4 arm, rng 7 | 45F 50G | Wagenburg Tactics |
| 167 | Britons | Arbalester | +0.9 pts | 46.8% vs 44.4% (n=3,619) | -0.54 | 40 HP, 10 atk, 3/4 arm, rng 11 | 45G 25W | Foot Archers +1/+2 range; Yeomen |

### Mounted archers

| # | Civ | Unit | Expected uplift | Real games (Castle-age test): win rate massed vs barely used | Model score | Stats (fully upgraded) | Cost | Civ bonuses used |
|--:|---|---|--:|---|--:|---|---|---|
| 19 | Tatars | Heavy Cavalry Archer | +5.8 pts | 53.3% vs 46.1% (n=1,882) | -0.10 | 80 HP, 11 atk, 6/7 arm, rng 7 | 60G 40W | Silk Armor |
| 21 | Huns | Heavy Cavalry Archer | +5.4 pts | 57.7% vs 51.1% (n=2,268) | -0.19 | 80 HP, 11 atk, 4/4 arm, rng 7 | 48G 32W | Cavalry Archers cost -10/20% |
| 59 | Mongols | Elite Mangudai | +3.2 pts | 50.1% vs 46.6% (n=2,802) | -0.07 | 80 HP, 12 atk, 4/4 arm, rng 7 | 65G 55W | Cavalry Archers attack +25% faster |
| 62 | Vietnamese | Heavy Cavalry Archer | +3.1 pts | 53.2% vs 47.0% (n=291) | -0.23 | 80 HP, 11 atk, 4/4 arm, rng 7 | 60G 40W | - |
| 121 | Gurjaras | Elite Elephant Archer | +1.4 pts | model only | 0.18 | 300 HP, 11 atk, 6/4 arm, rng 7 | 45F 80G | Mounted Units deal +20/30/40% bonus damage; Kshatriyas; Frontier Guards |
| 151 | Bengalis | Elite Ratha † | +1.1 pts | 48.7% vs 46.2% (n=176) | -0.08 | 135 HP, 10 atk, 6/7 arm, rng 4 | 60G 60W | Paiks |
| 158 | Japanese | Heavy Cavalry Archer | +1.0 pts | 49.6% vs 47.5% (n=243) | -0.12 | 80 HP, 11 atk, 5/6 arm, rng 7 | 60G 40W | Cavalry Archers +2 attack vs. Ranged Soldiers |
| 170 | Magyars | Heavy Cavalry Archer | +0.8 pts | 50.7% vs 50.0% (n=1,805) | -0.03 | 80 HP, 12 atk, 5/6 arm, rng 8 | 60G 40W | Recurve Bow |

## Best unit for every civ (top 2)

| Civ | #1 unit | Expected uplift | Evidence | #2 unit | Expected uplift |
|---|---|--:|---|---|--:|
| Armenians | Champion (#82) | +2.3 pts | model only | Cavalier (#91) | +2.1 pts |
| Aztecs | Elite Eagle Warrior (#26) | +5.0 pts | real games | Elite Jaguar Warrior (#202) | +0.0 pts |
| Bengalis | Elite Battle Elephant (#44) | +4.0 pts | model only | Light Cavalry (#63) | +3.1 pts |
| Berbers | Cavalier (#78) | +2.4 pts | real games | Heavy Camel Rider (#81) | +2.3 pts |
| Bohemians | Cavalier (#106) | +1.6 pts | model only | Champion (#140) | +1.2 pts |
| Britons | Elite Longbowman (#40) | +4.0 pts | real games | Champion (#162) | +0.9 pts |
| Bulgarians | Cavalier (#28) | +4.7 pts | real games | Elite Konnik (#35) | +4.3 pts |
| Burgundians | Paladin (#37) | +4.2 pts | real games | Champion (#141) | +1.2 pts |
| Burmese | Cavalier (#25) | +5.1 pts | real games | Champion (#27) | +4.7 pts |
| Byzantines | Elite Cataphract (#29) | +4.5 pts | real games | Elite Varangian Guard (#98) | +1.8 pts |
| Celts | Elite Woad Raider (#1) | +9.1 pts | real games | Halberdier (#210) | -0.4 pts |
| Chinese | Cavalier (#7) | +7.7 pts | real games | Elite Fire Lancer (#110) | +1.6 pts |
| Cumans | Paladin (#22) | +5.3 pts | real games | Elite Steppe Lancer (#32) | +4.3 pts |
| Danes | Elite Varangian Guard (#87) | +2.1 pts | model only | Elite Jomsviking (#93) | +1.9 pts |
| Dravidians | Battle Elephant (#67) | +2.9 pts | model only | Champion (#84) | +2.3 pts |
| Ethiopians | Elite Shotel Warrior (#80) | +2.4 pts | real games | Heavy Camel Rider (#126) | +1.4 pts |
| Franks | Paladin (#10) | +7.2 pts | real games | Light Cavalry (#103) | +1.6 pts |
| Georgians | Elite Monaspa (#65) | +3.0 pts | model only | Cavalier (#74) | +2.6 pts |
| Goths | Elite Huskarl (#58) | +3.4 pts | real games | Crossbowman (#128) | +1.3 pts |
| Gurjaras | Elite Shrivamsha Rider (#23) | +5.1 pts | real games | Heavy Camel Rider (#75) | +2.6 pts |
| Hindustanis | Elite Ghulam (#15) | +6.3 pts | real games | Imperial Camel Rider (#54) | +3.4 pts |
| Huns | Heavy Cavalry Archer (#21) | +5.4 pts | real games | Elite Tarkan (#57) | +3.4 pts |
| Incas | Elite Kamayuk (#86) | +2.2 pts | real games | Elite Champi Warrior (#105) | +1.6 pts |
| Italians | Cavalier (#17) | +6.2 pts | real games | Condottiero (#124) | +1.4 pts |
| Japanese | Cavalier (#24) | +5.1 pts | real games | Elite Samurai (#55) | +3.4 pts |
| Jurchens | Elite Iron Pagoda (#48) | +3.7 pts | model only | Elite Steppe Lancer (#96) | +1.8 pts |
| Khitans | Elite Fire Lancer (#97) | +1.8 pts | model only | Heavy Camel Rider (#107) | +1.6 pts |
| Khmer | Cavalier (#3) | +8.3 pts | real games | Elite Battle Elephant (#46) | +3.9 pts |
| Koreans | Arbalester (#79) | +2.4 pts | real games | Elite Skirmisher (#119) | +1.4 pts |
| Lithuanians | Paladin (#8) | +7.2 pts | real games | Elite Leitis (#138) | +1.2 pts |
| Magyars | Paladin (#51) | +3.7 pts | real games | Hussar (#72) | +2.7 pts |
| Malay | Elite Karambit Warrior (#38) | +4.2 pts | real games | Cavalier (#135) | +1.2 pts |
| Malians | Cavalier (#6) | +7.9 pts | real games | Light Cavalry (#42) | +4.0 pts |
| Mapuche | Elite Kona (#94) | +1.9 pts | model only | Elite Champi Warrior (#112) | +1.5 pts |
| Mayans | Elite Eagle Warrior (#30) | +4.5 pts | real games | Two-Handed Swordsman (#181) | +0.6 pts |
| Mongols | Elite Steppe Lancer (#11) | +6.9 pts | real games | Hussar (#31) | +4.5 pts |
| Muisca | Elite Temple Guard (#83) | +2.3 pts | model only | Elite Champi Warrior (#132) | +1.3 pts |
| Persians | Elite War Elephant (#33) | +4.3 pts | model only | Savar (#36) | +4.3 pts |
| Poles | Cavalier (#20) | +5.6 pts | real games | Champion (#146) | +1.2 pts |
| Portuguese | Cavalier (#14) | +6.3 pts | real games | Champion (#122) | +1.4 pts |
| Romans | Cavalier (#2) | +8.6 pts | real games | Elite Centurion (#41) | +4.0 pts |
| Saracens | Elite Mameluke (#43) | +4.0 pts | real games | Knight (#61) | +3.2 pts |
| Saxons | Elite Varangian Guard (#92) | +1.9 pts | model only | Cavalier (#111) | +1.6 pts |
| Shu | Heavy Hei Guang Cavalry (#130) | +1.3 pts | model only | Elite White Feather Guard (#154) | +1.1 pts |
| Sicilians | Cavalier (#5) | +8.2 pts | real games | Champion (#109) | +1.6 pts |
| Slavs | Cavalier (#4) | +8.2 pts | real games | Champion (#47) | +3.9 pts |
| Spanish | Paladin (#9) | +7.2 pts | real games | Champion (#118) | +1.5 pts |
| Tatars | Heavy Cavalry Archer (#19) | +5.8 pts | real games | Elite Keshik (#60) | +3.2 pts |
| Teutons | Paladin (#13) | +6.4 pts | real games | Halberdier (#165) | +0.9 pts |
| Tupi | Elite Champi Warrior (#131) | +1.3 pts | model only | Elite Ibirapema Warrior (#163) | +0.9 pts |
| Turks | Cavalier (#12) | +6.4 pts | real games | Hussar (#18) | +6.0 pts |
| Varangians | Cavalier (#68) | +2.9 pts | model only | Elite Varangian Guard (#76) | +2.4 pts |
| Vietnamese | Cavalier (#16) | +6.3 pts | real games | Elite Battle Elephant (#49) | +3.7 pts |
| Vikings | Elite Berserk (#39) | +4.0 pts | real games | Cavalier (#50) | +3.7 pts |
| Wei | Elite Tiger Cavalry (#52) | +3.6 pts | model only | Heavy Hei Guang Cavalry (#53) | +3.6 pts |
| Wu | Heavy Hei Guang Cavalry (#64) | +3.0 pts | model only | Champion (#149) | +1.2 pts |

## Limits - read before quoting

- **Correlation, not proof.** Even the strict test cannot separate a unit's effect from the skill and plans of the players who choose it. It removes the biggest artifact (winning causes late-game unit mixes), not all of them.
- **Smaller samples at 1200+.** The strict test has 72,446 games; 230 of 492 rows have enough games to use, the rest are model-only. Unique units that appear mainly in the Imperial Age are least covered.
- **Old data.** The newest unit-level data is from Feb 2024 and the rest from 2023; balance, units and civs have changed since. 11 civs (Danes, Jurchens, Khitans, Mapuche, Muisca, Saxons, Shu, Tupi, Varangians, Wei, Wu) are absent, so their rows are model-only.
- **Production lines, not final forms.** 'Knight' covers Knight/Cavalier/Paladin, 'militia' the Champion line, and so on; the data's 'camel scout' label is wrong and is not used. Shares count units, not resources.
- **How much the choices matter.** Without the real-game evidence the top 20 would overlap this one in 4/20 places; using the Imperial or whole-game evidence instead of the strict test would keep 2/20 and 6/20; gold/stone at 1.0x or 2.0x and a zero cost weight keep 10, 10 and 10 of the top 10.
- Not modelled: abilities with no numbers in the game data (flagged †), production speed, economy, team bonuses, siege, ships, monks, heroes.
- Full tables: `winrate-by-unit-full.json` (every civ-unit result for all three tests and both windows) and `unit-ranking-full.json` (every row, matchups, bonuses applied).
