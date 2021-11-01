import { Flags, Engine, Input, Loader, Color, DisplayMode } from 'excalibur';
import { Resources } from "./resources";
import { MapScene } from "./scenes/map.scene";

Flags.useWebGL();
// Flags.useCanvasGraphicsContext();

const start = async () => {

   const game = new Engine({ 
      displayMode: DisplayMode.FillScreen,
      canvasElementId: 'game',
      pointerScope: Input.PointerScope.Canvas,
      antialiasing: false,
      snapToPixel: true,
      suppressPlayButton: false,
      backgroundColor: Color.Black,
   });

   game.add('map', new MapScene(Resources.map));
   game.goToScene('map');

   console.debug("pixelRatio", game.pixelRatio);
   console.debug("isHiDpi", game.isHiDpi);
   
   // game.toggleDebug();

   const loader = new Loader([Resources.map, Resources.misa]);
   loader.backgroundColor = Color.Black.toString();
   await game.start(loader)
}

start();
