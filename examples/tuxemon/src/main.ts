import { Experiments, Flags, Engine, Input, Loader, vec, Actor, Color, DisplayMode, BoundingBox } from 'excalibur';

import { Player } from './player';
import { Resources } from "./resources";

Flags.enable(Experiments.WebGL);

const start = async () => {

   const game = new Engine({ 
      // width:  window.innerWidth, 
      // height:  window.innerHeight,
      // viewport: {
      //    width:  window.innerWidth, 
      //    height:  window.innerHeight,
      // },
      // resolution: {
      //    height: window.innerHeight,
      //    width: window.innerWidth,
      // },
      displayMode: DisplayMode.FillScreen,
      canvasElementId: 'game',
      pointerScope: Input.PointerScope.Canvas,
      antialiasing: false,
      snapToPixel: true,
      suppressPlayButton: true,
      backgroundColor: Color.Black,
   });

   console.debug("pixelRatio", game.pixelRatio);
   console.debug("isHiDpi", game.isHiDpi);
   
   // game.toggleDebug();
   
   const player = new Player();  
   
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
   loader.backgroundColor = Color.Black.toString();
   await game.start(loader)
   player.pos = vec(100, 100);
   const mapProperties = Resources.map.data.getExcaliburObjects();

   console.debug("map camera zoom", mapProperties[0].getCamera().zoom);


   game.currentScene.camera.strategy.elasticToActor(player, .9, .9);
   game.currentScene.camera.strategy.lockToActor(player);
   const mapBox = new BoundingBox({
      left: 0,
      top: 0,
      right: Resources.map.data.width * Resources.map.data.tileWidth,
      bottom: Resources.map.data.height * Resources.map.data.tileHeight,
      
   });
   game.currentScene.camera.strategy.limitCameraBounds(mapBox);

   if (mapProperties.length > 0) {
      const start = mapProperties[0].getObjectByName('player-start');
      if (start) {
         player.pos.x = start.x;
         player.pos.y = start.y;
      }

      // Use polyline for patrols
      const lines = mapProperties[0].getPolyLines();
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
      const polys = mapProperties[0].getPolygons();
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
   // setTimeout(() => {
   //    game.currentScene.camera.x = player.pos.x;
   //    game.currentScene.camera.y = player.pos.y;
   // });
   Resources.map.addTiledMapToScene(game.currentScene);
}

start();
