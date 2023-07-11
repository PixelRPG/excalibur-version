import { System, SystemType, Logger, Entity, Query, Direction } from 'excalibur';
import { TiledObject } from '@excaliburjs/plugin-tiled/src';
import { PrpgTeleportableComponent, PrpgTeleportComponent, PrpgPlayerComponent, PrpgFadeScreenComponent } from '../components';
import { newSpawnPointEntity } from '../entities';
import { PrpgFadeScreenElement } from '../screen-elements';
import { MapScene } from '../scenes/map.scene';
import { PrpgComponentType, SpawnPointType, GameOptions, SpawnPoint } from '../types';
import { stringToDirection } from '../utilities/direction';

export class PrpgTeleportSystem extends System<
PrpgTeleportableComponent> {
    public readonly types = [PrpgComponentType.TELEPORTABLE] as const;
    public priority = 200;
    public systemType = SystemType.Update;
    private scene: MapScene;
    private logger = Logger.getInstance();
    private teleportQuery?: Query<PrpgTeleportComponent>;
    private fadeScreenQuery?: Query<PrpgFadeScreenComponent>;

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

      const teleportEntities = this.teleportQuery.getEntities();
      this.logger.debug('[PrpgTeleportSystem] Teleport entities', teleportEntities);
      for (const entity of teleportEntities) {
        entity.on('precollision', (event: {target: Entity, other: Entity}) => {

          const teleportable = event.other.get(PrpgTeleportableComponent);

          if(!teleportable) {
            this.logger.debug('[PrpgTeleportSystem] No teleportable component found on entity', event.other);
            return;
          }

          this.onTeleportCollision(event.target, event.other);

          // if (event.other instanceof PrpgPlayerActor) {
          //   const playerActor = event.other as PrpgPlayerActor;
          //   // Only teleport player if it's the local player
          //   if(playerActor.player?.playerNumber === this.gameOptions.playerNumber) {
          //     this.onTeleportCollision(event.target, playerActor);
          //   }
          // }
        });
      }
    }

    /**
     * Transfer an entity to a new map.
     * Removes the entity from the current map and add it to the target map
     */
    public startTeleport(target: SpawnPoint) {
      this.logger.info(`Teleporting to ${target.mapScene.name} at ${target.x}, ${target.y}, ${target.z}`);

      const teleportable = target.entity.get(PrpgTeleportableComponent);

      if(!teleportable) {
        this.logger.error(`Entity ${target.entity.id} is not teleportable`);
        return;
      }

      if(teleportable.isTeleporting) {
        this.logger.warn(`Entity ${target.entity.id} is already teleporting`);
        return;
      }

      this.scene.add(new PrpgFadeScreenElement({
        width: this.scene.engine.canvasWidth,
        height: this.scene.engine.canvasHeight,
      }));

      target.mapScene.add(new PrpgFadeScreenElement({
        width: this.scene.engine.canvasWidth,
        height: this.scene.engine.canvasHeight,
        isOutro: true,
      }));

      teleportable.isTeleporting = true;

      // Add spawn point, after this spawn point has been executed, it will be removed again
      target.mapScene.add(newSpawnPointEntity(SpawnPointType.TELEPORT, target.x, target.y, target.z, target.direction, target.entity));
    
      this.scene.world.remove(target.entity, false); // false means non-deferred removal, see https://github.com/excaliburjs/Excalibur/issues/2687
      target.mapScene.add(target.entity);


      // If the entity is the current player, follow the teleport and go to the target map
      // TODO: Wait until the intro fade is finished
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
      this.startTeleport({
        x: spawn.x,
        y: spawn.y,
        z,
        direction,
        entity: teleportableEntity,
        mapScene
      });      
    }

    public update(teleportableEntities: Entity[], delta: number) {

      // const teleportEntities = this.teleportQuery?.getEntities()
      const fadeScreen = this.fadeScreenQuery?.getEntities()[0]?.get(PrpgFadeScreenComponent)


      for (const entity of teleportableEntities) {
        const teleportable = entity.get(PrpgTeleportableComponent);
        if (teleportable?.isTeleporting && (fadeScreen?.data?.isComplete || !fadeScreen)) {
          teleportable.isTeleporting = false;
        }

      }

    }
}