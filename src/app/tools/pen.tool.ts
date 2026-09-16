import { Point, WhiteboardElement } from '../models/element.model';

export class PenTool {

  create(points: Point[]): WhiteboardElement {

    return {
      id: crypto.randomUUID(),
      type: 'stroke',
      points,
      stroke: '#f57c00',
      strokeWidth: 2
    };
  }
}
