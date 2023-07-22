# TODO
## Multiplayer

 * Consider possibly avoiding `valtio``, although its history, getVersion, and snapshot functions could be useful.
 * Mark changes in components by setting a `dirty` flag or using getVersion.
 * Transmit the full state entire component on changes.
 * Handle special cases for values that change frequently, such as player position (Dirty only after x pixels or change in direction).
 * Determine player positions, for example, through interpolation and prediction, and transmit them fully only at intervals (e.g., every 30 seconds).
 * Compress state using a library like https://github.com/msgpack/msgpack-javascript.
 * Implement a consistent randomizer across all players, for example, using a shared game state (e.g., game time calculated based on the start time of the first player or a game ID).

Examples:


```ts
class PositionComponent {
    x: number;
    y: number;
    dirty: boolean;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.dirty = true; // Anfangszustand wird als geändert betrachtet
    }

    setPosition(x: number, y: number) {
        if (this.x !== x || this.y !== y) {
            this.x = x;
            this.y = y;
            this.dirty = true;
        }
    }
}

```

```ts
class DeltaUpdateSystem {
    static createUpdate(entities: Entity[]): DeltaUpdate {
        let update = new DeltaUpdate();
        for (let entity of entities) {
            for (let component of entity.components) {
                if (component.dirty) {
                    update.recordChange(entity.id, component);
                    component.dirty = false; // Reset dirty flag after recording the change
                }
            }
        }
        return update;
    }
}
```


```ts
// Somewhere in your game loop...
let update = DeltaUpdateSystem.createUpdate(allEntities);
network.sendToAllPeers(update);
```


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