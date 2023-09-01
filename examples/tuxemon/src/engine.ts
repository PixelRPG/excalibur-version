import {
    Engine as ExcaliburEngine, EngineOptions, DisplayMode, Color, Logger, Scene, Loader,
    Timer, TileMap, Actor, Entity, LogLevel, ScreenElement, GamepadConnectEvent, GamepadDisconnectEvent,
    GamepadButtonEvent, GamepadAxisEvent, EventEmitter, PointerScope
} from 'excalibur';

import { syncable } from './utilities';

// Scenes
import { MapScene } from './scenes/map.scene';

import { GameOptions, MultiplayerSyncable, GameState, GameUpdates, MultiplayerSyncableScene, MultiplayerSyncDirection, PrpgEngineEvents, MultiplayerMessageInfo, TeleportMessage } from './types';
import { resources } from './managers/index';
import { BlueprintService } from './services/index'
import { GameStateFullEvent, GameStateUpdateEvent, GameMessageEvent } from './events/index';
import { PrpgMenuComponent } from './components'

export class PrpgEngine extends ExcaliburEngine implements MultiplayerSyncable<GameState, GameUpdates> {

    private logger = Logger.getInstance();

    private _state: GameState = {
        scenes: {},
    }

    private _updates: GameUpdates = {
        scenes: {},
    }

    /**
     * Listen to and emit events on the Engine
     */
    public declare events: EventEmitter<PrpgEngineEvents>;

    public get syncDirection() {
        return MultiplayerSyncDirection.BOTH;
    }

    private resetUpdatesScenes() {
        const scenes: GameState['scenes'] = {};
        for (const name in this.scenes) {
            const scene = this.scenes[name] as Scene & MultiplayerSyncableScene;
            if(scene.multiplayerSystem) {
                scene.multiplayerSystem.resetUpdates();
            }
        }
        return scenes
    }

    /**
     * Clear updates to collect new ones
     */
    public resetUpdates(): void {
        this.resetUpdatesScenes();
        this._updates.scenes = {};
    }

    get dirty() {
        return !!this._updates.scenes && Object.keys(this._updates.scenes).length > 0;
    }

    get state(): Readonly<GameState>  {
        return this._state;
    }

    get updates(): Readonly<GameUpdates>  {
        return this._updates;
    }

    constructor(engineOptions: EngineOptions, readonly gameOptions: GameOptions, initialState?: GameUpdates) {
        const canvasElementId = 'p' + gameOptions.playerNumber;
        const defaults = {
            displayMode: DisplayMode.FillContainer, // TODO: Contribute a new option to ignore aspect ratio / resolution
            canvasElementId,
            pointerScope: PointerScope.Canvas,
            width: document.getElementById(canvasElementId)?.clientWidth || 800,
            height: document.getElementById(canvasElementId)?.clientHeight || 600,
            antialiasing: false,
            snapToPixel: false,
            suppressPlayButton: true, // Disable play button, enable to fix audio issue, currently only used for dev
            backgroundColor: Color.Black,
            maxFps: 40,
            configurePerformanceCanvas2DFallback: {
                allow: true,
                
                threshold: {
                    numberOfFrames: 10,
                    fps: 5,
                }
            }
        }
        super({...defaults, ...engineOptions});
        this._state = this.initState (initialState);
    }

    private collectStates() {
        for (const name in this.scenes) {
            const scene = this.scenes[name] as Scene & MultiplayerSyncableScene;
            const sync = syncable(scene.multiplayerSystem?.syncDirection, MultiplayerSyncDirection.OUT)
            if(sync && scene.multiplayerSystem) {
                if(!this._state.scenes[name]) {
                    this._state.scenes[name] = scene.multiplayerSystem.state;
                } else if(this._state.scenes[name] !== scene.multiplayerSystem.state) {
                    // this.logger.warn(`Map scene ${name} state is out of sync!`, this._state.maps[name], scene.multiplayerSystem?.state);
                    this._state.scenes[name] = scene.multiplayerSystem.state;
                }
            }
        }
    }

