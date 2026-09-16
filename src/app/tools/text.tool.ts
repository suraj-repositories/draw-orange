import { Point, WhiteboardElement } from '../models/element.model';

export class TextTool {

  create(
    point: Point,
    text: string
  ): WhiteboardElement {

    return {
      id: crypto.randomUUID(),
      type: 'text',

      x: point.x,
      y: point.y,

      text,

      stroke: '#1e1f22',
      strokeWidth: 3
    };
  }
}
