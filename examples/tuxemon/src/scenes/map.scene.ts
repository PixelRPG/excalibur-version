import { Scene, Logger, Query, Entity } from 'excalibur';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import { PrpgCharacterSystem, PrpgPlayerSystem, PrpgTeleporterSystem, PrpgMapSystem } from '../systems';
import { newMapEntity } from '../entities';
import { PrpgPlayerActor } from '../actors';
import { PrpgMapComponent, PrpgPlayerComponent } from '../components';
import { PrpgComponentType } from '../types';
import type { GameOptions } from '../types';

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

  // private activationSettings: MapSceneActivationSettings = {
  //   trigger: ActivationTrigger.NEW_GAME
  // }

  constructor(private readonly map: TiledMapResource, private readonly name: string, private readonly gameOptions: GameOptions) {
    super();
    this.world.add(newMapEntity(map, name));
    this.mapQuery = this.world.queryManager.createQuery([PrpgComponentType.TILED_MAP]);
    this.playerQuery = this.world.queryManager.createQuery<PrpgPlayerComponent>([PrpgComponentType.PLAYER]);
  }

  public onInitialize() {
    this.world.add(new PrpgMapSystem(this.gameOptions));
    this.world.add(new PrpgCharacterSystem());
    this.world.add(new PrpgPlayerSystem(this.gameOptions));
    this.world.add(new PrpgTeleporterSystem(this.gameOptions));
  }

  getMap() {
    const mapEntities = this.mapQuery.getEntities();
    for (const mapEntity of mapEntities) {
      const tiledMap = mapEntity.get(PrpgMapComponent);
      return tiledMap;
    }
  }

  /**
   * Transfer an entry to a new map.
   * Removes the entry from the current map and add it to the target map
   */
  transfer(entity: Entity, targetScene: MapScene) {
    this.world.remove(entity, false); // false means non-deferred removal, see https://github.com/excaliburjs/Excalibur/issues/2687
    targetScene.add(entity);
  }
  
  /** Current active players of this map scene */
  serializePlayers() {
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

  deserializePlayers(playersData: ReturnType<PrpgPlayerActor['serialize']>[]) {
    const playerActors = this.playerQuery.getEntities() as PrpgPlayerActor[];
    // TODO: It would be faster if we have the same entry id here if the is the same on each player instance but this must be implemented in Excalibur
    for (const playerActor of playerActors) {
      const updatePlayer = playersData.find(playerData => playerData.player?.playerNumber === playerActor.player?.playerNumber);
      if(!updatePlayer) {
        continue;
      }
      playerActor.deserialize(updatePlayer);
    }
  }


  /**
   * Get the map data like players, npcs, name, etc.
   * @returns 
   */
  serialize() {
    const players = this.serializePlayers();
    return {
      name: this.name,
      players
    }
  }

  deserialize(map: ReturnType<MapScene['serialize']>) {
    const { players, name } = map;
    if(name === this.name) {
      this.deserializePlayers(players);
    } else {
      this.logger.warn(`Map name mismatch. Expected ${this.name} but got ${name}`);
    }
  }
}