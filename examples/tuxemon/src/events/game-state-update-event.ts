import { GameEvent } from 'excalibur';
import { GameUpdates, MultiplayerEventType, MultiplayerEvent } from '../types';

/**
 * Use this event to send partial state updates to other players.
 */
export class GameStateUpdateEvent extends GameEvent<undefined> implements MultiplayerEvent {
  public type = MultiplayerEventType.UPDATE;
  constructor(public update: GameUpdates) {
    super();
  }
}