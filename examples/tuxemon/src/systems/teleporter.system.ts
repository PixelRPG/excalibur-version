import { System, SystemType, Logger, Entity, Query } from 'excalibur';
import { TiledObject } from '@excaliburjs/plugin-tiled/src';
import { PrpgPlayerComponent, PrpgTeleporterComponent } from '../components';
import { newSpawnPointEntity } from '../entities';
import { PrpgPlayerActor } from '../actors';
import { MapScene } from '../scenes/map.scene';
import { PrpgComponentType, SpawnPointType, Direction } from '../types';
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

      const teleportEntities = this.teleporterQuery.getEntities();
      this.logger.debug('[PrpgTeleporterSystem] Teleporter entities', teleportEntities);
      for (const entity of teleportEntities) {
        entity.on('precollision', (event) => {
          if (event.other instanceof PrpgPlayerActor) {
            this._onTeleport(event.target, event.other);
          }
        });
      }
    }

    protected _onTeleport(teleportEntity: Entity, entry: Entity) {
      const teleporter = teleportEntity.get(PrpgTeleporterComponent);
      if (!teleporter) {
        this.logger.warn('[PrpgTeleporterSystem] Teleporter component for targetEntity not found!');
        return;
      }

      const targetMapScene = this.scene.engine.scenes[teleporter.mapName] as MapScene | undefined;
      if (!targetMapScene) {
        this.logger.warn('Teleporter target map not found!', teleporter.mapName);
        return;
      }

      const tiledMap = targetMapScene.getMap();
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
      targetMapScene.add(newSpawnPointEntity(SpawnPointType.TELEPORT, spawn.x, spawn.y, z, direction, entry));

      
      // Remove the player from the current map and add it to the target map
      this.scene.world.remove(entry, false); // false means non-deferred removal, see https://github.com/excaliburjs/Excalibur/issues/2687
      targetMapScene.add(entry);
      
        
      // If the entry is the current player, go to the target map
      // TODO check current player, not only player 1 for split screen
      if(entry === PrpgPlayerActor.getByPlayerNumber(1)) {
        this.scene.engine.goToScene(teleporter.mapName);
      }
      
    }

    public update(entities: Entity[], delta: number) {
      //
    }
}