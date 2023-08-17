import type { EngineEvents, GameEvent } from 'excalibur';
import type { GameStateFullEvent, GameStateUpdateEvent, GameMessageEvent } from '../events/index';
import type { MultiplayerMessageInfo, MultiplayerMessageType, TeleportMessage } from '../types/index';

export type PrpgEngineEvents = {
    /** Partial state updates */
    'multiplayer:update': GameStateUpdateEvent;
    /** Full state updates */
    'multiplayer:state': GameStateFullEvent;

    /** A message to the other players */
    'multiplayer:message': GameMessageEvent<MultiplayerMessageInfo<any>>;
    /** Ask the other players for the full state */
    'multiplayer:message:ask-for-full-state': GameMessageEvent<MultiplayerMessageInfo<undefined>>;
    /** Notify the other players about your teleport */
    'multiplayer:message:teleport': GameMessageEvent<TeleportMessage>;
} & EngineEvents;