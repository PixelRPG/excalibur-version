import { PrpgEngine } from './engine';

const player1 = new PrpgEngine({}, { playerNumber: 1});
const player2 = new PrpgEngine({}, { playerNumber: 2});

player1.start();
player2.start();

// Simulate sending data from player 1 to player 2
player1.on('sceneUpdate', (data: any) => {
  player2.deserialize(data);
});

// Simulate sending data from player 2 to player 1
player2.on('sceneUpdate', (data: any) => {
  player1.deserialize(data);
});