import { Entity } from 'excalibur';
import { PrpgSpawnPointComponent } from '../components';
import { SpawnPointType, Direction } from '../types';

export const newSpawnPointEntity = (spawnType: SpawnPointType, x: number, y: number, z: number, direction = Direction.DOWMN) => {
  return new Entity([new PrpgSpawnPointComponent(spawnType, x, y, z, direction)]);
};