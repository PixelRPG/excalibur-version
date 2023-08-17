import { MapScene } from '../scenes/map.scene';

import type { GameOptions } from '../types';
import type { Scene } from 'excalibur';

export const findEntityByNameFromScene = (scene: Scene, name: string) => {
    return scene.entities.find(entity => entity.name === name);
}

export const findEntityByNameInScenes = (gameOptions: GameOptions, name: string) => {
    for (const sceneName in MapScene.instances(gameOptions)) {
        const entity = findEntityByNameFromScene(MapScene.getInstance(gameOptions, sceneName), name);
        if(entity) {
           return entity;
        }
    }
}

export const findEntityByNameInMapScene = (gameOptions: GameOptions, sceneName: string, name: string) => {
    return findEntityByNameFromScene(MapScene.getInstance(gameOptions, sceneName), name);
}

export const findEntityByNameInMapScenes = (gameOptions: GameOptions, name: string) => {
    return findEntityByNameInScenes(gameOptions, name);
}