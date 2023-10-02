export enum ScreenAutoPosition {
    TOP = 'top',
    BOTTOM = 'bottom',
    LEFT = 'left',
    RIGHT = 'right',
    CENTER = 'center'
}

export interface ScreenAutoPositions {
    x?: ScreenAutoPosition;
    y?: ScreenAutoPosition;
}

export interface ScreenPositionComponentState {
    x: number;
    y: number;
    z: number;
}

export interface ScreenPositionComponentArgs extends Partial<ScreenPositionComponentState>{
    auto?: ScreenAutoPositions
}