import { Scene, Logger, Query } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled/src/index';
import { PrpgCharacterSystem, PrpgPlayerSystem, PrpgTeleporterSystem, PrpgTiledMapSystem } from '../systems';
import { PrpgComponentType } from '../types';
import { newTiledMapEntity } from '../entities';
import { PrpgTiledMapComponent } from '../components';

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
  private mapQuery: Query<PrpgTiledMapComponent>;

  // private activationSettings: MapSceneActivationSettings = {
  //   trigger: ActivationTrigger.NEW_GAME
  // }

  constructor(map: TiledMapResource, name: string) {
    super();
    this.world.add(newTiledMapEntity(map, name));
    this.mapQuery = this.world.queryManager.createQuery<PrpgTiledMapComponent>([PrpgComponentType.TILED_MAP]);;
  }

  public onInitialize() {
    this.world.add(new PrpgTiledMapSystem());
    this.world.add(new PrpgCharacterSystem());
    this.world.add(new PrpgPlayerSystem());
    this.world.add(new PrpgTeleporterSystem());
  }

  getMap() {
    const entities = this.mapQuery.getEntities();
    for (const entity of entities) {
      const tiledMap = entity.get(PrpgTiledMapComponent);
      return tiledMap;
    }
  }

  public onActivate(_oldScene: Scene, _newScene: Scene): void {
    //

  }
}