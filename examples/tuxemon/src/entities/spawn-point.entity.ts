import { Entity } from 'excalibur';
import { PrpgSpawnPointComponent } from '../components';
import { SpawnPointType } from '../types';

export const newSpawnPointEntity = (spawnType: SpawnPointType, x: number, y: number, z: number) => {
  return new Entity([new PrpgSpawnPointComponent(spawnType, x, y, z)]);
};