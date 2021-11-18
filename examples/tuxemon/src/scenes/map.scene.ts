import { Scene, Logger, Entity, Query } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled/src/index';
import { PrpgCharacterSystem } from '../systems/character.system';
import { PrpgPlayerSystem } from '../systems/player.system';
import { PrpgTeleporterSystem } from '../systems/teleporter.system';
import { PrpgTiledMapSystem } from '../systems/tiled-map.system';
import { PrpgPlayerActor } from '../actors/player.actor';
import { resources } from '../resources';
import { PrpgComponentType } from '../types/component-type';
import { newTiledMapEntity } from '../entities/tiled-map.entity';
import { PrpgTiledMapComponent } from '../components/tiled-map.component';

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

    const player = new PrpgPlayerActor(resources.sprites.scientist);
    this.add(player);
  }

  getMap() {
    const entities = this.mapQuery.getEntities();
    this.logger.debug('Map entities', entities);
    for (const entity of entities) {
      const tiledMap = entity.get(PrpgTiledMapComponent);
      return tiledMap;
    }
  }

  public onActivate(_oldScene: Scene, _newScene: Scene): void {
    //

  }
}