    private collectUpdates() {
        for (const name in this.scenes) {
            const scene = this.scenes[name] as Scene & MultiplayerSyncableScene;
            const sync = syncable(scene.multiplayerSystem?.syncDirection, MultiplayerSyncDirection.OUT);
            if(sync && scene.multiplayerSystem?.dirty) {
                this._updates.scenes ||= {};
                if(!this._updates.scenes[name]) {
                    this._updates.scenes[name] = scene.multiplayerSystem.updates;
                } else if(this._updates.scenes[name] !== scene.multiplayerSystem.updates) {
                    // this.logger.warn(`Map scene ${name} state is out of sync!`, this._updates.maps[name], scene.updates);
                    this._updates.scenes[name] = scene.multiplayerSystem.updates;
                }
            }
        }
    }

    private getStatesScenes() {
        const scenes: GameState['scenes'] = {};
        for (const name in this.scenes) {
            const scene = this.scenes[name] as Scene & MultiplayerSyncableScene;
            if(scene.multiplayerSystem) {
                scenes[name] = scene.multiplayerSystem.state || {};
            }
        }
        return scenes
    }

    private initMapScenes() {
        for (const name in this.scenes) {
            const scene = this.scenes[name] as MapScene;
            scene._initialize(this);
        }
    }

    private initState(initialState: GameUpdates = {}): GameState {
        this._state = {...this._state, ...initialState};
        this._state.scenes = this.getStatesScenes()
        return this._state;
    }

    public getUpdatesScenes() {
        const scenes: GameUpdates['scenes'] = {};
        for (const name in this.scenes) {
            const scene = this.scenes[name] as Scene & MultiplayerSyncableScene;
            if(scene.multiplayerSystem?.dirty) {
                scenes[name] = scene.multiplayerSystem.updates || {};
            }
        }
        return scenes
    }

