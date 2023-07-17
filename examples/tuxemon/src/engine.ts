import {
    Engine as ExcaliburEngine, EngineOptions, DisplayMode, Input, Color, Logger, Scene, Loader,
    Timer, TileMap, Actor, Entity, LogLevel, ScreenElement, GamepadConnectEvent, GamepadDisconnectEvent,
    GamepadButtonEvent, GamepadAxisEvent, GameEvent
} from 'excalibur';


// Scenes
import { MapScene } from './scenes/map.scene';

import { GameOptions, NetworkSerializable, GameState } from './types';
import { resources } from './managers/index';
import { proxy } from 'valtio'


export class PrpgEngine extends ExcaliburEngine implements NetworkSerializable<GameState> {

    private logger = Logger.getInstance();

    public _state: GameState = {
        maps: {},
    }

    get state() {
        return this._state;
    }

    constructor(engineOptions: EngineOptions, readonly gameOptions: GameOptions, initialState?: Partial<GameState>) {
        const canvasElementId = 'p' + gameOptions.playerNumber;
        const defaults = {
            displayMode: DisplayMode.FillContainer, // TODO: Contribute a new option to ignore aspect ratio / resolution
            canvasElementId,
            pointerScope: Input.PointerScope.Canvas,
            width: document.getElementById(canvasElementId)?.clientWidth || 800,
            height: document.getElementById(canvasElementId)?.clientHeight || 600,
            antialiasing: false,
            snapToPixel: false,
            suppressPlayButton: true, // Disable play button, enable to fix audio issue, currently only used for dev
            backgroundColor: Color.Black,
            maxFps: 60,
        }
        super({...defaults, ...engineOptions});
        this._state = this.initState(initialState);
    }

    updateStatesMapScenes() {
        const mapsScenesStates = this.getStatesMapScenes();
        for (const name in mapsScenesStates) {
            const scene = this.scenes[name] as MapScene | Scene;
            if(scene instanceof MapScene) {
                if(!this.state.maps[name]) {
                    this.state.maps[name] = mapsScenesStates[name];
                } else if(this.state.maps[name] !== mapsScenesStates[name]) {
                    this.logger.warn(`Map scene ${name} state is out of sync!`);
                    this.state.maps[name] = mapsScenesStates[name];
                }
            }
        }
    }

    getStatesMapScenes() {
        const mapsScenes: GameState['maps'] = {};
        for (const name in this.scenes) {
            const scene = this.scenes[name] as MapScene | Scene;
            if(scene instanceof MapScene) {
                mapsScenes[name] = scene.state;
            }
        }
        return mapsScenes
    }

    initState(initialState: Partial<GameState> = {}): GameState {
        this._state = {...this._state, ...initialState};
        this._state.maps = this.getStatesMapScenes()
        return proxy(this._state);
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
        // if(this.yScenes?.[key]) {
        //     throw new Error(`Scene ${key} already exists!`);
        // }
        // if(sync) {
        //     this.logger.info(`Syncing scene ${key}`);
        //     this.yScenes ||= {};
        //     this.yScenes[key] = this.yDoc.get('sharedJson', Y.JsonObject)
        // }
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
            this.addScene(mapName, new MapScene(this.gameOptions, mapName, resources.maps[mapName]), true);
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
        super.onPostUpdate(engine, delta);
        this.updateStatesMapScenes();
        const event = new GameEvent<GameState>()
        event.target = this.state;
        this.emit('sceneUpdate', event);
    }

    deserializeMapScenes(maps: GameState['maps']) {
        for (const name in maps) {
            const updatedScene = maps[name];
            const myScene = this.scenes[name] as MapScene | Scene;
            if(updatedScene && myScene instanceof MapScene) {
                if(this.currentScene instanceof MapScene && this.currentScene.name === name) {
                    this.currentScene.deserialize(maps[name]);
                } else {
                    myScene.deserialize(updatedScene);
                }
            } else if(!myScene) {
                this.logger.warn(`Scene ${name} to deserialize not found!`);
            }
        }
    }

    deserialize(data: Partial<GameState>) {
        if(data.maps) {
            this.deserializeMapScenes(data.maps);
        }
    }
}
