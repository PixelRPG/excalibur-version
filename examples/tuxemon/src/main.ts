import {
  Flags,
  Engine,
  Input,
  Loader,
  Color,
  DisplayMode,
  GamepadConnectEvent,
  GamepadDisconnectEvent,
  Logger,
  GamepadButtonEvent,
  LogLevel,
  GamepadAxisEvent
} from 'excalibur';
import { resources } from './resources';

// Scenes
import { MapScene } from './scenes/map.scene';

Flags.useWebGL();
// Flags.useCanvasGraphicsContext();

export class PixelRPG {

  private logger = Logger.getInstance();
  private engine: Engine;

  constructor() {
    this.engine = new Engine({
      displayMode: DisplayMode.FillScreen,
      canvasElementId: 'game',
      pointerScope: Input.PointerScope.Canvas,
      antialiasing: false,
      snapToPixel: true,
      suppressPlayButton: true,
      backgroundColor: Color.Black
    });
  }

  public addMaps() {
    const mapNames = Object.keys(resources.maps);
    for (const mapName of mapNames) {
      if (resources.maps[mapName]) {
        this.engine.add(mapName, new MapScene(resources.maps[mapName], mapName));
      }
    }
  }

  public async start() {


    // Enable Gamepad support
    this.engine.input.gamepads.enabled = true;
    this.engine.input.gamepads.setMinimumGamepadConfiguration({
      axis: 0,
      buttons: 8
    });

    // Log when pads disconnect and connect
    this.engine.input.gamepads.on('connect', (evet: GamepadConnectEvent) => {
      this.logger.debug('Gamepad connect');
    });

    this.engine.input.gamepads.on('disconnect', (evet: GamepadDisconnectEvent) => {
      this.logger.debug('Gamepad disconnect');
    });

    this.engine.input.gamepads.at(0).on('button', (ev: GamepadButtonEvent) => {
      this.logger.debug('button', ev.button, ev.value);
    });

    this.engine.input.gamepads.at(0).on('axis', (ev: GamepadAxisEvent) => {
      this.logger.debug('axis', ev.axis, ev.value);
    });

    this.addMaps();

    this.engine.goToScene('player_house_bedroom.tmx');

    this.logger.debug('pixelRatio', this.engine.pixelRatio);
    this.logger.debug('isHiDpi', this.engine.isHiDpi);

    this.logger.defaultLevel = LogLevel.Debug;

    const loader = new Loader([...resources.getMapArr(), ...resources.getSpriteArr()]);
    loader.backgroundColor = Color.Black.toString();
    await this.engine.start(loader);
  };
}

const pixelRpg = new PixelRPG();
pixelRpg.start();
