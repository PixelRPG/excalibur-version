import { Scene, Logger, Query, Engine } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import { PrpgCharacterSystem, PrpgPlayerSystem, PrpgTeleportSystem, PrpgMapSystem, PrpgFadeSystem } from '../systems';
import { newMapEntity } from '../entities';
import { PrpgPlayerActor } from '../actors';
import { PrpgMapComponent, PrpgPlayerComponent, PrpgTeleportableComponent, PrpgFadeScreenComponent } from '../components';
import { proxy } from 'valtio';

import { PrpgComponentType, NetworkSerializable, PlayerActorState } from '../types';
import type { GameOptions, MapSceneState } from '../types';

export class MapScene extends Scene implements NetworkSerializable<MapSceneState> {

  public logger = Logger.getInstance();
  private mapQuery: Query<PrpgMapComponent>;
  private playerQuery: Query<PrpgPlayerComponent>;

  /** The syncable state */
  private _state: MapSceneState = {
    name: "",
    players: {},
  };

  get state() {
    return this._state;
  }

  // get players() {
  //   return this.state.players;
  // }

  private static _instances: {
    [playerNumber: number]: {
      [name: string]: MapScene;
    }
  } = {};

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
  syncStatePlayer() {
    // TODO not needed anymore?
    const currentPlayerState = this.getCurrentPlayer()?.state;
    if(currentPlayerState) {
      this.state.players[this.gameOptions.playerNumber] = currentPlayerState
    }
  }

  /**
   * Sync the state of this scene
   */
  syncState() {
    this.syncStatePlayer();
  }

  onPostUpdate(engine: Engine, delta: number) {
    super.onPostUpdate(engine, delta);
    this.syncState();
  }

  /**
   * Get the map data like players, NPCs, name, etc.
   * @returns 
   */
  public initState(state: Partial<MapSceneState>): MapSceneState {
    this._state = {...this._state, ...state};
    this.syncState();
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

  public addPlayer(player: PrpgPlayerActor) {
    const playerNumber = player.player?.playerNumber;
    if(playerNumber === undefined) {
      throw new Error(`Player ${player} does not have a playerNumber`);
    }
    if(player.player?.isCurrentPlayer && this.state.players[playerNumber] !== player.state) {
      this.state.players[playerNumber] = player.state;
    }
    
    if(player.player?.isCurrentPlayer) {
      this.logger.debug(`[${this.gameOptions.playerNumber}] transferred current player to map ${this.name}`);
    } else {
      this.logger.debug(`[${this.gameOptions.playerNumber}] transferred player ${player.player?.playerNumber} to map ${this.name}`);
    }

    this.add(player);
  }

  transferPlayer(player: PrpgPlayerActor) {
    const playerNumber = player.player?.playerNumber;
    if(!playerNumber) {
      throw new Error(`Player ${player} does not have a playerNumber`);
    }

    if(player.scene) {
      if(player.scene instanceof MapScene) {
        if(this.state.players[playerNumber]) {
          player.scene.removePlayer(player);
        }
        
      } else {
        player.scene.world.remove(player, false);
        player.scene?.emit('entityremoved', { target: player } as any);
      }
    }

    this.addPlayer(player);

  }


  public removePlayer(player: PrpgPlayerActor) {
    const playerNumber = player.player?.playerNumber;
    if(!playerNumber) {
      throw new Error(`Player ${player} does not have a playerNumber`);
    }

    // Only remove player from the state if it is the current player
    if(player.player?.isCurrentPlayer) {
      delete this.state.players[playerNumber];
    }

    this.world.remove(player, false);

    this?.emit('entityremoved', { target: player } as any);
  }

  public deserializePlayer(playerData: PlayerActorState) {
    if(!playerData.player?.playerNumber) {
      this.logger.error(`[${this.gameOptions.playerNumber}] Player number is missing in player data for map ${this.name}`);
      return;
    }
    let playerActor = this.getPlayer(playerData.player?.playerNumber);
    if(!playerActor) {
      this.logger.warn(`[${this.gameOptions.playerNumber}] Player ${playerData.player?.playerNumber} is missing on map ${this.name}, adding it...`);
      playerActor = PrpgPlayerActor.getPlayer(this.gameOptions, playerData.player.playerNumber);

      if(!playerActor) {
        this.logger.error(`[${this.gameOptions.playerNumber}] Player instance is missing for player ${playerData.player?.playerNumber}!`);
        return;
      }

      // TODO: Use teleport logic here?
      this.addPlayer(playerActor);
    }

    playerActor.deserialize(playerData);
  }

  removePlayerFromOtherMapScenes(player: PrpgPlayerActor, excludeMapName: string) {
    const allMapScenes = this.instances();
    for (const name in allMapScenes) {
      const mapScene = allMapScenes[name];
      if(mapScene.name === excludeMapName) {
        continue;
      }
      mapScene.removePlayer(player);
    }
  }

  public deserialize(map: MapSceneState) {
    
    if(map.name === this.name) {
      for (const _playerNumber in map.players) {
        const playerNumber = Number(_playerNumber); 
        const player = map.players[playerNumber];
        if(!playerNumber) {
          this.logger.error(`[${this.gameOptions.playerNumber}] Player number is missing in player data for map ${this.name}`);
          return;
        }

        if(playerNumber === this.gameOptions.playerNumber) {
          this.logger.warn(`[${this.gameOptions.playerNumber}] Got update for own player, ignoring...`);
          return;
        }

        this.deserializePlayer(player);
        const playerActor = this.getPlayer(playerNumber);
        if(playerActor) {
          this.removePlayerFromOtherMapScenes(playerActor, map.name);
        }
      }
    }

    // TODO: Remove the player from other map states
  }
}