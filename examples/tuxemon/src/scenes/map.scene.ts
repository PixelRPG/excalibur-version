import { Scene, Logger, Query } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import { PrpgCharacterSystem, PrpgPlayerSystem, PrpgTeleportSystem, PrpgMapSystem, PrpgFadeSystem } from '../systems';
import { newMapEntity, newSpawnPointEntity } from '../entities';
import { PrpgPlayerActor } from '../actors';
import { PrpgFadeScreenElement } from '../screen-elements';
import { PrpgMapComponent, PrpgPlayerComponent, PrpgTeleportableComponent, PrpgFadeScreenComponent } from '../components';
import { PrpgComponentType, SpawnPointType } from '../types';
import type { GameOptions, SpawnPoint } from '../types';

// enum ActivationTrigger {
//   NEW_GAME,
//   LOAD_GAME,
//   TELEPORT
// }
// interface MapSceneActivationSettings {
//   trigger: ActivationTrigger;
// }

export class MapScene extends Scene {

  public logger = Logger.getInstance();
  private mapQuery: Query<PrpgMapComponent>;
  private playerQuery: Query<PrpgPlayerComponent>;
  private fadeQuery: Query<PrpgFadeScreenComponent>;


  // private activationSettings: MapSceneActivationSettings = {
  //   trigger: ActivationTrigger.NEW_GAME
  // }

  constructor(private readonly map: TiledMapResource, public readonly name: string, private readonly gameOptions: GameOptions) {
    super();
    this.add(newMapEntity(map, name));
    this.mapQuery = this.world.queryManager.createQuery([PrpgComponentType.TILED_MAP]);
    this.playerQuery = this.world.queryManager.createQuery<PrpgPlayerComponent>([PrpgComponentType.PLAYER]);
    this.fadeQuery = this.world.queryManager.createQuery<PrpgFadeScreenComponent>([PrpgComponentType.FADE_SCREEN]);
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
  
  /** Current active players of this map scene */
  public serializePlayers() {
    const players: ReturnType<PrpgPlayerActor['serialize']>[] = [];
    const playerActors = this.playerQuery.getEntities() as PrpgPlayerActor[];
    for (const playerActor of playerActors) {
      const player = playerActor.serialize();
      if(!player) {
        continue;
      }
      players.push(player);
    }
    return players;
  }

  public deserializePlayers(playersData: ReturnType<PrpgPlayerActor['serialize']>[]) {
    const playerActors = this.playerQuery.getEntities() as PrpgPlayerActor[];
    // TODO: It would be faster if we have the same entity id here if the is the same on each player instance but this must be implemented in Excalibur
    for (const playerActor of playerActors) {
      const updatePlayer = playersData.find(playerData => playerData?.player?.playerNumber === playerActor.player?.data.playerNumber);

      // If the other player is not on the map, remove it
      if(!updatePlayer && !playerActor.player?.data.isCurrentPlayer) {
        this.world.remove(playerActor, false);
        continue;
      }
      playerActor.deserialize(updatePlayer);
    }

    // Add new players on the map
    for (const playerData of playersData) {
      const playerActor = playerActors.find(playerActor => playerActor.player?.data.playerNumber === playerData?.player?.playerNumber);
      if(!playerActor && playerData?.player.playerNumber) {
        const missingPlayer = PrpgPlayerActor.getPlayer(this.gameOptions, playerData.player.playerNumber);
        if(!missingPlayer) {
          continue;
        }
        missingPlayer.deserialize(playerData);
        this.add(missingPlayer);
      }
    }
  }


  /**
   * Get the map data like players, NPCs, name, etc.
   * @returns 
   */
  public serialize() {
    const players = this.serializePlayers();
    return {
      name: this.name,
      players
    }
  }

  public deserialize(map: ReturnType<MapScene['serialize']>) {
    if(map.name === this.name) {
      this.deserializePlayers(map.players);
    }
  }
}