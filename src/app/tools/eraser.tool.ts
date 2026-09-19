import { Point, WhiteboardElement } from '../models/element.model';

export class EraserTool {
  private readonly ERASER_SIZE = 20;
  private readonly HALF_SIZE = this.ERASER_SIZE / 2;

  findElementsToDelete(
    point: Point,
    elements: WhiteboardElement[],
    previousPoint?: Point
  ): WhiteboardElement[] {
    const samples = this.buildEraserPath(point, previousPoint);

    return elements.filter(element =>
      samples.some(sample => this.isNearElement(sample, element))
    );
  }

  private buildEraserPath(point: Point, previousPoint?: Point): Point[] {
    if (!previousPoint) {
      return [point];
    }

    const dx = point.x - previousPoint.x;
    const dy = point.y - previousPoint.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= this.HALF_SIZE) {
      return [point];
    }

    const steps = Math.min(Math.ceil(distance / this.HALF_SIZE), 64);
    const samples: Point[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      samples.push({
        x: previousPoint.x + dx * t,
        y: previousPoint.y + dy * t
      });
    }

    return samples;
  }

  private isNearElement(
    point: Point,
    element: WhiteboardElement
  ): boolean {
    const left = point.x - this.HALF_SIZE;
    const right = point.x + this.HALF_SIZE;
    const top = point.y - this.HALF_SIZE;
    const bottom = point.y + this.HALF_SIZE;

    const lineSegment = this.extractLineSegment(element);

    if (lineSegment) {
      return this.lineIntersectsRectangle(
        lineSegment.start,
        lineSegment.end,
        left,
        right,
        top,
        bottom
      );
    }

    if (element.points?.length) {
      return this.isStrokeInsideEraser(
        this.toAbsolutePoints(element),
        left,
        right,
        top,
        bottom
      );
    }

    if (
      element.x !== undefined &&
      element.y !== undefined
    ) {
      const width = element.width ?? 0;
      const height = element.height ?? 0;

      const elementLeft = Math.min(element.x, element.x + width);
      const elementRight = Math.max(element.x, element.x + width);
      const elementTop = Math.min(element.y, element.y + height);
      const elementBottom = Math.max(element.y, element.y + height);

      return (
        elementLeft <= right &&
        elementRight >= left &&
        elementTop <= bottom &&
        elementBottom >= top
      );
    }

    return false;
  }

  private extractLineSegment(element: any): { start: Point; end: Point } | null {
    if (element.startPoint && element.endPoint) {
      return { start: element.startPoint, end: element.endPoint };
    }

    if (element.start && element.end) {
      return { start: element.start, end: element.end };
    }

    if (
      element.x1 !== undefined &&
      element.y1 !== undefined &&
      element.x2 !== undefined &&
      element.y2 !== undefined
    ) {
      return {
        start: { x: element.x1, y: element.y1 },
        end: { x: element.x2, y: element.y2 }
      };
    }

    if (!this.isLineLike(element)) {
      return null;
    }

    if (element.points?.length >= 2) {
      const points = this.toAbsolutePoints(element);
      return {
        start: points[0],
        end: points[points.length - 1]
      };
    }

    if (element.x !== undefined && element.y !== undefined) {
      const endX =
        element.endX ?? element.x + (element.width ?? 0);
      const endY =
        element.endY ?? element.y + (element.height ?? 0);

      return {
        start: { x: element.x, y: element.y },
        end: { x: endX, y: endY }
      };
    }

    return null;
  }

  private isLineLike(element: any): boolean {
    const type = String(
      element.type ?? element.tool ?? element.kind ?? ''
    ).toLowerCase();

    return type.includes('line') || type.includes('arrow');
  }

  private toAbsolutePoints(element: any): Point[] {
    const points: Point[] = element.points ?? [];

    if (!element.pointsAreRelative) {
      return points;
    }

    const originX = element.x ?? 0;
    const originY = element.y ?? 0;

    return points.map(p => ({ x: originX + p.x, y: originY + p.y }));
  }

  private isStrokeInsideEraser(
    points: Point[],
    left: number,
    right: number,
    top: number,
    bottom: number
  ): boolean {
    for (const point of points) {
      if (
        point.x >= left &&
        point.x <= right &&
        point.y >= top &&
        point.y <= bottom
      ) {
        return true;
      }
    }

    for (let i = 1; i < points.length; i++) {
      if (
        this.lineIntersectsRectangle(
          points[i - 1],
          points[i],
          left,
          right,
          top,
          bottom
        )
      ) {
        return true;
      }
    }

    return false;
  }

  private lineIntersectsRectangle(
    p1: Point,
    p2: Point,
    left: number,
    right: number,
    top: number,
    bottom: number
  ): boolean {
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);

    if (
      maxX < left ||
      minX > right ||
      maxY < top ||
      minY > bottom
    ) {
      return false;
    }

    if (
      this.pointInsideRectangle(p1, left, right, top, bottom) ||
      this.pointInsideRectangle(p2, left, right, top, bottom)
    ) {
      return true;
    }

    return (
      this.linesIntersect(p1, p2, { x: left, y: top }, { x: right, y: top }) ||
      this.linesIntersect(p1, p2, { x: right, y: top }, { x: right, y: bottom }) ||
      this.linesIntersect(p1, p2, { x: right, y: bottom }, { x: left, y: bottom }) ||
      this.linesIntersect(p1, p2, { x: left, y: bottom }, { x: left, y: top })
    );
  }

  private pointInsideRectangle(
    point: Point,
    left: number,
    right: number,
    top: number,
    bottom: number
  ): boolean {
    return (
      point.x >= left &&
      point.x <= right &&
      point.y >= top &&
      point.y <= bottom
    );
  }

  private linesIntersect(
    a: Point,
    b: Point,
    c: Point,
    d: Point
  ): boolean {
    const denominator =
      (d.y - c.y) * (b.x - a.x) -
      (d.x - c.x) * (b.y - a.y);

    if (denominator === 0) {
      return false;
    }

    const ua =
      ((d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)) / denominator;

    const ub =
      ((b.x - a.x) * (a.y - c.y) - (b.y - a.y) * (a.x - c.x)) / denominator;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }
}
