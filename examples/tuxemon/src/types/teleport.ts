import type { ActorArgs } from 'excalibur';

export interface Teleport extends Partial<ActorArgs> {
  /**
   * Map to teleport to
   */
  mapName: string;
  /**
   * Destination coordinates of a teleporter
   */
  spawnName: string;
}