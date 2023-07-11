import { Entity } from 'excalibur';
import { PrpgSpawnPointComponent } from '../components';
import { SpawnPointType, Direction } from '../types';

export const newSpawnPointEntity = (spawnType: SpawnPointType, x: number, y: number, z: number, direction = Direction.DOWN, entity: Entity) => {
  return new Entity([new PrpgSpawnPointComponent(spawnType, x, y, z, direction, entity)]);
};