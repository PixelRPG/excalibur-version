import { GameEvent } from 'excalibur';
import { MultiplayerMessageInfo, MultiplayerEventType, MultiplayerEvent, MultiplayerMessageType } from '../types';

/**
 * Use this event to send a message to the other players.
 */
export class GameMessageEvent<I = any, T = MultiplayerMessageType> extends GameEvent<undefined> implements MultiplayerEvent {
  public type = MultiplayerEventType.MESSAGE;
  constructor(public info: MultiplayerMessageInfo<I, T>) {
    super();
  }
}