import { Scene, Logger, Query } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import { PrpgCharacterSystem, PrpgPlayerSystem, PrpgTeleporterSystem, PrpgMapSystem } from '../systems';
import { newMapEntity } from '../entities';
import { PrpgMapComponent } from '../components';
import { PrpgComponentType } from '../types';
import type { GameOptions } from '../types';

// enum ActivationTrigger {
//   NEW_GAME,
//   LOAD_GAME,
//   TELEPORT
// }
// interface MapSceneActivationSettings {
//   trigger: ActivationTrigger;
// }

export class MapScene extends Scene {

  public logger = Logger.getInstance();
  private mapQuery: Query<PrpgMapComponent>;

  // private activationSettings: MapSceneActivationSettings = {
  //   trigger: ActivationTrigger.NEW_GAME
  // }

  constructor(map: TiledMapResource, name: string, protected readonly gameOptions: GameOptions) {
    super();
    this.world.add(newMapEntity(map, name));
    this.mapQuery = this.world.queryManager.createQuery([PrpgComponentType.TILED_MAP]);;
  }

  public onInitialize() {
    this.world.add(new PrpgMapSystem(this.gameOptions));
    this.world.add(new PrpgCharacterSystem());
    this.world.add(new PrpgPlayerSystem(this.gameOptions));
    this.world.add(new PrpgTeleporterSystem(this.gameOptions));
  }

  getMap() {
    const entities = this.mapQuery.getEntities();
    for (const entity of entities) {
      const tiledMap = entity.get(PrpgMapComponent);
      return tiledMap;
      break;
    }
  }
}