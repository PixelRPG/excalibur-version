import { Scene, Logger, Query, Engine } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import { PrpgCharacterSystem, PrpgBodySystem, PrpgPlayerSystem, PrpgTeleportSystem, PrpgMapSystem, PrpgFadeSystem, PrpgMultiplayerSystem } from '../systems';
import { newMapEntity } from '../entities';
import { PrpgPlayerActor } from '../actors';
import { PrpgMapComponent, PrpgPlayerComponent } from '../components';
import { findEntityByNameFromScene } from '../utilities';

import { PrpgComponentType, PlayerActorState, MultiplayerSyncableScene } from '../types';
import type { GameOptions } from '../types';



export class MapScene extends Scene implements MultiplayerSyncableScene {

  public logger = Logger.getInstance();
  public multiplayerSystem?: PrpgMultiplayerSystem;
  private mapQuery: Query<PrpgMapComponent>;
  private playerQuery: Query<PrpgPlayerComponent>;

  private static _instances: {
    [playerNumber: number]: {
      [name: string]: MapScene;
    }
  } = {
    1: {},
    2: {},
    3: {},
    4: {},
  };

  /**
   * Get all map scenes for a player
   * @returns 
   */
  public instances() {
    return MapScene._instances[this.gameOptions.playerNumber];
  }

  /**
   * 
   * @paramGet map scene by name 
   * @returns 
   */
  public getInstance(name: string) {
    return MapScene._instances[this.gameOptions.playerNumber][name];
  }

  constructor(private readonly gameOptions: GameOptions, public readonly name: string, private readonly map: TiledMapResource) {
    super();
    this.add(newMapEntity(map, name));
    this.mapQuery = this.world.queryManager.createQuery([PrpgComponentType.TILED_MAP]);
    this.playerQuery = this.world.queryManager.createQuery<PrpgPlayerComponent>([PrpgComponentType.PLAYER]);
    this.name = name;

    MapScene._instances[gameOptions.playerNumber] ||= {};
    MapScene._instances[gameOptions.playerNumber][name] = this;
  }

  onPostUpdate(engine: Engine, delta: number) {
    super.onPostUpdate(engine, delta);
  }

  public onInitialize() {
    this.world.add(new PrpgFadeSystem());
    this.world.add(new PrpgMapSystem(this.gameOptions));
    this.world.add(new PrpgBodySystem());
    this.world.add(new PrpgCharacterSystem());
    this.world.add(new PrpgPlayerSystem(this.gameOptions));
    this.world.add(new PrpgTeleportSystem(this.gameOptions));
    this.world.add(new PrpgMultiplayerSystem(this.gameOptions));
  }

  public getEntityByName(name: string) {
    return findEntityByNameFromScene(this, name);
  }

  public getMap() {
    const mapEntities = this.mapQuery.getEntities();
    for (const mapEntity of mapEntities) {
      const tiledMap = mapEntity.get(PrpgMapComponent);
      return tiledMap;
    }
  }

  /**
   * Get all players on this map
   * @returns 
   */
  getPlayers() {
    return this.playerQuery.getEntities() as PrpgPlayerActor[];
  }

  /**
   * Get a player by player number on this map
   * @param playerNumber 
   * @returns 
   */
  getPlayer(playerNumber: number) {
    const playerActors = this.getPlayers();
    return playerActors.find(playerActor => playerActor.player?.playerNumber === playerNumber);
  }

  /**
   * Get current player (you control) of this map scene
   */
  getCurrentPlayer() {
    const playerActors = this.playerQuery.getEntities() as PrpgPlayerActor[];
    return playerActors.find(playerActor => playerActor.player?.isCurrentPlayer);
  }

  /**
   * Get a player by player number from any map scene
   * @param playerNumber 
   * @returns 
   */
  getGlobalPlayer(playerNumber: number) {
    return PrpgPlayerActor.getPlayer(this.gameOptions, playerNumber);
  }


  getCurrentGlobalPlayer() {
    return PrpgPlayerActor.getCurrentPlayer(this.gameOptions);
  }

  public addPlayer(player: PrpgPlayerActor, isUpdate = false, isInit = false) {
    const playerNumber = player.player?.playerNumber;
    if(playerNumber === undefined) {
      throw new Error(`Player ${player} does not have a playerNumber`);
    }

    // this._state.players[playerNumber] = player.updates;
    
    if(player.player?.isCurrentPlayer) {
      this.logger.debug(`[${this.gameOptions.playerNumber}] transferred current player to map ${this.name}`);
    } else {
      this.logger.debug(`[${this.gameOptions.playerNumber}] transferred player ${player.player?.playerNumber} to map ${this.name}`);
    }

    this.add(player);
  }

  transferPlayer(player: PrpgPlayerActor, isUpdate = false) {
    if(player.scene) {
      if(player.scene instanceof MapScene) {
        player.scene.removePlayer(player, isUpdate);
        this.addPlayer(player, isUpdate);
      } else {
        this.transfer(player)
      }
    }
  }

  public removePlayer(player: PrpgPlayerActor, isUpdate = false) {
    this.world.remove(player, false);

    this?.emit('entityremoved', { target: player } as any);
  }

  removePlayerFromOtherMapScenes(player: PrpgPlayerActor, excludeMapName: string) {
    const allMapScenes = this.instances();
    for (const name in allMapScenes) {
      const mapScene = allMapScenes[name];
      if(mapScene.name === excludeMapName) {
        continue;
      }
      mapScene.removePlayer(player, true);
    }
  }
}