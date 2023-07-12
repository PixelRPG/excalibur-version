import { System, SystemType, Logger, Entity, Query, Direction, BodyComponent } from 'excalibur';
import { TiledObject } from '@excaliburjs/plugin-tiled/src';
import { PrpgTeleportableComponent, PrpgTeleportComponent, PrpgPlayerComponent, PrpgFadeScreenComponent, PrpgSpawnPointComponent, PrpgCharacterComponent } from '../components';
import { newSpawnPointEntity } from '../entities';
import { PrpgPlayerActor } from '../actors';
import { PrpgFadeScreenElement } from '../screen-elements';
import { MapScene } from '../scenes/map.scene';
import { PrpgComponentType, SpawnPointType, GameOptions, SpawnPoint } from '../types';
import { stringToDirection } from '../utilities/direction';

export class PrpgTeleportSystem extends System<
PrpgTeleportableComponent> {
    public readonly types = [PrpgComponentType.TELEPORTABLE] as const;
    public priority = 600;
    public systemType = SystemType.Update;
    private scene: MapScene;
    private logger = Logger.getInstance();
    private teleportQuery?: Query<PrpgTeleportComponent>;
    private fadeScreenQuery?: Query<PrpgFadeScreenComponent>;
    private spawnPointQuery?: Query<PrpgSpawnPointComponent>;

    constructor(readonly gameOptions: GameOptions) {
      super();
    }

    public initialize(scene: MapScene) {
      super.initialize?.(scene);
      this.logger.debug('[PrpgTeleportSystem] initialize');
      this.scene = scene;

      if (!this.teleportQuery) {
        this.teleportQuery = this.scene.world.queryManager.createQuery<PrpgTeleportComponent>([PrpgComponentType.TELEPORT]);
      }

      if (!this.fadeScreenQuery) {
        this.fadeScreenQuery = this.scene.world.queryManager.createQuery<PrpgFadeScreenComponent>([PrpgComponentType.FADE_SCREEN]);
      }

      if (!this.spawnPointQuery) {
        this.spawnPointQuery =
        this.scene.world.queryManager.createQuery<PrpgSpawnPointComponent>([
          PrpgComponentType.SPAWN_POINT
        ]);
      }

      const teleportEntities = this.teleportQuery.getEntities();
      // this.logger.debug('[PrpgTeleportSystem] Teleport entities', teleportEntities);
      for (const entity of teleportEntities) {
        entity.on('precollision', (event: {target: Entity, other: Entity}) => {

          const teleportable = event.other.get(PrpgTeleportableComponent);

          if(!teleportable) {
            // this.logger.debug('[PrpgTeleportSystem] No teleportable component found on entity', event.other);
            return;
          }

          this.onTeleportCollision(event.target, event.other);
        });
      }
    }

    /**
     * Prepare teleport an entity to a new map.
     * Adds fade screen elements to the current and target map and adds a spawn point to the target map.
     */
    public prepareTeleport(target: SpawnPoint) {
      const teleportable = target.entity.get(PrpgTeleportableComponent);

      if(!teleportable) {
        this.logger.error(`Entity ${target.entity.id} is not teleportable`);
        return;
      }

      if(teleportable.isTeleporting) {
        // this.logger.debug(`Entity ${target.entity.id} is already teleporting`);
        return;
      }

      this.logger.info(`Start teleport to ${target.mapScene.name} at ${target.x}, ${target.y}, ${target.z}`);

      // Fade out on current scene
      this.scene.add(new PrpgFadeScreenElement({
        width: this.scene.engine.canvasWidth,
        height: this.scene.engine.canvasHeight,
      }));

      // Fade in on target scene
      target.mapScene.add(new PrpgFadeScreenElement({
        width: this.scene.engine.canvasWidth,
        height: this.scene.engine.canvasHeight,
        isOutro: true,
      }));

      teleportable.isTeleporting = true;

      const spawnPointEntity = newSpawnPointEntity({
        type: SpawnPointType.TELEPORT,
        x: target.x,
        y: target.y,
        z: target.z,
        direction: target.direction,
        entity: target.entity,
        mapScene: target.mapScene,
      });

      teleportable.target = spawnPointEntity;

      // Add spawn point as the teleport target. After this spawn point has been executed, it will be removed again
      target.mapScene.add(spawnPointEntity);
    }

    /**
     * Removes the entity from the current map and add it to the target map.
     * If the entity is the current player, the scene will be changed to the target map.
     * Note: This method should be called after {@link PrpgTeleportSystem.prepareTeleport}
     **/
    public teleport(spawnPointEntity: Entity) {
      const target = spawnPointEntity.get(PrpgSpawnPointComponent)?.data;

      if(!target) {
        this.logger.error(`Entity ${spawnPointEntity.id} is not a spawn point`);
        return;
      }

      if(target.mapScene.name === this.scene.name) {
        this.logger.warn(`Entity ${target.entity.id} is already on scene ${target.mapScene.name}`);
        return;
      }

      this.logger.info(`Teleport to ${target.mapScene.name} at ${target.x}, ${target.y}, ${target.z}`);

      // Use the fade screen to run the garbage collector if available
      const gc = (window as any).gc || (window as any).opera.collect || (window as any).CollectGarbage;
      if(gc) {
        gc();
      }

      // TODO: Load assets for target map / scene here

      // this.scene.remove(target.entity);
      this.scene.world.remove(target.entity, false); // false means non-deferred removal, see https://github.com/excaliburjs/Excalibur/issues/2687
      target.mapScene.add(target.entity);

      // If the entity is the current player, follow the teleport and go to the target map
      const player = target.entity.get(PrpgPlayerComponent);
      if(player?.isCurrentPlayer) {
        this.scene.engine.goToScene(target.mapScene.name);
      }
      
    }

    private onTeleportCollision(teleportEntity: Entity, teleportableEntity: Entity) {
      const teleport = teleportEntity.get(PrpgTeleportComponent);
      const teleportable = teleportableEntity.get(PrpgTeleportableComponent);
  
      if (!teleport) {
        this.logger.warn('[PrpgTeleportSystem] Teleport component for targetEntity not found!');
        return;
      }

      if (!teleportable) {
        this.logger.warn('[PrpgTeleportSystem] Entry is not teleportable!');
        return;
      }

      const mapScene = this.scene.engine.scenes[teleport.mapName] as MapScene | undefined;
      if (!mapScene) {
        this.logger.warn('Teleport target map not found!', teleport.mapName);
        return;
      }

      const tiledMap = mapScene.getMap();
      if (!tiledMap) {
        this.logger.warn(`[PrpgTeleportSystem] Teleport target map "${teleport.mapName}" not found!`);
        return;
      }

      const tiledObjectGroups = tiledMap.map.data.getExcaliburObjects();
      if (!tiledObjectGroups?.length) {
        this.logger.warn('[PrpgTeleportSystem] Map has no objects!');
        return;
      }
      let spawn: TiledObject | undefined;
      for (const tiledObjectGroup of tiledObjectGroups) {
        spawn = tiledObjectGroup.getObjectByName(teleport.spawnName);
        if (spawn) {
          break;
        }
      }
      if (!spawn) {
        this.logger.warn(`[PrpgTeleportSystem] Teleport target spawn point "${teleport.spawnName}" not found!`);
        return;
      }
      const z = spawn.getProperty<number>('zindex')?.value || 0;
      const direction = stringToDirection(spawn.getProperty<string>('direction')?.value);
      
      // Remove the player from the current map and add it to the target map
      this.prepareTeleport({
        type: SpawnPointType.TELEPORT,
        x: spawn.x,
        y: spawn.y,
        z,
        direction,
        entity: teleportableEntity,
        mapScene
      });      
    }

    /**
     * If a spawn point is found, the player will be moved to the spawn point.
     * After that, the spawn point will be removed.
     * @param spawnPointEntities 
     * @returns 
     */
    public updateSpawnPoints(spawnPointEntities: Entity[] = []) {
      for (const spawnPointEntity of spawnPointEntities) {
        const spawnPoint = spawnPointEntity.get(PrpgSpawnPointComponent);
        const teleportableEntity = spawnPoint?.data.entity;
        if (!teleportableEntity) {
          this.logger.warn('Teleportable entity for spawn point not found!');
          return;
        }
        const body = teleportableEntity.get(BodyComponent);
        const character = teleportableEntity.get(PrpgCharacterComponent);       

        if (!spawnPoint) {
          this.logger.warn('SpawnPointComponent for spawn point entity not found!');
          return;
        }

        if (!body) {
          this.logger.warn('BodyComponent for teleportable entity not found, only entities with a body have a position');
        }

        if(body) {
          body.pos.x = spawnPoint.data.x;
          body.pos.y = spawnPoint.data.y;
        }

        if(character) {
          character.direction = spawnPoint.data.direction;
        }

        if (typeof (teleportableEntity as PrpgPlayerActor).z === 'number') {
          (teleportableEntity as PrpgPlayerActor).z = spawnPoint.data.z;
        } else {
          this.logger.warn('Can\'t set z-index of span point, because it is not a PrpgPlayerActor!');
        }

        // Remove the spawn point entity after it has been executed
        spawnPoint.data.mapScene.remove(spawnPointEntity);
      }
    }

    public updateTeleportables(teleportableEntities: Entity[]) {
      // const teleportEntities = this.teleportQuery?.getEntities()
      const fadeScreenEntities = (this.fadeScreenQuery?.getEntities() || []) as PrpgFadeScreenElement[];

      for (const fadeScreenEntity of fadeScreenEntities) {
        if(!fadeScreenEntity.fadeScreen) {
          continue;
        }

        const fadeScreen = fadeScreenEntity.fadeScreen;

        // Fade out is complete, move the player to the new map
        if (fadeScreen.isComplete && !fadeScreen.isOutro) {
          for (const teleportableEntity of teleportableEntities) {
            const teleportable = teleportableEntity.get(PrpgTeleportableComponent);
            if (teleportable?.isTeleporting) {
              if(!teleportable.target) {
                this.logger.error('Teleport target not found!');
                continue;
              }

              this.teleport(teleportable.target);
            }
          }
        }

        // Teleport is complete
        if(fadeScreen?.isComplete && fadeScreen?.isOutro) {
          for (const entity of teleportableEntities) {
            const teleportable = entity.get(PrpgTeleportableComponent);
            // If the fade screen is complete or removed, the teleport is finished
            if (teleportable?.isTeleporting) {
              teleportable.isTeleporting = false;
              teleportable.target = null;
            }
          }
        }
      }
    }

    public update(teleportableEntities: Entity[], delta: number) {

      this.updateTeleportables(teleportableEntities);

      const spawnPointEntities = this.spawnPointQuery?.getEntities();
      if(spawnPointEntities) {
        this.updateSpawnPoints(spawnPointEntities);
      }

    }
}