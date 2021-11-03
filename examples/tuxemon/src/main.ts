import { Flags, Engine, Input, Loader, Color, DisplayMode, GamepadConnectEvent, GamepadDisconnectEvent, Logger, GamepadButtonEvent, LogLevel, GamepadAxisEvent } from 'excalibur';
import { Resources } from "./resources";
import { MapScene } from "./scenes/map.scene";

Flags.useWebGL();
// Flags.useCanvasGraphicsContext();

const start = async () => {


   const logger = Logger.getInstance();
   const game = new Engine({ 
      displayMode: DisplayMode.FillScreen,
      canvasElementId: 'game',
      pointerScope: Input.PointerScope.Canvas,
      antialiasing: false,
      snapToPixel: true,
      suppressPlayButton: false,
      backgroundColor: Color.Black,
   });

   // Enable Gamepad support
   game.input.gamepads.enabled = true;
   game.input.gamepads.setMinimumGamepadConfiguration({
      axis: 0,
      buttons: 8,
   });

   // Log when pads disconnect and connect
   game.input.gamepads.on('connect', (evet: GamepadConnectEvent) => {
      logger.debug('Gamepad connect');
   });

   game.input.gamepads.on('disconnect', (evet: GamepadDisconnectEvent) => {
      logger.debug('Gamepad disconnect');
   });

   game.input.gamepads.at(0).on('button', (ev: GamepadButtonEvent) => {
      logger.debug('button', ev.button, ev.value);
   });

   game.input.gamepads.at(0).on('axis', (ev: GamepadAxisEvent) => {
      logger.debug('axis', ev.axis, ev.value);
   });

   game.add('map', new MapScene(Resources.map));
   game.goToScene('map');

   logger.debug("pixelRatio", game.pixelRatio);
   logger.debug("isHiDpi", game.isHiDpi);
   
   // game.toggleDebug();
   logger.defaultLevel = LogLevel.Debug;

   const loader = new Loader([Resources.map, Resources.scientist]);
   loader.backgroundColor = Color.Black.toString();
   await game.start(loader)
}

start();
