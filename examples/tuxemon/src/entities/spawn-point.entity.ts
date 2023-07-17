import { Entity } from 'excalibur';
import { PrpgSpawnPointComponent } from '../components';
import { SpawnPointState } from '../types';

export const newSpawnPointEntity = (data: Partial<SpawnPointState> & Pick<SpawnPointState, 'sceneName' | 'entityName'>) => {
  return new Entity([new PrpgSpawnPointComponent(data)]);
};