import { System, SystemType, Logger, Entity, Query, Direction, ScreenElement } from 'excalibur';
import { TiledObject } from '@excaliburjs/plugin-tiled/src';
import { PrpgTeleportableComponent, PrpgTeleportComponent, PrpgFadeScreenComponent, PrpgSpawnPointComponent, PrpgCharacterComponent, PrpgPlayerComponent, PrpgBodyComponent } from '../components';
import { newSpawnPointEntity } from '../entities';
import { PrpgPlayerActor } from '../actors';
import { PrpgFadeScreenElement } from '../screen-elements';
import { MapScene } from '../scenes/map.scene';
import { PrpgComponentType, SpawnPointType, GameOptions, SpawnPointState, TeleportAnimation } from '../types';
import { stringToDirection } from '../utilities/direction';

export class PrpgTeleportSystem extends System<
PrpgTeleportableComponent> {
    public readonly types = [PrpgComponentType.TELEPORTABLE] as const;
    public priority = 600;
    public systemType = SystemType.Update;
    private scene?: MapScene;
    private logger = Logger.getInstance();
    private teleportQuery?: Query<PrpgTeleportComponent>;
    private fadeScreenQuery?: Query<PrpgFadeScreenComponent>;
    private spawnPointQuery?: Query<PrpgSpawnPointComponent>;

    constructor(readonly gameOptions: GameOptions) {
      super();
    }

    public initialize(scene: MapScene) {
      super.initialize?.(scene);
      this.logger.debug(`[${this.gameOptions.playerNumber}] initialize`);
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
      // this.logger.debug('[${this.gameOptions.playerNumber}] Teleport entities', teleportEntities);
      for (const entity of teleportEntities) {
        // @ts-ignore TODO: fix type in excalibur
        entity.events.on('precollision', (event: {target: Entity, other: Entity}) => {

          const teleportable = event.other.get(PrpgTeleportableComponent);

          if(!teleportable) {
            // this.logger.debug('[${this.gameOptions.playerNumber}] No teleportable component found on entity', event.other);
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
    public prepareTeleport(target: SpawnPointState) {
      const teleportableEntity = this.scene?.getEntityByName(target.entityName);

      if(!teleportableEntity) {
        this.logger.error(`[${this.gameOptions.playerNumber}] Entity ${target.entityName} on scene ${this.scene?.name} not found!`);
        return;
      }

      const teleportable = teleportableEntity.get(PrpgTeleportableComponent);

      if(!teleportable) {
        this.logger.error(`[${this.gameOptions.playerNumber}] Entity ${teleportableEntity.id} is not teleportable`);
        return;
      }

      if(teleportable.isTeleporting) {
        // this.logger.debug(`Entity ${teleportableEntity.id} is already teleporting`);
        return;
      }
      teleportable.isTeleporting = true;

      this.logger.info(`[${this.gameOptions.playerNumber}] Start teleport ${target.entityName}} to ${target.sceneName} at ${target.x}, ${target.y}, ${target.z}`);

      const targetMapScene = this.scene?.getInstance(target.sceneName);

      if(!targetMapScene) {
        this.logger.error(`[${this.gameOptions.playerNumber}] Scene ${target.sceneName} not found!`);
        return;
      }

      const spawnPointEntity = newSpawnPointEntity({
        type: SpawnPointType.TELEPORT,
        x: target.x,
        y: target.y,
        z: target.z,
        direction: target.direction,
        entityName: target.entityName,
        sceneName: target.sceneName,
      });

      teleportable.teleportTo = spawnPointEntity.get(PrpgSpawnPointComponent)?.data;

      // Add spawn point as the teleport target. After this spawn point has been executed, it will be removed again
      targetMapScene.add(spawnPointEntity);

      // Add fade screen to current and target map
      if(teleportable.animation === TeleportAnimation.FadeScreen) {
        // Fade out on current scene
        this.scene?.add(new PrpgFadeScreenElement({
          width: this.scene?.engine.canvasWidth,
          height: this.scene?.engine.canvasHeight,
        }));

        // Fade in on target scene
        targetMapScene.add(new PrpgFadeScreenElement({
          width: this.scene?.engine.canvasWidth,
          height: this.scene?.engine.canvasHeight,
          isOutro: true,
        }));
      } else {
        if(!teleportable.teleportTo) {
          this.logger.error('Teleport target not found!');
          return;
        }
        // If no fade screen is used, teleport the entity immediately
        this.teleport(teleportable.teleportTo);
        teleportable.isTeleporting = false;
        teleportable.teleportTo = undefined;
      }
    }

    /**
     * Removes the entity from the current map and add it to the target map.
     * If the entity is the current player, the scene will be changed to the target map.
     * Note: This method should be called after {@link PrpgTeleportSystem.prepareTeleport}
     **/
    public teleport(spawnPoint: SpawnPointState) {
      const teleportableEntity = this.scene?.getEntityByName(spawnPoint.entityName);

      if(!teleportableEntity) {
        this.logger.error(`[${this.gameOptions.playerNumber}] Entity ${spawnPoint.entityName} on scene ${this.scene?.name} not found`);
        return;
      }

      const teleportable = teleportableEntity.get(PrpgTeleportableComponent);

      if(!teleportable) {
        this.logger.error(`[${this.gameOptions.playerNumber}] Entity ${teleportableEntity.id} is not teleportable`);
        return;
      }

      if(spawnPoint.sceneName === this.scene?.name) {
        this.logger.warn(`[${this.gameOptions.playerNumber}] Entity ${teleportableEntity.id} is already on scene ${spawnPoint.sceneName}`);
        return;
      }

      const targetMapScene = this.scene?.getInstance(spawnPoint.sceneName);

      if(!targetMapScene) {
        this.logger.error(`[${this.gameOptions.playerNumber}] Scene ${spawnPoint.sceneName} not found!`);
        return;
      }

      this.logger.info(`[${this.gameOptions.playerNumber}] Teleport entity ${teleportableEntity.name} to ${spawnPoint.sceneName} at ${spawnPoint.x}, ${spawnPoint.y}, ${spawnPoint.z}`);

      // Use the fade screen to run the garbage collector if available
      const gc = (window as any).gc || (window as any).opera?.collect || (window as any).CollectGarbage;
      if(gc) {
        gc();
      }

      // TODO: Load assets for target spawnPoint here

      // Teleport entity to new map
      if(teleportableEntity.get(PrpgPlayerComponent)) {
        targetMapScene.transferPlayer(teleportableEntity as PrpgPlayerActor);
      } else {
        targetMapScene.transfer(teleportableEntity);
      }

      teleportable.currentSceneName = targetMapScene.name;

      // If the engine should follow the entity, change the scene
      if(teleportable?.followTeleport) {
        this.scene?.engine.goToScene(targetMapScene.name);
        return
      }
      
    }

    private onTeleportCollision(teleportEntity: Entity, teleportableEntity: Entity) {
      const teleport = teleportEntity.get(PrpgTeleportComponent);
      const teleportable = teleportableEntity.get(PrpgTeleportableComponent);
  
      if (!teleport) {
        this.logger.warn(`[${this.gameOptions.playerNumber}] Teleport component for targetEntity not found!`);
        return;
      }

      if (!teleportable) {
        this.logger.warn(`[${this.gameOptions.playerNumber}] Entry is not teleportable!`);
        return;
      }

      const mapScene = this.scene?.getInstance(teleport.mapName);
      if (!mapScene) {
        this.logger.warn('Teleport target map not found!', teleport.mapName);
        return;
      }

      const tiledMap = mapScene.getMap();
      if (!tiledMap) {
        this.logger.warn(`[${this.gameOptions.playerNumber}] Teleport target map "${teleport.mapName}" not found!`);
        return;
      }

      const tiledObjectGroups = tiledMap.map.data.getExcaliburObjects();
      if (!tiledObjectGroups?.length) {
        this.logger.warn(`[${this.gameOptions.playerNumber}] Map has no objects!`);
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
        this.logger.warn(`[${this.gameOptions.playerNumber}] Teleport target spawn point "${teleport.spawnName}" not found!`);
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
        entityName: teleportableEntity.name,
        sceneName: mapScene.name,
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
        const spawnPoint = spawnPointEntity.get(PrpgSpawnPointComponent)?.data;

        if (!spawnPoint) {
          this.logger.error(`[${this.gameOptions.playerNumber}] SpawnPointComponent for spawn point entity not found!`);
          continue;
        }

        const mapScene = this.scene?.getInstance(spawnPoint.sceneName);
        if (!mapScene) {
          this.logger.error(`[${this.gameOptions.playerNumber}] Scene ${spawnPoint.sceneName} for spawn point not found!`);
          continue;
        }


        /** Entity which should be moved */
        const targetEntity = this.scene?.getEntityByName(spawnPoint.entityName);
        if (!targetEntity) {
          if(this.gameOptions.playerNumber === 1) this.logger.warn(`[${this.gameOptions.playerNumber}] Entity ${spawnPoint.entityName} on scene ${this.scene?.name} for spawn point not found!`);
          // spawnPoint.mapScene.remove(spawnPointEntity);
          continue;
        }
        this.logger.debug(`[${this.gameOptions.playerNumber}] Entity ${spawnPoint.entityName} on scene ${this.scene?.name} for spawn point found :)`);

        const body = targetEntity.get(PrpgBodyComponent);
        const character = targetEntity.get(PrpgCharacterComponent);
        const teleportable = targetEntity.get(PrpgTeleportableComponent);     

        if (!body) {
          this.logger.warn(`[${this.gameOptions.playerNumber}] BodyComponent for entity not found, only entities with a body have a position`);
        }

        if(body) {
          body.setPos(spawnPoint.x, spawnPoint.y, true);
        }

        if(character) {
          character.direction = spawnPoint.direction;
        }

        if(teleportable) {
          teleportable.currentSceneName = spawnPoint.sceneName;
        }

        // TODO also update the z value on other drawable entities
        if (typeof (targetEntity as PrpgPlayerActor).z === 'number') {
          (targetEntity as PrpgPlayerActor).z = spawnPoint.z;
        } else {
          this.logger.warn('Can\'t set z-index of span point, because it is not a PrpgPlayerActor!');
        }

        // Remove the spawn point entity after it has been executed
        mapScene.remove(spawnPointEntity);
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

        for (const teleportableEntity of teleportableEntities) {
          const teleportable = teleportableEntity.get(PrpgTeleportableComponent);

          // Ignore teleportables without fade screen animation
          if(teleportable?.animation !== TeleportAnimation.FadeScreen) {
            continue;
          }

          // Fade out is complete, move the player to the new map
          if (fadeScreen.isComplete && !fadeScreen.isOutro) {
            if (teleportable?.isTeleporting) {
              if(!teleportable.teleportTo) {
                this.logger.error('Teleport target not found!');
                continue;
              }

              this.teleport(teleportable.teleportTo);
            }
          }

          // Teleport is complete
          if(fadeScreen?.isComplete && fadeScreen?.isOutro) {
            // If the fade screen is complete or removed, the teleport is finished
            if (teleportable?.isTeleporting) {
              teleportable.isTeleporting = false;
              teleportable.teleportTo = undefined;
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