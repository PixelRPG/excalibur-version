import { Color, GameEvent } from 'excalibur';
import { PrpgEngine } from './engine';
import { GameState, GameUpdates } from './types';
import { GameStateFullEvent, GameStateUpdateEvent, GameMessageEvent } from './events/index';
import { encode, decode } from "@msgpack/msgpack";
import { extractPlayerNumber } from './utilities';

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
      console.debug(`player ${playerScreen.gameOptions.playerNumber} received full state`, s);
      for (const otherPlayerScreen of PrpgGame.screens) {
        if (otherPlayerScreen === playerScreen) continue;
        otherPlayerScreen.applyUpdates(s);
      }
    }

    private onMultiplayerUpdateEvent(playerScreen: PrpgEngine, event: GameStateUpdateEvent) {
      const updates = event.update;
      console.debug("decode updates", updates);
      // Simulate network serialize and deserialize
      const s = decode(encode(updates)) as GameUpdates;
      console.debug(`player ${playerScreen.gameOptions.playerNumber} received update changes`, s);
      for (const otherPlayerScreen of PrpgGame.screens) {
        if (otherPlayerScreen === playerScreen) continue;
        otherPlayerScreen.applyUpdates(s);
      }
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
    private onMultiplayerTeleportMessageEvent(playerScreen: PrpgEngine, event: GameMessageEvent) {
      const message = event.info;
      console.debug(`player ${playerScreen.gameOptions.playerNumber} received teleport message from ${message.from} to ${message.to || 'all'} player`, message);
    }

    /**
     * On ask for full state message from another player
     * @param playerScreen 
     * @param event 
     */
    private onMultiplayerAskForFullStateMessageEvent(playerScreen: PrpgEngine, event: GameMessageEvent) {
      const message = event.info;
      const fromPlayerNumber = extractPlayerNumber(message.from);
      console.debug(`player ${playerScreen.gameOptions.playerNumber} received ask-for-full-state message from ${message.from} to ${message.to || 'all'} player`, message);
      if(playerScreen.gameOptions.playerNumber !== fromPlayerNumber) {
        playerScreen.sendMultiplayerFullState();
      }
    }

    private subscribePlayer(playerScreen: PrpgEngine) {
      // Update comes from another player
      playerScreen.events.on('multiplayer:update', this.onMultiplayerUpdateEvent.bind(this, playerScreen));

      // Full state comes from another player
      playerScreen.events.on('multiplayer:state', this.onMultiplayerStateEvent.bind(this, playerScreen));

      // A message comes from another player
      playerScreen.events.on('multiplayer:message', this.onMultiplayerMessageEvent.bind(this, playerScreen));

      // A teleport message comes from another player
      playerScreen.events.on('multiplayer:message:teleport', this.onMultiplayerTeleportMessageEvent.bind(this, playerScreen));

      // A teleport message comes from another player
      playerScreen.events.on('multiplayer:message:ask-for-full-state', this.onMultiplayerAskForFullStateMessageEvent.bind(this, playerScreen));

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