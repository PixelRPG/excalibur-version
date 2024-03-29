export interface TeleportComponentState {
  /**
   * Map to teleport to
   */
  mapName: string;
  /**
   * Destination coordinates of a teleport
   */
  spawnName: string;
}

export type TeleportComponentArgs = Partial<TeleportComponentState>;