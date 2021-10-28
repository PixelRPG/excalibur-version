import { Experiments, Flags, Engine, Input, Loader, vec, Actor, Color, DisplayMode } from 'excalibur';

import { PrpgPlayerActor } from './actors/player.actor';
import { Resources } from "./resources";

import { PrpgPlayerSystem } from "./systems/player.system";

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

   game.currentScene.world.add(new PrpgPlayerSystem(game));

   console.debug("pixelRatio", game.pixelRatio);
   console.debug("isHiDpi", game.isHiDpi);
   
   // game.toggleDebug();
   
   const player = new PrpgPlayerActor();

   game.add(player);

   const loader = new Loader([Resources.map, Resources.misa]);
   loader.backgroundColor = Color.Black.toString();
   await game.start(loader)

   const mapProperties = Resources.map.data.getExcaliburObjects();

   console.debug("map camera zoom", mapProperties[0].getCamera().zoom);

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

   Resources.map.addTiledMapToScene(game.currentScene);
}

start();
