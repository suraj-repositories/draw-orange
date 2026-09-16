import { Point, WhiteboardElement } from '../models/element.model';

export class HighlighterTool {

  create(points: Point[]): WhiteboardElement {

    return {
      id: crypto.randomUUID(),
      type: 'stroke',

      points,

      stroke: '#f57c00',
      strokeWidth: 15,
      opacity: 0.35
    };
  }
}
