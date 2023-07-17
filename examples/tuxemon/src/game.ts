import { Class, Color, GameEvent } from 'excalibur';
import { subscribe } from 'valtio';
import { PrpgEngine } from './engine';
import { GameState } from './types';

export class PrpgGame extends Class {
    /** One instance per player in splitscreen */
    static instances: PrpgEngine[] = [];

    start() {
        const player1 = new PrpgEngine({}, { playerNumber: 1, players: 2});
        const player2 = new PrpgEngine({ backgroundColor: Color.Blue }, { playerNumber: 2, players: 2});
        // const player3 = new PrpgEngine({ backgroundColor: Color.Green }, { playerNumber: 3});
        // const player4 = new PrpgEngine({ backgroundColor: Color.Orange }, { playerNumber: 4});

        PrpgGame.instances.push(player1, player2);

        const p1Unsubscribe = subscribe(player1.state, () => {
          // const s = JSON.parse(JSON.stringify(player1.state)) as GameState;
          const s = player1.state;
          console.debug('player1.state changed, sync to player2', s);
          player2.deserialize(s);
        });

        const p2Unsubscribe = subscribe(player2.state, () => {
          // const s = JSON.parse(JSON.stringify(player2.state)) as GameState;
          const s = player2.state;
          console.debug('player2.state changed, sync to player1', s);
          player1.deserialize(s);
        });
        
        // // Simulate sending data from player 1 to player 2
        // player1.on('sceneUpdate', (data: GameEvent<GameState>) => {
        //   const s = JSON.parse(JSON.stringify(data.target)) as GameState;
        //   console.debug('player1.sceneUpdate', s);
        //   player2.deserialize(s);
        // //   player3.deserialize(data);
        // //   player4.deserialize(data);
        // });
        
        // // Simulate sending data from player 2 to player 1
        // player2.on('sceneUpdate', (data: GameEvent<GameState>) => {
        //   const s = JSON.parse(JSON.stringify(data.target)) as GameState;
        //   console.debug('player2.sceneUpdate', s);
        //   player1.deserialize(s);
        // //   player3.deserialize(data);
        // //   player4.deserialize(data);
        // });



        player1.start();
        player2.start();
        // player3.start();
        // player4.start();
    }
}