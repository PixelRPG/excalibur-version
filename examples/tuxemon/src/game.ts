import { Color, GameEvent } from 'excalibur';
import { PrpgEngine } from './engine';
import { PrpgPlayerActor } from './actors/player.actor';
import { PrpgComponentType, GameOptions } from './types';
import { GameState, GameUpdates, MultiplayerMessageInfo, TeleportMessage } from './types';
import { GameStateFullEvent, GameStateUpdateEvent, GameMessageEvent } from './events/index';
import { encode, decode } from "@msgpack/msgpack";
import { extractPlayerNumber } from './utilities';
import { PrpgBodyComponent, PrpgPlayerComponent } from './components';
import { findEntityByNameInMapScenes } from './utilities';

/** The (multiplayer) Game */
export class PrpgGame {
    /** One instance per player in splitscreen */
    static screens: PrpgEngine[] = [];

    constructor(public players = 2) {
      this.setPlayersHTMLClass();
    }

    private setPlayersHTMLClass() {
      const htmlWrapperEl = document.querySelector('.players');
      if(!htmlWrapperEl) {
        throw new Error('No .players element found in HTML');
      }
      htmlWrapperEl.classList.remove('players-1');
      htmlWrapperEl.classList.add(`players-${this.players}`);
    }


    /**
     * One full screen if no splitscreen, multiple if splitscreen for each player.
     */
    private createPlayerScreens() {
      for (let playerNumber = 1; playerNumber <= this.players; playerNumber++) {
        // For debugging, set different background colors for each player
        const backgroundColor = playerNumber == 1 ? Color.Black : playerNumber == 2 ? Color.Blue : playerNumber == 3 ? Color.Green : Color.Orange; 
        const player = new PrpgEngine({ backgroundColor }, { playerNumber, players: this.players});
        PrpgGame.screens.push(player);
      }

      return PrpgGame.screens;
    }

    private onMultiplayerStateEvent(playerScreen: PrpgEngine, event: GameStateFullEvent) {
      const state = event.state;
      // Simulate network serialize and deserialize
      const s = decode(encode(state)) as GameState;
      for (const otherPlayerScreen of PrpgGame.screens) {
        if (otherPlayerScreen === playerScreen) continue;
        console.debug(`player ${otherPlayerScreen.gameOptions.playerNumber} received full state`, s);
        otherPlayerScreen.applyUpdates(s);
      }
    }

    private onMultiplayerUpdateEvent(playerScreen: PrpgEngine, event: GameStateUpdateEvent) {
      const updates = event.update;
      console.debug("decode updates", updates);
      // Simulate network serialize and deserialize
      const s = decode(encode(updates)) as GameUpdates;
      for (const otherPlayerScreen of PrpgGame.screens) {
        if (otherPlayerScreen === playerScreen) continue;
        console.debug(`player ${otherPlayerScreen.gameOptions.playerNumber} received update changes`, s);
        otherPlayerScreen.applyUpdates(s);
      }
    }

    private multiplayerMessageIsForPlayerScreen(playerScreen: PrpgEngine, event: GameMessageEvent) {
      const message = event.info;
      const fromPlayerNumber = extractPlayerNumber(message.from);

      // Ignore if it's from myself
      if(playerScreen.gameOptions.playerNumber === fromPlayerNumber) {
        return false
      }

      return message.to === 'all' || message.to === `player-` + playerScreen.gameOptions.playerNumber.toString();
    }

    /**
     * On a message from another player
     * @param playerScreen 
     * @param event 
     */
    private onMultiplayerMessageEvent(playerScreen: PrpgEngine, event: GameMessageEvent) {
      const message = event.info;

      console.debug(`player ${playerScreen.gameOptions.playerNumber} received message from ${message.from} to ${message.to || 'all'} player`, message);
    }

