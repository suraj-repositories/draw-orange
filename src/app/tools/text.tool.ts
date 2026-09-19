import { Point, WhiteboardElement } from '../models/element.model';

export class TextTool {

  create(
    point: Point,
    text: string,
    stroke: string,
    strokeWidth: any
  ): WhiteboardElement {

    return {
      id: crypto.randomUUID(),
      type: 'text',

      x: point.x,
      y: point.y,

      text,

      stroke: stroke,
      strokeWidth: strokeWidth
    };
  }
}
