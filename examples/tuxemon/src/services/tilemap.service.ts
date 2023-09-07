import {
  Logger,
  BodyComponent,
  TileMap,
  TransformComponent,
  CoordPlane,
  CollisionType,
  PointerComponent,
  Tile,
} from 'excalibur';
import { resources } from '../managers/index';

enum TileboxType {
  TopLeft = 0,
  TopRight = 1,
  BottomLeft = 2,
  BottomRight = 3,
  Top = 4,
  Bottom = 5,
  Left = 6,
  Right = 7,
  Center = 8,
}



export class TilemapService {

  private logger = Logger.getInstance();

  static instance: TilemapService;

  protected constructor() { }

  public static getInstance() {
      if (!TilemapService.instance) {
          TilemapService.instance = new TilemapService();
      }
      return TilemapService.instance;
  }

  public getCoordForTileboxType(tileType: TileboxType) {
    switch (tileType) {
      case TileboxType.TopLeft:
        return { x: 0, y: 0 };
      case TileboxType.TopRight:
        return { x: 2, y: 0 };
      case TileboxType.BottomLeft:
        return { x: 0, y: 2 };
      case TileboxType.BottomRight:
        return { x: 2, y: 2 };
      case TileboxType.Top:
        return { x: 1, y: 0 };
      case TileboxType.Bottom:
        return { x: 1, y: 2 };
      case TileboxType.Left:
        return { x: 0, y: 1 };
      case TileboxType.Right:
        return { x: 2, y: 1 };
      case TileboxType.Center:
        return { x: 1, y: 1 };
      default:
        this.logger.error(`TileboxType ${tileType} not found!`);
        return { x: 1, y: 1 };
    }
  }

  /**
   * Returns the tilebox type for a given coordinate.
   * @param column column or x coordinate
   * @param row row or y coordinate
   * @param columns columns or width of tilemap in tiles
   * @param rows rows or height of tilemap in tiles
   * @returns 
   */
  public getTileboxTypeForCoord(column: number, row: number, columns = 3, rows = 3) {
    const isTop = row === 0;
    const isBottom = row === rows - 1;
    const isLeft = column === 0;
    const isRight = column === columns - 1;
    const isCenter = !isTop && !isBottom && !isLeft && !isRight;
    const isTopLeft = isTop && isLeft;
    const isTopRight = isTop && isRight;
    const isBottomLeft = isBottom && isLeft;
    const isBottomRight = isBottom && isRight;

    let tileType: TileboxType = TileboxType.Center;
    if (isTopLeft) {
      tileType = TileboxType.TopLeft;
    } else if (isTopRight) {
      tileType = TileboxType.TopRight;
    } else if (isBottomLeft) {
      tileType = TileboxType.BottomLeft;
    } else if (isBottomRight) {
      tileType = TileboxType.BottomRight;
    } else if (isTop) {
      tileType = TileboxType.Top;
    } else if (isBottom) {
      tileType = TileboxType.Bottom;
    } else if (isLeft) {
      tileType = TileboxType.Left;
    } else if (isRight) {
      tileType = TileboxType.Right;
    } else if (isCenter) {
      tileType = TileboxType.Center;
    }
    return tileType;
  }

  /**
   * Sets the coordinate plane of a tilemap to the screen.
   * This is useful for drawing a tilemap on the screen like dialog boxes or menus.
   * @param tilemap 
   * @returns 
   */
  public setCoordPlane(tilemap: TileMap, coordPlane: CoordPlane) {
    // Set the tilemap coordinate plane to the screen like a screen element
    let trans = tilemap.get(TransformComponent);
    if (trans) {
      trans.coordPlane = coordPlane;
    }
    return tilemap;
  }

  public setCollisionType(tilemap: TileMap, collisionType: CollisionType) {
    const body = tilemap.get(BodyComponent);
    if (body) {
      body.collisionType = collisionType;
    }

  }

  /**
   * 
   * @param tilemap 
   * @param useGraphicsBounds If `true`, use any existing Graphics component bounds for pointers. This is useful if you want the axis aligned bounds around the graphic to trigger pointer events.
   * If `false`, use the collider shape for pointer events. This is useful if you want the collider shape to trigger pointer events.
   */
  public setPointerEvents(tilemap: TileMap, useGraphicsBounds: boolean) {
    const pointer = tilemap.get(PointerComponent);
    if (pointer) {
      pointer.useGraphicsBounds = useGraphicsBounds;
      pointer.useColliderShape = !useGraphicsBounds;
    }
  }

  /**
   * Sets the coordinate plane of a tilemap to the screen.
   * By default the coordinate plane of a tilemap is set to `CoordPlane.World`,
   * but this is not useful for drawing a tilemap on the screen like dialog boxes or menus.
   * @param tilemap 
   */
  public setToScreen(tilemap: TileMap) {
    this.setCoordPlane(tilemap, CoordPlane.Screen);
    this.setCollisionType(tilemap, CollisionType.PreventCollision);
    this.setPointerEvents(tilemap, true);
  }

  public createBox(tilesetName: string, rows: number, columns: number) {
    const tileset = resources.getTilesetByName(tilesetName);

    if (!tileset || !tileset.data) {
      throw new Error(`Tileset "${tilesetName}" not found!`);
    }

    if (!tileset.spriteSheet) {
      throw new Error(`SpriteSheet not found!`);
    }

    const tilemap = new TileMap({
      rows,
      columns,
      tileWidth: tileset.data.tileWidth,
      tileHeight: tileset.data.tileHeight,
    });

    // loop through tilemap cells
    for (let cell of tilemap.tiles) {
      const column = cell.x;
      const row = cell.y;

      const { x, y } = this.getCoordForTileboxType(this.getTileboxTypeForCoord(column, row, columns, rows));

      const sprite = tileset.spriteSheet.getSprite(x, y);

      if (!sprite) {
        throw new Error(`Sprite not found!`);
      }

      cell.addGraphic(sprite);
    }

    return tilemap;
  }
}