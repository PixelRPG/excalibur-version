import type { EngineEvents, GameEvent } from 'excalibur';
import type { GameState, GameUpdates } from '.';

export type PrpgEngineEvents = {
    update: GameEvent<Readonly<GameUpdates>>;
    state: GameEvent<Readonly<GameState>>;
} & EngineEvents;