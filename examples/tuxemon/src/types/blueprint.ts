import {
    PrpgComponentType,
    MultiplayerSyncComponentArgs,
    ActionComponentArgs,
    BodyComponentArgs,
    CharacterComponentArgs,
    ControllableComponentArgs,
    FadeScreenComponentArgs,
    MapComponentArgs,
    MenuComponentArgs,
    MenuItemComponentArgs,
    MenuVisibleComponentArgs,
    PlayerComponentArgs,
    ScreenPositionComponentArgs,
    SelectableComponentArgs,
    SpawnPointComponentArgs,
    TeleportComponentArgs,
    TeleportableComponentArgs,
    TextComponentArgs,
} from '.';
import { 

 } from '../components';

export interface BlueprintComponentsData {
    [PrpgComponentType.MULTIPLAYER_SYNC]?: MultiplayerSyncComponentArgs;
    [PrpgComponentType.ACTION]?: ActionComponentArgs;
    [PrpgComponentType.BODY]?: BodyComponentArgs;
    [PrpgComponentType.CHARACTER]?: CharacterComponentArgs;
    [PrpgComponentType.CONTROLLABLE]?: ControllableComponentArgs;
    [PrpgComponentType.FADE_SCREEN]?: FadeScreenComponentArgs;
    [PrpgComponentType.MAP]?: MapComponentArgs;
    [PrpgComponentType.MENU]?: MenuComponentArgs;
    [PrpgComponentType.MENU_ITEM]?: MenuItemComponentArgs;
    [PrpgComponentType.MENU_VISIBLE]?: MenuVisibleComponentArgs;
    [PrpgComponentType.PLAYER]?: PlayerComponentArgs;
    [PrpgComponentType.SCREEN_POSITION]?: ScreenPositionComponentArgs;
    [PrpgComponentType.SELECTABLE]?: SelectableComponentArgs;
    [PrpgComponentType.SPAWN_POINT]?: SpawnPointComponentArgs;
    [PrpgComponentType.TELEPORT]?: TeleportComponentArgs;
    [PrpgComponentType.TELEPORTABLE]?: TeleportableComponentArgs;
    [PrpgComponentType.TEXT]?: TextComponentArgs;
}

export type Blueprint = {
    [entityName: string]: BlueprintComponentsData;
};
