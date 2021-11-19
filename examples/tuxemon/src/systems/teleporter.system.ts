import { System, SystemType, Logger, Entity, Query } from 'excalibur';
import { TiledObject } from '@excaliburjs/plugin-tiled/src';
import { PrpgTeleporterComponent } from '../components';
import { newSpawnPointEntity } from '../entities';
import { PrpgPlayerActor } from '../actors';
import { MapScene } from '../scenes/map.scene';
import { PrpgComponentType, SpawnPointType, Direction } from '../types';
import { resources } from '../resources';
import { stringToDirection } from '../utilities/direction';

export class PrpgTeleporterSystem extends System<
PrpgTeleporterComponent> {
    public readonly types = [PrpgComponentType.TELEPORTER] as const;
    public priority = 200;
    public systemType = SystemType.Update;
    private scene: MapScene;
    private logger = Logger.getInstance();
    private teleporterQuery?: Query<PrpgTeleporterComponent>;

    constructor() {
      super();
    }

    public initialize?(scene: MapScene) {
      this.logger.debug('[PrpgTeleporterSystem] initialize');
      this.scene = scene;

      if (!this.teleporterQuery) {
        this.teleporterQuery = this.scene.world.queryManager.createQuery<PrpgTeleporterComponent>([PrpgComponentType.TELEPORTER]);
      }

      const entities = this.teleporterQuery.getEntities();
      this.logger.debug('[PrpgTeleporterSystem] Teleporter entities', entities);
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
        this.logger.warn('[PrpgTeleporterSystem] Teleporter component for targetEntity not found!');
        return;
      }

      const targetMap = this.scene.engine.scenes[teleporter.mapName] as MapScene | undefined;
      if (!targetMap) {
        this.logger.warn('Teleporter target map not found!', teleporter.mapName);
        return;
      }

      const tiledMap = targetMap.getMap();
      if (!tiledMap) {
        this.logger.warn(`[PrpgTeleporterSystem] Teleport target map "${teleporter.mapName}" not found!`);
        return;
      }

      const tiledObjectGroups = tiledMap.map.data.getExcaliburObjects();
      if (!tiledObjectGroups?.length) {
        this.logger.warn('[PrpgTeleporterSystem] Map has no objects!');
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
        this.logger.warn(`[PrpgTeleporterSystem] Teleport target spawn point "${teleporter.spawnName}" not found!`);
        return;
      }
      const z = spawn.getProperty<number>('zindex')?.value || 0;
      const direction = stringToDirection(spawn.getProperty<string>('direction')?.value);

      // Add spawn point, after this spawn point has been executed, it will be removed again
      targetMap.add(newSpawnPointEntity(SpawnPointType.TELEPORT, spawn.x, spawn.y, z, direction));

      const player = PrpgPlayerActor.getInstance({spriteSheet: resources.sprites.scientist, playerNumber: 1});
      this.scene.remove(player);
      targetMap.add(player);

      this.scene.engine.goToScene(teleporter.mapName);
    }

    public update(entities: Entity[], delta: number) {
      //
    }
}