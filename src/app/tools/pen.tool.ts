import { Point, WhiteboardElement } from '../models/element.model';

export class PenTool {

  create(points: Point[], stroke: string, strokeWidth: any): WhiteboardElement {

    return {
      id: crypto.randomUUID(),
      type: 'stroke',
      points,
      stroke,
      strokeWidth
    };
  }
}
