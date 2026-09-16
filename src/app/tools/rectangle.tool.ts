import { Point, WhiteboardElement } from '../models/element.model';

export class RectangleTool {

  create(
    start: Point,
    end: Point
  ): WhiteboardElement {

    return {
      id: crypto.randomUUID(),
      type: 'rectangle',

      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),

      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),

      stroke: '#f57c00',
      strokeWidth: 2
    };
  }
}
