export interface PlayerComponentState {
  playerNumber: number;
}

export interface PlayerComponentUpdates {
  // No updates
}

export interface PlayerComponentArgs extends PlayerComponentState {
  isCurrentPlayer: boolean;
}