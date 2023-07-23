import { Class, Color, GameEvent } from 'excalibur';
import { PrpgEngine } from './engine';
import { GameState, GameUpdates } from './types';
import { encode, decode } from "@msgpack/msgpack";

export class PrpgGame extends Class {
    /** One instance per player in splitscreen */
    static screens: PrpgEngine[] = [];

    constructor(public players = 2) {
      super();
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
    createPlayerScreens() {
      for (let playerNumber = 1; playerNumber <= this.players; playerNumber++) {
        // For debugging, set different background colors for each player
        const backgroundColor = playerNumber == 1 ? Color.Black : playerNumber == 2 ? Color.Blue : playerNumber == 3 ? Color.Green : Color.Orange; 
        const player = new PrpgEngine({ backgroundColor }, { playerNumber, players: this.players});
        PrpgGame.screens.push(player);
      }

      return PrpgGame.screens;
    }

    subscribeToPlayerState() {
      for (const playerScreen of PrpgGame.screens) {

        // Updates sync
        playerScreen.on('update', (event) => {
          const updates = event.target as GameUpdates;
          // Simulate network serialize and deserialize
          const s = decode(encode(updates)) as GameUpdates;
          console.debug(`player ${playerScreen.gameOptions.playerNumber} updates changed, sync to other players`, s);
          for (const otherPlayerScreen of PrpgGame.screens) {
            if (otherPlayerScreen === playerScreen) continue;
            otherPlayerScreen.applyUpdates(s);
          }
        });

        // Full state sync
        // playerScreen.on('state', (event) => {
        //   const state = event.target as GameState;
        //   // Simulate network serialize and deserialize
        //   const s = decode(encode(state)) as GameState;
        //   // console.debug(`player ${playerScreen.gameOptions.playerNumber} updates changed, sync to other players`, s);
        //   for (const otherPlayerScreen of PrpgGame.screens) {
        //     if (otherPlayerScreen === playerScreen) continue;
        //     otherPlayerScreen.applyUpdates(s);
        //   }
        // });
      }
    }

    startPlayerScreens() {
      for (const player of PrpgGame.screens) {
        player.start();
      }
    }

    start() {
      this.createPlayerScreens();
      this.subscribeToPlayerState();
      this.startPlayerScreens();
    }
}