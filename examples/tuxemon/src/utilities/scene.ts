import { MapScene } from '../scenes/map.scene';

import type { GameOptions } from '../types';
import type { Scene } from 'excalibur';

export const findEntityByNameFromScene = (scene: Scene, name: string) => {
    return scene.entities.find(entity => entity.name === name);
}

export const findEntityByNameInScenes = (scenes: {[name: string]: Scene}, name: string) => {
    for (const key in scenes) {
        const entity = findEntityByNameFromScene(scenes[key], name);
        if(entity) {
           return entity;
        }
    }
}

export const findEntityByNameInMapScenes = (gameOptions: GameOptions, sceneName: string, name: string) => {
    return findEntityByNameFromScene(MapScene.getInstance(gameOptions, sceneName), name);
}