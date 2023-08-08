import { GameEvent } from 'excalibur';
import { GameState, MultiplayerEventType, MultiplayerEvent } from '../types';

/**
 * Use this event to send full state updates to other players.
 */
export class GameStateFullEvent extends GameEvent<undefined> implements MultiplayerEvent {
  public type = MultiplayerEventType.STATE;
  constructor(public state: GameState) {
    super();
  }
}