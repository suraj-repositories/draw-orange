import { Point, WhiteboardElement } from '../models/element.model';

export class HighlighterTool {

  create(points: Point[], stroke: string, strokeWidth: any): WhiteboardElement {

    return {
      id: crypto.randomUUID(),
      type: 'stroke',

      points,

      stroke: stroke,
      strokeWidth: strokeWidth,
      opacity: 0.35
    };
  }
}
