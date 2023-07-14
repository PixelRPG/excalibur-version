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

  private _state: MapSceneState = {
    name: "",
    players: {},
  };

  get state() {
    return this._state;
  }

  constructor(private readonly gameOptions: GameOptions, public readonly name: string, private readonly map: TiledMapResource) {
    super();
    this.add(newMapEntity(map, name));
    this.mapQuery = this.world.queryManager.createQuery([PrpgComponentType.TILED_MAP]);
    this.playerQuery = this.world.queryManager.createQuery<PrpgPlayerComponent>([PrpgComponentType.PLAYER]);
    this._state.name = name;
    this._state = this.initState({ name: name });
  }

  /**
   * TODO: Extend BodyComponent / Actor, to make this sync automatic
   */
  syncPlayers() {
    const player = this.getStatePlayers();
    for (const playerNumber in player) {
      if(!this.state.players[playerNumber]) {
        this.state.players[playerNumber] = player[playerNumber];
      } else if (this.state.players[playerNumber] !== player[playerNumber]) {
        console.warn(`Player ${playerNumber} state changed from ${this.state.players[playerNumber]} to ${player[playerNumber]}`);
        this.state.players[playerNumber] = player[playerNumber];
      }
    }
  }

  onPostUpdate(engine: Engine, delta: number) {
    super.onPostUpdate(engine, delta);
    this.syncPlayers();
  }

  /** Current active players of this map scene */
  public getStatePlayers(): MapSceneState['players'] {
    // Do not send updates for other players, because they are not controlled by us
    const result: MapSceneState['players'] = {};
    const currentPlayer = this.getPlayer();
    const playerNumber = currentPlayer?.player?.playerNumber || this.gameOptions.playerNumber;
    if(currentPlayer?.state) {
      result[playerNumber] = currentPlayer?.state;
    }
    return result;
  }

  /**
   * Get the map data like players, NPCs, name, etc.
   * @returns 
   */
  public initState(state: Partial<MapSceneState>): MapSceneState {
    this._state = {...this._state, ...state};
    this.state.players = this.getStatePlayers();
    return proxy(this.state);
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

  getPlayers() {
    return this.playerQuery.getEntities() as PrpgPlayerActor[];
  }

  /**
   * Get current player (you control) of this map scene
   */
  getPlayer() {
    const playerActors = this.playerQuery.getEntities() as PrpgPlayerActor[];
    return playerActors.find(playerActor => playerActor.player?.isCurrentPlayer);
  }

  public deserializePlayers(playersData: MapSceneState['players']) {
    const playerActors = this.playerQuery.getEntities() as PrpgPlayerActor[];
    // TODO: It would be faster if we have the same entity id here if the is the same on each player instance but this must be implemented in Excalibur
    for (const playerActor of playerActors) {
      const playerNumber = playerActor.state.player?.playerNumber;
      if(playerNumber === undefined) {
        continue;
      }
      const updatePlayer = playersData[playerNumber]

      // If the other player is not on the map, remove it
      if(!updatePlayer && !playerActor.player?.isCurrentPlayer) {
        this.logger.warn(`Remove player ${playerNumber} from map ${this.name}`);
        this.world.remove(playerActor, false);
        continue;
      }
      playerActor.deserialize(updatePlayer);
    }

    // Add new players on the map
    for (const playerNumber in playersData) {
      const playerData = playersData[playerNumber];
      const playerActor = playerActors.find(playerActor => playerActor.player?.playerNumber === playerData?.player?.playerNumber);
      if(!playerActor && playerData?.player?.playerNumber) {
        const missingPlayer = PrpgPlayerActor.getPlayer(this.gameOptions, playerData.player.playerNumber);
        if(!missingPlayer) {
          continue;
        }
        missingPlayer.deserialize(playerData);
        this.add(missingPlayer);
      }
    }
  }

  public deserialize(map: MapSceneState) {
    if(map.name === this.name) {
      return this.deserializePlayers(map.players);
    }
  }
}