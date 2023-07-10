import {
    Engine as ExcaliburEngine, EngineOptions, DisplayMode, Input, Color, Logger, Scene, Loader,
    Timer, TileMap, Actor, Entity, LogLevel, ScreenElement, GamepadConnectEvent, GamepadDisconnectEvent,
    GamepadButtonEvent, GamepadAxisEvent
} from 'excalibur';
import { Doc } from 'yjs';

// Scenes
import { MapScene } from './scenes/map.scene';

import { GameOptions, PrpgComponentType, MultiplayerData } from './types';
import { PrpgPlayerComponent } from './components';
import { resources } from './managers/index';
import { PrpgPlayerActor } from './actors/index';


export class PrpgEngine extends ExcaliburEngine implements MultiplayerData {

    private logger = Logger.getInstance();

    private yScenes: {
        [scene: string]: any;// Doc
    } = {};

    constructor(engineOptions: EngineOptions, readonly gameOptions: GameOptions) {
        const defaults = {
            displayMode: DisplayMode.FitContainerAndFill,
            canvasElementId: 'p'  + gameOptions.playerNumber,
            pointerScope: Input.PointerScope.Canvas,
            antialiasing: false,
            snapToPixel: false,
            suppressPlayButton: true, // Disable play button, enable to fix audio issue, currently only used for dev
            backgroundColor: Color.Black
        }
        super({...defaults, ...engineOptions});
    }

    /**
     * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
     * would levels or menus.
     *
     * @param key  The name of the scene, must be unique
     * @param scene The scene to add to the engine
     * @param sync  Whether or not to sync the scene state across players
     */
    addScene(key: string, scene: Scene, sync = false) {
        super.addScene(key, scene);
        if(this.yScenes?.[key]) {
            throw new Error(`Scene ${key} already exists!`);
        }
        if(sync) {
            this.logger.info(`Syncing scene ${key}`);
            this.yScenes ||= {};
            this.yScenes[key] = {}; //new Doc();
        }
    }

    /**
     * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
     * would levels or menus.
     * @param sceneKey  The key of the scene, must be unique
     * @param scene     The scene to add to the engine
     */
    public add(sceneKey: string, scene: Scene): void;
    /**
     * Adds a [[Timer]] to the [[currentScene]].
     * @param timer  The timer to add to the [[currentScene]].
     */
    public add(timer: Timer): void;
    /**
     * Adds a [[TileMap]] to the [[currentScene]], once this is done the TileMap
     * will be drawn and updated.
     */
    public add(tileMap: TileMap): void;
    /**
     * Adds an actor to the [[currentScene]] of the game. This is synonymous
     * to calling `engine.currentScene.add(actor)`.
     *
     * Actors can only be drawn if they are a member of a scene, and only
     * the [[currentScene]] may be drawn or updated.
     *
     * @param actor  The actor to add to the [[currentScene]]
     */
    public add(actor: Actor): void;

    public add(entity: Entity): void;

    /**
     * Adds a [[ScreenElement]] to the [[currentScene]] of the game,
     * ScreenElements do not participate in collisions, instead the
     * remain in the same place on the screen.
     * @param screenElement  The ScreenElement to add to the [[currentScene]]
     */
    public add(screenElement: ScreenElement): void;
    public add(...args: any[]): void {
        if (args.length >= 2) {
          this.addScene(<string>args[0], <Scene>args[1], <boolean | undefined>args[2]);
          return;
        }
        super.add(args[0])
    }

    public addMapScenes() {
        const mapNames = Object.keys(resources.maps);
        for (const mapName of mapNames) {
          if (resources.maps[mapName]) {
            this.addScene(mapName, new MapScene(resources.maps[mapName], mapName, this.gameOptions), true);
          }
        }
        return resources.maps;
    }   

    /**
     * Starts the internal game loop for Excalibur after loading
     * any provided assets.
     * Note: start() only resolves AFTER the user has clicked the play button
     */
    async start() {

        // Enable Gamepad support
        this.input.gamepads.enabled = true;
        this.input.gamepads.setMinimumGamepadConfiguration({
        axis: 0,
        buttons: 8
        });

        // Log when pads disconnect and connect
        this.input.gamepads.on('connect', (evet: GamepadConnectEvent) => {
        this.logger.debug('[Main] Gamepad connect');
        });

        this.input.gamepads.on('disconnect', (evet: GamepadDisconnectEvent) => {
        this.logger.debug('[Main] Gamepad disconnect');
        });

        this.input.gamepads.at(0).on('button', (ev: GamepadButtonEvent) => {
        this.logger.debug('[Main] button', ev.button, ev.value);
        });

        this.input.gamepads.at(0).on('axis', (ev: GamepadAxisEvent) => {
        this.logger.debug('[Main] axis', ev.axis, ev.value);
        });

        this.addMapScenes();
        this.goToScene('player_house_bedroom.tmx');

        this.logger.debug('[Main] pixelRatio', this.pixelRatio);
        this.logger.debug('[Main] isHiDpi', this.isHiDpi);

        this.logger.defaultLevel = LogLevel.Debug;

        const loader = new Loader([...resources.getMapArr(), ...resources.getSpriteArr()]);
        loader.backgroundColor = Color.Black.toString();

        await super.start(loader);
    }

    override onPostUpdate(engine: PrpgEngine, delta: number) {
        // Experimental only send data from player 1 to the other players
        if(this.gameOptions.playerNumber === 1) {
            const data = this.serialize();
            this.emit('sceneUpdate', data);
        }
    }

    serialize() {
        let map: ReturnType<MapScene['serialize']> | undefined;
        if(this.currentScene instanceof MapScene) {
            map = this.currentScene.serialize();
        }
        
        return {
            map
        }
    }

    deserialize(data: ReturnType<PrpgEngine['serialize']>) {
        if(this.currentScene instanceof MapScene && data.map) {
            this.currentScene.deserialize(data.map);
        }
    }
}
