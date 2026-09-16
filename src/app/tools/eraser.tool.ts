import {
  Point,
  WhiteboardElement
} from '../models/element.model';

export class EraserTool {

  findElementsToDelete(
    point: Point,
    elements: WhiteboardElement[]
  ): WhiteboardElement[] {

    return elements.filter(
      element => this.isNearElement(point, element)
    );
  }

  private isNearElement(
    point: Point,
    element: WhiteboardElement
  ): boolean {

    const tolerance = 10;

    if (
      element.x !== undefined &&
      element.y !== undefined
    ) {

      const width =
        Math.abs(element.width ?? 0);

      const height =
        Math.abs(element.height ?? 0);

      return (
        point.x >= element.x - tolerance &&
        point.x <= element.x + width + tolerance &&
        point.y >= element.y - tolerance &&
        point.y <= element.y + height + tolerance
      );
    }

    if (element.points) {

      return element.points.some(p =>
        Math.hypot(
          p.x - point.x,
          p.y - point.y
        ) <= tolerance
      );
    }

    return false;
  }
}
