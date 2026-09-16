import { Injectable } from '@angular/core';
import { WhiteboardElement } from '../models/element.model';

@Injectable({
  providedIn: 'root'
})
export class DrawingService {
  render(
    ctx: CanvasRenderingContext2D,
    elements: WhiteboardElement[],
    zoom: number,
    showGrid: boolean,
    width: number,
    height: number
  ): void {
    ctx.clearRect(0, 0, width, height);
    ctx.save();

    if (showGrid) {
      this.drawGrid(ctx, width, height, zoom);
    }

    ctx.scale(zoom, zoom);

    for (const element of elements) {
      this.drawElement(ctx, element);
    }

    ctx.restore();
  }

  private drawElement( ctx: CanvasRenderingContext2D, element: WhiteboardElement ): void {
    ctx.save();

    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth;
    ctx.globalAlpha = element.opacity ?? 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (element.type) {
      case 'stroke':
        this.drawStroke(ctx, element);
        break;

      case 'line':
        this.drawLine(ctx, element);
        break;

      case 'rectangle':
        this.drawRectangle(ctx, element);
        break;

      case 'circle':
        this.drawCircle(ctx, element);
        break;

      case 'arrow':
        this.drawArrow(ctx, element);
        break;

      case 'text':
        this.drawText(ctx, element);
        break;
    }

    ctx.restore();
  }

  private drawStroke(
    ctx: CanvasRenderingContext2D,
    element: WhiteboardElement
  ): void {
    if (!element.points || element.points.length < 2) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(element.points[0].x, element.points[0].y);

    for (let i = 1; i < element.points.length; i++) {
      ctx.lineTo(element.points[i].x, element.points[i].y);
    }

    ctx.stroke();
  }

  private drawLine(
    ctx: CanvasRenderingContext2D,
    element: WhiteboardElement
  ): void {
    if (
      element.x === undefined ||
      element.y === undefined ||
      element.x2 === undefined ||
      element.y2 === undefined
    ) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(element.x, element.y);
    ctx.lineTo(element.x2, element.y2);
    ctx.stroke();
  }

  private drawRectangle(
    ctx: CanvasRenderingContext2D,
    element: WhiteboardElement
  ): void {
    if (
      element.x === undefined ||
      element.y === undefined ||
      element.width === undefined ||
      element.height === undefined
    ) {
      return;
    }

    ctx.strokeRect(element.x, element.y, element.width, element.height);
  }

  private drawCircle(
    ctx: CanvasRenderingContext2D,
    element: WhiteboardElement
  ): void {
    if (
      element.x === undefined ||
      element.y === undefined ||
      element.width === undefined ||
      element.height === undefined
    ) {
      return;
    }

    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    const radiusX = Math.abs(element.width / 2);
    const radiusY = Math.abs(element.height / 2);

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawArrow(
    ctx: CanvasRenderingContext2D,
    element: WhiteboardElement
  ): void {
    if (
      element.x === undefined ||
      element.y === undefined ||
      element.x2 === undefined ||
      element.y2 === undefined
    ) {
      return;
    }

    const x1 = element.x;
    const y1 = element.y;
    const x2 = element.x2;
    const y2 = element.y2;

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowSize = 12;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(
      x2 - arrowSize * Math.cos(angle - Math.PI / 6),
      y2 - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(x2, y2);
    ctx.lineTo(
      x2 - arrowSize * Math.cos(angle + Math.PI / 6),
      y2 - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  }

  private drawText(
    ctx: CanvasRenderingContext2D,
    element: WhiteboardElement
  ): void {
    if (
      element.x === undefined ||
      element.y === undefined ||
      !element.text
    ) {
      return;
    }

    ctx.fillStyle = element.stroke;
    ctx.font = `${element.strokeWidth * 6}px Arial`;
    ctx.fillText(element.text, element.x, element.y);
  }

  private drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    zoom: number
  ): void {
    const gridSize = 25;

    ctx.save();
    ctx.strokeStyle = '#6e6e6e3d';
    ctx.lineWidth = 1;

    const scaledGrid = gridSize * zoom;

    for (let x = 0; x <= width; x += scaledGrid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += scaledGrid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }
}
