import { Class, Color } from 'excalibur';
import { PrpgEngine } from './engine';
import { Doc, applyUpdate } from 'yjs';

export class PrpgGame extends Class {
    /** One instance per player in splitscreen */
    static instances: PrpgEngine[] = [];

    start() {
        const player1 = new PrpgEngine({}, { playerNumber: 1});
        const player2 = new PrpgEngine({ backgroundColor: Color.Blue }, { playerNumber: 2});
        // const player3 = new PrpgEngine({ backgroundColor: Color.Green }, { playerNumber: 3});
        // const player4 = new PrpgEngine({ backgroundColor: Color.Orange }, { playerNumber: 4});

        PrpgGame.instances.push(player1, player2);
        
        // Simulate sending data from player 1 to player 2
        player1.on('sceneUpdate', (data: any) => {
          player2.deserialize(data);
        //   player3.deserialize(data);
        //   player4.deserialize(data);
        });
        
        // Simulate sending data from player 2 to player 1
        player2.on('sceneUpdate', (data: any) => {
          player1.deserialize(data);
        //   player3.deserialize(data);
        //   player4.deserialize(data);
        });

        // // Simulate sending data from player 2 to player 1
        // player3.on('sceneUpdate', (data: any) => {
        //     player1.deserialize(data);
        //     player2.deserialize(data);
        //     player4.deserialize(data);
        // });

        // // Simulate sending data from player 2 to player 1
        // player4.on('sceneUpdate', (data: any) => {
        //     player1.deserialize(data);
        //     player2.deserialize(data);
        //     player3.deserialize(data);
        // });

        player1.start();
        player2.start();
        // player3.start();
        // player4.start();
    }
}