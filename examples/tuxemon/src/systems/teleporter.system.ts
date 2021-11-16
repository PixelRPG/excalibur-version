import { System, SystemType, Logger, Entity, BodyComponent} from 'excalibur';
import { PrpgTeleporterComponent, PRPG_CHARACTER_TYPE } from '../components/teleporter.component';
import { PrpgPlayerComponent } from '../components/player.component';
import { PrpgTeleportActor } from '../actors/teleport.actor';
import { PrpgPlayerActor } from '../actors/player.actor';
import { MapScene } from '../scenes/map.scene';

export class PrpgTeleporterSystem extends System<
PrpgTeleporterComponent> {
    public readonly types = [PRPG_CHARACTER_TYPE] as const;
    public priority = 0;
    public systemType = SystemType.Update;
    private scene: MapScene;
    private logger = Logger.getInstance();

    constructor() {
      super();
    }

    public initialize?(scene: MapScene) {
      this.logger.debug('[PrpgTeleporterSystem] initialize');
      this.scene = scene;
      const teleporterQuery = this.scene.world.queryManager.createQuery<PrpgTeleporterComponent>([PRPG_CHARACTER_TYPE]);

      const entities = teleporterQuery.getEntities() as Entity[];
      for (const entity of entities) {
        entity.on('precollision', (event) => {
          if (event.other instanceof PrpgPlayerActor) {
            this._onTeleport(event.target, event.other);
          }
        });
      }
    }

    protected _onTeleport(targetEntity: Entity, playerEntity: Entity) {
      const teleporter = targetEntity.get(PrpgTeleporterComponent);
      const body = playerEntity.get(BodyComponent);
      // this.logger.debug('teleporter', teleporter);
      if (!teleporter) {
        throw new Error('Teleporter component for targetEntity not found!');
      }

      this.scene.engine.goToScene(teleporter.map);
      console.debug('TODO move body', body);
    }

    public update(entities: Entity[], delta: number) {
      //
    }
}