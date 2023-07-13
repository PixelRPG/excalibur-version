import { Entity } from 'excalibur';
import { PrpgSpawnPointComponent } from '../components';
import { SpawnPoint } from '../types';

export const newSpawnPointEntity = (data: Partial<SpawnPoint> & Pick<SpawnPoint, 'mapScene' | 'entityName'>) => {
  return new Entity([new PrpgSpawnPointComponent(data)]);
};