import { Logger } from 'excalibur';
import { Direction } from '../types';

export const stringToDirection = (direction?: string | Direction) => {
  switch (direction) {
    case 'right':
    case Direction.RIGHT:
      return Direction.RIGHT;
    case 'left':
    case Direction.LEFT:
      return Direction.LEFT;
    case 'up':
    case 'top':
    case 'back':
    case Direction.UP:
      return Direction.UP;
    case 'down':
    case 'front':
    case 'bottom':
    case Direction.DOWN:
      return Direction.DOWN;
    default:
      Logger.getInstance().warn(`Ignore unknown direction "${direction}"!`);
      return Direction.DOWN;
  }
};