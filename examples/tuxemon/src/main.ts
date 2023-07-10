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
// import { DevTool } from '@excaliburjs/dev-tools';
import { resources, StateManager } from './managers/index';

// Scenes
import { MapScene } from './scenes/map.scene';

import type { GameOptions } from './types';

// Flags.useWebGL();
// Flags.useCanvasGraphicsContext();
// Flags.useLegacyDrawing();

export class PixelRPG {

  private logger = Logger.getInstance();
  private engine: Engine;
  private state: StateManager; 

  constructor(readonly options: GameOptions) {
    this.engine = new Engine({
      displayMode: DisplayMode.FitContainerAndFill,
      canvasElementId: 'p'  + options.playerNumber,
      pointerScope: Input.PointerScope.Canvas,
      antialiasing: false,
      snapToPixel: false,
      suppressPlayButton: true, // Disable play button, enable to fix audio issue, currently only used for dev
      backgroundColor: Color.Black
    });
    this.state = StateManager.getSingleton(options);
    // new DevTool(this.engine);
  }

  public addMapScenes() {
    const mapNames = Object.keys(resources.maps);
    for (const mapName of mapNames) {
      if (resources.maps[mapName]) {
        this.engine.add(mapName, new MapScene(resources.maps[mapName], mapName, this.options));
        this.state.addScene(mapName);
      }
    }
    return resources.maps;
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
      this.logger.debug('[Main] Gamepad connect');
    });

    this.engine.input.gamepads.on('disconnect', (evet: GamepadDisconnectEvent) => {
      this.logger.debug('[Main] Gamepad disconnect');
    });

    this.engine.input.gamepads.at(0).on('button', (ev: GamepadButtonEvent) => {
      this.logger.debug('[Main] button', ev.button, ev.value);
    });

    this.engine.input.gamepads.at(0).on('axis', (ev: GamepadAxisEvent) => {
      this.logger.debug('[Main] axis', ev.axis, ev.value);
    });

    this.addMapScenes();
    this.engine.goToScene('player_house_bedroom.tmx');

    this.logger.debug('[Main] pixelRatio', this.engine.pixelRatio);
    this.logger.debug('[Main] isHiDpi', this.engine.isHiDpi);

    this.logger.defaultLevel = LogLevel.Debug;

    const loader = new Loader([...resources.getMapArr(), ...resources.getSpriteArr()]);
    loader.backgroundColor = Color.Black.toString();

    await this.engine.start(loader);
  };
}

const player1 = new PixelRPG({ playerNumber: 1});
const player2 = new PixelRPG({ playerNumber: 2});

player1.start();
player2.start();