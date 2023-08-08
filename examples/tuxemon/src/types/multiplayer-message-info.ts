import type { MultiplayerMessageType } from './index';

export interface MultiplayerMessageInfo<I = any, T = MultiplayerMessageType> {
    type: T
    /** From which player the message is */
    from: string;
    /** For which player the message is, use `all` the send the message to all players or the player name */
    to?: string;
    /** Additional message data */
    data: I;
}