# TODO

## General
 * Make use of `game.screen.applyResolutionAndViewport()`?
 * Implement a blueprint to create different entities with components
## Multiplayer
 * Implement a consistent randomizer across all players, for example, using a shared game state (e.g., game time calculated based on the start time of the first player or a game ID).

## Menu
* Implement a MenuRenderSystem and make use of the MenuComponent and MenuItemComponent
* Make use of the blueprint to load a menu from json
* Make use of the ark sprite font(s)
* Control the menu with the ControllableComponent and the InputSystem

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

// Instantiate the random number generator with the current time as the seed
const randomizer = new Randomizer();

// Generate a random number
const randomNumber = randomizer.next();
```