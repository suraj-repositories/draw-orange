import { Point, WhiteboardElement } from '../models/element.model';

export class ArrowTool {

  create(
    start: Point,
    end: Point
  ): WhiteboardElement {

    return {
      id: crypto.randomUUID(),
      type: 'arrow',

      x: start.x,
      y: start.y,

      x2: end.x,
      y2: end.y,

      stroke: '#f57c00',
      strokeWidth: 2
    };
  }
}
