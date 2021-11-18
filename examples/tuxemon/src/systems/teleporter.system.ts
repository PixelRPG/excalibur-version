import { System, SystemType, Logger, Entity, BodyComponent } from 'excalibur';
import { PrpgTeleporterComponent } from '../components/teleporter.component';
import { PrpgTiledMapComponent } from '../components/tiled-map.component';
import { newSpawnPointEntity } from '../entities/spawn-point.entity';
import { PrpgPlayerActor } from '../actors/player.actor';
import { MapScene } from '../scenes/map.scene';
import { PrpgComponentType } from '../types/component-type';
import { TiledObject } from '@excaliburjs/plugin-tiled/src';

export class PrpgTeleporterSystem extends System<
PrpgTeleporterComponent> {
    public readonly types = [PrpgComponentType.TELEPORTER] as const;
    public priority = 200;
    public systemType = SystemType.Update;
    private scene: MapScene;
    private logger = Logger.getInstance();

    constructor() {
      super();
    }

    public initialize?(scene: MapScene) {
      this.logger.debug('[PrpgTeleporterSystem] initialize');
      this.scene = scene;
      const teleporterQuery = this.scene.world.queryManager.createQuery<PrpgTeleporterComponent>([PrpgComponentType.TELEPORTER]);

      const entities = teleporterQuery.getEntities();
      this.logger.debug('Teleporter entities', entities);
      for (const entity of entities) {
        entity.on('precollision', (event) => {
          if (event.other instanceof PrpgPlayerActor) {
            this._onTeleport(event.target, event.other);
          }
        });
      }
    }

    protected _onTeleport(teleportEntity: Entity, playerEntity: Entity) {
      const teleporter = teleportEntity.get(PrpgTeleporterComponent);
      if (!teleporter) {
        this.logger.warn('Teleporter component for targetEntity not found!');
        return;
      }

      const targetMap = this.scene.engine.scenes[teleporter.mapName] as MapScene | undefined;
      if (!targetMap) {
        this.logger.warn('Teleporter target map not found!', teleporter.mapName);
        return;
      }

      const tiledMap = targetMap.getMap();
      if (!tiledMap) {
        this.logger.warn(`Teleport target map "${teleporter.mapName}" not found!`);
        return;
      }

      const tiledObjectGroups = tiledMap.map.data.getExcaliburObjects();
      if (!tiledObjectGroups?.length) {
        this.logger.warn('Map has no objects!');
        return;
      }
      let spawn: TiledObject | undefined;
      for (const tiledObjectGroup of tiledObjectGroups) {
        spawn = tiledObjectGroup.getObjectByName(teleporter.spawnName);
        if (spawn) {
          break;
        }
      }
      if (!spawn) {
        this.logger.warn(`Teleport target spawn point "${teleporter.spawnName}" not found!`);
        return;
      }
      const z = spawn.getProperty<number>('zindex')?.value || 0;
      targetMap.add(newSpawnPointEntity(spawn.x, spawn.y, z));
      this.scene.engine.goToScene(teleporter.mapName);
    }

    public update(entities: Entity[], delta: number) {
      //
    }
}