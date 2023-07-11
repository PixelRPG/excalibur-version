import type { Direction } from "./direction";
import type { Entity } from "excalibur";
import type { MapScene } from "../scenes/map.scene";

export interface SpawnPoint {
    x: number;
    y: number;
    z: number;
    direction: Direction;
    entity: Entity;
    mapScene: MapScene;
}