    /**
     * On a teleport message from another player
     * @param playerScreen 
     * @param event 
     */
    private onMultiplayerTeleportMessageEvent(playerScreen: PrpgEngine, event: GameMessageEvent<TeleportMessage>) {
      const message = event.info;

      console.debug(`[onMultiplayerTeleportMessageEvent] player ${playerScreen.gameOptions.playerNumber} received teleport message from ${message.from} to ${message.to || 'all'} player`, message);

      const teleportsFromMapName = message.data.from.sceneName;
      const fromScene = playerScreen.getMapScene(teleportsFromMapName);
      const teleportTo = message.data.to;
      const toScene = playerScreen.getMapScene(teleportTo.sceneName);
      const teleportEntityName = message.data.to.entityName;

      if(!toScene) {
        console.error(`[onMultiplayerTeleportMessageEvent][${playerScreen.gameOptions.playerNumber}] No target scene found with name ${teleportTo.sceneName}`);
        return;
      }

      if(!fromScene) {
        console.warn(`[onMultiplayerTeleportMessageEvent][${playerScreen.gameOptions.playerNumber}] No source scene found with name ${teleportsFromMapName}`);
      }

      const entry = fromScene?.getEntityByName(message.data.to.entityName) || findEntityByNameInMapScenes(playerScreen.gameOptions, teleportEntityName);

      if(!entry) {
        console.error(`[onMultiplayerTeleportMessageEvent][${playerScreen.gameOptions.playerNumber}] No entity found with name ${teleportEntityName}`);
        return;
      }

      const player = entry.get(PrpgPlayerComponent);
      const body = entry.get(PrpgBodyComponent);

      if(player) {
        toScene.transferPlayer(entry as PrpgPlayerActor);
      } else {
        toScene.transfer(entry);
      }

      if(body) {
        body.setPos(teleportTo.x, teleportTo.y);
      }

      console.debug(`[onMultiplayerTeleportMessageEvent][${playerScreen.gameOptions.playerNumber}] transferred`)

      return;
      
    }

    /**
     * On ask for full state message from another player
     * @param playerScreen 
     * @param event 
     */
    private onMultiplayerAskForFullStateMessageEvent(playerScreen: PrpgEngine, event: GameMessageEvent) {
      const message = event.info;
      console.debug(`player ${playerScreen.gameOptions.playerNumber} received ask-for-full-state message from ${message.from} to ${message.to || 'all'} player`, message);
      
      playerScreen.emitMultiplayerFullState();
    }

    private sendMultiplayerMessage(eventName: string, event: GameMessageEvent) {
      // Send message to split screens
      for (const playerScreen of PrpgGame.screens) {
        if(!this.multiplayerMessageIsForPlayerScreen(playerScreen, event)) {
          continue
        }

        switch (eventName) {
          case 'multiplayer:message':
            this.onMultiplayerMessageEvent(playerScreen, event)
            break;
          case 'multiplayer:message:teleport':
            this.onMultiplayerTeleportMessageEvent(playerScreen, event)
            break;
          case 'multiplayer:message:ask-for-full-state':
            this.onMultiplayerAskForFullStateMessageEvent(playerScreen, event)
            break;
          default:
            console.error('Unknown event name', eventName)
            break;
        }
      }

      // TODO: Send message to other players over network
    }

    private subscribePlayer(playerScreen: PrpgEngine) {
      // Update comes from another player
      playerScreen.events.on('multiplayer:update', this.onMultiplayerUpdateEvent.bind(this, playerScreen));

      // Full state comes from another player
      playerScreen.events.on('multiplayer:state', this.onMultiplayerStateEvent.bind(this, playerScreen));

      // A message comes from another player
      playerScreen.events.on('multiplayer:message', this.sendMultiplayerMessage.bind(this, 'multiplayer:message'));

      // A teleport message comes from another player
      playerScreen.events.on('multiplayer:message:teleport', this.sendMultiplayerMessage.bind(this, 'multiplayer:message:teleport'));

      // A teleport message comes from another player
      playerScreen.events.on('multiplayer:message:ask-for-full-state', this.sendMultiplayerMessage.bind(this, 'multiplayer:message:ask-for-full-state'));

    }

    private subscribePlayers() {
      for (const playerScreen of PrpgGame.screens) {
        this.subscribePlayer(playerScreen);
      }
    }

    private startPlayerScreens() {
      for (const player of PrpgGame.screens) {
        player.start();
      }
    }

    public start() {
      this.createPlayerScreens();
      this.subscribePlayers();
      this.startPlayerScreens();
    }
}