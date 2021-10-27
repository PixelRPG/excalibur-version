import { Experiments, Flags, Engine, Input, Loader, vec, Actor, Color }from 'excalibur';

import { Player } from './player';
import { Resources } from "./resources";

Flags.enable(Experiments.WebGL);
const game = new Engine({ 
   width: 800, 
   height: 600,
   canvasElementId: 'game',
   pointerScope: Input.PointerScope.Canvas,
   antialiasing: false,
   snapToPixel: false,
   suppressPlayButton: true,
});

// game.toggleDebug();

const start = async () => {
   let player = new Player();

   game.currentScene.camera.strategy.elasticToActor(player, .8, .9);
   
   player.onPostUpdate = () => {
      player.vel.setTo(0, 0);
      const speed = 64;
      if (game.input.keyboard.isHeld(Input.Keys.Right)) {
         player.vel.x = speed;
      }
      if (game.input.keyboard.isHeld(Input.Keys.Left)) {
         player.vel.x = -speed;
      }
      if (game.input.keyboard.isHeld(Input.Keys.Up)) {
         player.vel.y = -speed;
      }
      if (game.input.keyboard.isHeld(Input.Keys.Down)) {
         player.vel.y = speed;
      }
   }
   game.add(player);

   const loader = new Loader([Resources.map, Resources.misa]);
   await game.start(loader)
   player.pos = vec(100, 100);
   const excalibur = Resources.map.data.getExcaliburObjects();
   if (excalibur.length > 0) {
      const start = excalibur[0].getObjectByName('player-start');
      if (start) {
         player.pos.x = start.x;
         player.pos.y = start.y;
      }

      // Use polyline for patrols
      const lines = excalibur[0].getPolyLines();
      for (let line of lines) {
         if (line && line.polyline) {
            const start = vec(line.x, line.y);
            const firstpoint = line.polyline[0];
            const patrol = new Actor({x: line.x + firstpoint.x, y: line.y + firstpoint.y, color: Color.Green, width: 25, height: 25});
            patrol.actions.repeatForever(ctx => {
               for (const p of (line.polyline ?? [])) {
                  ctx.moveTo(p.x + start.x, p.y + start.y, 100);
               }
            });
            game.add(patrol);
         }
      }

      // Use polygon for patrols
      const polys = excalibur[0].getPolygons();
      for (let poly of polys) {
         poly.polygon?.push(poly.polygon[0]); // needs to end where it started
         if (poly && poly.polygon) {
            const start = vec(poly.x, poly.y);
            const firstpoint = poly.polygon[0];
            const patrol = new Actor({x: poly.x + firstpoint.x, y: poly.y + firstpoint.y, color: Color.Green, width: 25, height: 25});
            patrol.actions.repeatForever(ctx => {
               for (const p of (poly.polygon ?? [])) {
                  ctx.moveTo(p.x + start.x, p.y + start.y, 100);
               }
            })
            game.add(patrol);
         }
      }
   }
   // Camera init bug :( forcing a a hack
   setTimeout(() => {
      game.currentScene.camera.x = player.pos.x;
      game.currentScene.camera.y = player.pos.y;
   });
   Resources.map.addTiledMapToScene(game.currentScene);
}

start();
