export enum MultiplayerEventType {
    /** A message to the other player, e.g. to ask for the full state */
    MESSAGE = 'MESSAGE',
    /** Partial state updates */
    UPDATE = 'UPDATE',
    /** Full state updates */
    STATE = 'STATE',
}