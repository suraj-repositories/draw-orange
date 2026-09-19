import { Point, WhiteboardElement } from '../models/element.model';

export class LineTool {

  create(
    start: Point,
    end: Point,
    stroke: string,
    strokeWidth: any
  ): WhiteboardElement {

    return {
      id: crypto.randomUUID(),
      type: 'line',
      x: start.x,
      y: start.y,
      x2: end.x,
      y2: end.y,
      stroke: stroke,
      strokeWidth: strokeWidth
    };
  }
}