    /**
     * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
     * would levels or menus.
     *
     * @param key  The name of the scene, must be unique
     * @param scene The scene to add to the engine
     */
    addScene(key: string, scene: Scene) {
        super.addScene(key, scene);
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
          this.addScene(<string>args[0], <Scene>args[1]);
          return;
        }
        super.add(args[0])
    }

    public addMapScenes() {
        const mapNames = Object.keys(resources.maps);
        for (const mapName of mapNames) {
          if (resources.maps[mapName]) {
            const scene = new MapScene(this.gameOptions, mapName, resources.maps[mapName]);
            this.addScene(mapName, scene);
          }
        }

        return resources.maps;
    }

    public getScene(mapName: string) {
        return this.scenes[mapName] as Scene | undefined;
    }

    public getMapScene(mapName: string) {
        const mapScene = this.getScene(mapName);
        if(!mapScene) {
            return undefined;
        }
        if(mapScene instanceof MapScene) {
            return mapScene;
        }
        throw new Error(`Scene ${mapName} is not a MapScene`);
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
        this.input.gamepads.on('connect', (event: GamepadConnectEvent) => {
        this.logger.debug('[Main] Gamepad connect');
        });

        this.input.gamepads.on('disconnect', (event: GamepadDisconnectEvent) => {
        this.logger.debug('[Main] Gamepad disconnect');
        });

        this.input.gamepads.at(0).on('button', (event: GamepadButtonEvent) => {
        this.logger.debug('[Main] button', event.button, event.value);
        });

        this.input.gamepads.at(0).on('axis', (event: GamepadAxisEvent) => {
        this.logger.debug('[Main] axis', event.axis, event.value);
        });

        this.addMapScenes();
        const startMapName = 'player_house_bedroom.tmx'; // TODO: Add and find start map by map property
        const startMap = this.getMapScene(startMapName);
        this.goToScene(startMapName); // TODO: Start on title screen

        // TODO: Move this to map scene?
        const menuEntities = BlueprintService.getInstance().createEntitiesFromBlueprint(resources.blueprints.gameMenu);
        this.logger.debug('[Main] menuEntities', menuEntities);
        for (const entityName in menuEntities) {
            const menuEntity = menuEntities[entityName];
            if(!menuEntity) {
                throw new Error(`Entity ${entityName} not found`);
            }
            const menuItemEntities = menuEntity.get(PrpgMenuComponent)?.items || {};
            for (const key in menuItemEntities) {
                if (Object.prototype.hasOwnProperty.call(menuItemEntities, key)) {
                    const menuItemEntity = menuItemEntities[key];
                    if(!menuItemEntity) {
                        throw new Error(`Entity ${key} not found`);
                    }
                    startMap?.add(menuItemEntity);
                }
            }
            startMap?.add(menuEntity);
        }

        this.logger.debug('[Main] pixelRatio', this.pixelRatio);
        this.logger.debug('[Main] isHiDpi', this.isHiDpi);

        this.logger.defaultLevel = LogLevel.Debug;

        const loader = new Loader([...resources.getMapArr(), ...resources.getSpriteArr()]);
        loader.backgroundColor = Color.Black.toString();

        await super.start(loader);

        // Initialize the scene by hand, we need this to initialize the multiplayer system
        this.initMapScenes();
    }

    /**
     * Emit state updates
     */
    public emitMultiplayerUpdate() {
        this.collectUpdates();
        if(this.dirty) {
            const updatesEvent = new GameStateUpdateEvent(this.updates)
            this.events.emit('multiplayer:update', updatesEvent);
            this.resetUpdates();
        }
    }

    /**
     * Emit full state
     */
    public emitMultiplayerFullState() {
        this.collectStates();
        {
            const stateEvent = new GameStateFullEvent(this.state)
            this.events.emit('multiplayer:state', stateEvent);
        }
    }

    /**
     * Emit a message to the other players
     * @param info
     */
    public emitMultiplayerMessage<I = any>(info: MultiplayerMessageInfo<I>) {
        const messsageEvent = new GameMessageEvent<I>(info)
        this.events.emit('multiplayer:message', messsageEvent);
    }

    /**
     * Emit a "ask other player for full state" message
     * @param info
     */
    public emitMultiplayerAskForFullStateMessage(info: MultiplayerMessageInfo<undefined>) {
        const messsageEvent = new GameMessageEvent<undefined>(info)
        this.events.emit('multiplayer:message:ask-for-full-state', messsageEvent);
        console.debug('emitMultiplayerAskForFullStateMessage', info);
    }

    /**
     * 
     * @param info 
     */
    public emitMultiplayerTeleportMessage(info: MultiplayerMessageInfo<TeleportMessage>) {
        const messsageEvent = new GameMessageEvent(info);
        this.events.emit('multiplayer:message:teleport', messsageEvent);
        console.debug('emitMultiplayerTeleportMessage', info);
    }

    override onPostUpdate(engine: PrpgEngine, delta: number) {
        super.onPostUpdate(engine, delta);

        this.emitMultiplayerUpdate();
    }

   protected applySceneUpdates(scenes: GameState['scenes']) {
        for (const name in scenes) {
            const sceneUpdates = scenes[name];
            const myScene = this.scenes[name] as MapScene;

            if(!sceneUpdates) {
                this.logger.warn(`[applyUpdates][${this.gameOptions.playerNumber}] Scene ${name} has no updates, ignoring`);
                continue;
            }

            if(myScene.multiplayerSystem && syncable(myScene.multiplayerSystem.syncDirection, MultiplayerSyncDirection.IN)) {
                myScene.multiplayerSystem.applyUpdates(sceneUpdates);
            } else {
                this.logger.warn(`Scene ${name} is not syncable!`);
            }
        }
    }

    public onTeleportMessage(message: MultiplayerMessageInfo<TeleportMessage>) {
        console.debug('onTeleportMessage', message);
    }

    public onAskForFullStateMessage(message: MultiplayerMessageInfo<undefined>) {
        console.debug('onAskForFullStateMessage', message);
    }

    /**
     * Receive updates from the other players
     * @param data 
     */
    public applyUpdates(data: Partial<GameState>) {
        if(data.scenes) {
            this.applySceneUpdates(data.scenes);
        }
    }
}
