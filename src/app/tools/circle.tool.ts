import { Point, WhiteboardElement } from '../models/element.model';

export class CircleTool {

  create(
    start: Point,
    end: Point,
    stroke: string,
    strokeWidth: any
  ): WhiteboardElement {

    return {
      id: crypto.randomUUID(),
      type: 'circle',
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
      stroke: stroke,
      strokeWidth: strokeWidth
    };
  }
}
