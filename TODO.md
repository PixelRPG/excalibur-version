# TODO
## Multiplayer
 * Sync created / removed Entities
 * Transmit the full state entire component on relevant events.
 * Implement a consistent randomizer across all players, for example, using a shared game state (e.g., game time calculated based on the start time of the first player or a game ID).

Examples:

## Randomizer

```ts
class Randomizer {
    constructor(seed = Date.now()) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

// Instanziieren Sie den Zufallszahlengenerator mit der aktuellen Zeit als Seed
const randomizer = new Randomizer();

// Generieren Sie eine Zufallszahl
const randomNumber = randomizer.next();
```