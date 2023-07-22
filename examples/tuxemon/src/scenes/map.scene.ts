import { Scene, Logger, Query, Engine } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import { PrpgCharacterSystem, PrpgPlayerSystem, PrpgTeleportSystem, PrpgMapSystem, PrpgFadeSystem } from '../systems';
import { newMapEntity } from '../entities';
import { PrpgPlayerActor } from '../actors';
import { PrpgMapComponent, PrpgPlayerComponent, PrpgTeleportableComponent, PrpgFadeScreenComponent } from '../components';
import { proxy } from 'valtio';

import { PrpgComponentType, MultiplayerSyncable, PlayerActorState } from '../types';
import type { GameOptions, MapSceneState } from '../types';

export class MapScene extends Scene implements MultiplayerSyncable<MapSceneState> {

  public logger = Logger.getInstance();
  private mapQuery: Query<PrpgMapComponent>;
  private playerQuery: Query<PrpgPlayerComponent>;

  /** The syncable state */
  private _state: MapSceneState = {
    name: "",
    players: {
      1: null,
      2: null,
      3: null,
      4: null,
    },
  };

  get updates() {
    return this._state;
  }

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
    this._state.name = name;
    this._state = this.initState({ name: name });

    MapScene._instances[gameOptions.playerNumber] ||= {};
    MapScene._instances[gameOptions.playerNumber][name] = this;
  }

  /**
   * TODO: Sync which players are in this scene
   */
  // updateStatePlayer() {
  //   const playerNumber = this.gameOptions.playerNumber;

  //   const currentPlayer = this.getCurrentGlobalPlayer();
  //   if(currentPlayer?.scene === this) {
  //     this.state.players[playerNumber] = currentPlayer.state;
  //     this.logger.debug(`[${playerNumber}] add player state on`, this.name);
  //   } else {
  //     this.state.players[playerNumber] = null;
  //     this.logger.debug(`[${playerNumber}] remove player state on`, this.name);
  //   }
  // }

  /**
   * Sync the state of this scene
   */
  updateState() {
    // this.updateStatePlayer();
  }

  onPostUpdate(engine: Engine, delta: number) {
    super.onPostUpdate(engine, delta);
    // this.updateState();
  }

  /**
   * Get the map data like players, NPCs, name, etc.
   * @returns 
   */
  public initState(state: Partial<MapSceneState>): MapSceneState {
    this._state = {...this._state, ...state};
    this.updateState();
    this.logger.debug(`MapScene initState:`, this._state);
    return proxy(this._state);
  }


  public onInitialize() {
    this.world.add(new PrpgFadeSystem());
    this.world.add(new PrpgMapSystem(this.gameOptions));
    this.world.add(new PrpgCharacterSystem());
    this.world.add(new PrpgPlayerSystem(this.gameOptions));
    this.world.add(new PrpgTeleportSystem(this.gameOptions));
  }

  public getEntityByName(name: string) {
    return this.entities.find(entity => entity.name === name);
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

    // const updatePlayerState = (isUpdate && !player.player?.isCurrentPlayer) || (!isUpdate && player.player?.isCurrentPlayer) || isInit;

    // if((updatePlayerState) && this.state.players[playerNumber] !== player.state) {
      this._state.players[playerNumber] = player.updates;
    // }
    
    
    if(player.player?.isCurrentPlayer) {
      this.logger.debug(`[${this.gameOptions.playerNumber}] transferred current player to map ${this.name}`);
    } else {
      this.logger.debug(`[${this.gameOptions.playerNumber}] transferred player ${player.player?.playerNumber} to map ${this.name}`);
    }

    this.add(player);
  }

  transferPlayer(player: PrpgPlayerActor, isUpdate = false) {
    const playerNumber = player.player?.playerNumber;
    if(!playerNumber) {
      throw new Error(`Player ${player} does not have a playerNumber`);
    }

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
    const playerNumber = player.player?.playerNumber;
    if(!playerNumber) {
      throw new Error(`Player ${player} does not have a playerNumber`);
    }

    const updatePlayerState = true || isUpdate || player.player?.isCurrentPlayer;

    if(updatePlayerState && this._state.players[playerNumber] !== null) {
      this._state.players[playerNumber] = null;
    }

    this.world.remove(player, false);

    this?.emit('entityremoved', { target: player } as any);
  }

  public deserializePlayer(playerData: PlayerActorState) {
    if(!playerData.player?.playerNumber) {
      this.logger.error(`[${this.gameOptions.playerNumber}] Player number is missing in player data for map ${this.name}`);
      return;
    }

    this.logger.debug(`[${this.gameOptions.playerNumber}] Deserialize player ${playerData.player?.playerNumber} on map ${this.name}`);

    let playerActor = this.getPlayer(playerData.player?.playerNumber);
    if(!playerActor) {
      this.logger.warn(`[${this.gameOptions.playerNumber}] Player ${playerData.player?.playerNumber} is missing on map ${this.name}, transfer it...`);
      playerActor = this.getGlobalPlayer(playerData.player.playerNumber);

      if(!playerActor) {
        this.logger.error(`[${this.gameOptions.playerNumber}] Player instance is missing for player ${playerData.player?.playerNumber}!`);
        return;
      }

      // TODO: Use teleport logic here?
      this.transferPlayer(playerActor, true);
    }

    playerActor.applyUpdates(playerData);
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

  public applyUpdates(map: MapSceneState) {
    
    if(map.name !== this.name) {
      throw new Error(`Map name ${map.name} does not match scene name ${this.name}`);
    }

    const playerNumbers = Object.keys(map.players);
    for (const key of playerNumbers) {
      const playerNumber = Number(key);
      if(!playerNumber) {
        this.logger.error(`[${this.gameOptions.playerNumber}] Player number is missing in player data for map ${this.name}`);
        continue;
      }

      const playerData = map.players[key];
      if(!playerData) {
        continue;
      }

      if(playerNumber === this.gameOptions.playerNumber) {
        this.logger.warn(`[${this.gameOptions.playerNumber}] Got update for own player, ignoring...`);
        continue;
      }

      this.deserializePlayer(playerData);
      const playerActor = this.getPlayer(playerNumber);
      if(playerActor) {
        this.removePlayerFromOtherMapScenes(playerActor, map.name);
      }
    }

    // TODO: Remove the player from other map states
  }
}