import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  effect,
  inject
} from '@angular/core';

import { DrawingService } from '../services/drawing.service';
import { WhiteboardStateService } from '../services/whiteboard-state.service';
import { Tool } from '../models/tool.model';
import { Point } from '../models/element.model';

import { PenTool } from '../tools/pen.tool';
import { HighlighterTool } from '../tools/highlighter.tool';
import { LineTool } from '../tools/line.tool';
import { RectangleTool } from '../tools/rectangle.tool';
import { CircleTool } from '../tools/circle.tool';
import { ArrowTool } from '../tools/arrow.tool';
import { EraserTool } from '../tools/eraser.tool';
import { TextTool } from '../tools/text.tool';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;

  private state = inject(WhiteboardStateService);
  private drawing = inject(DrawingService);

  private penTool = new PenTool();
  private highlighterTool = new HighlighterTool();
  private lineTool = new LineTool();
  private rectangleTool = new RectangleTool();
  private circleTool = new CircleTool();
  private arrowTool = new ArrowTool();
  private eraserTool = new EraserTool();
  private textTool = new TextTool();

  private isDrawing = false;
  private startPoint: Point | null = null;
  private currentPoints: Point[] = [];

  constructor() {
    effect(() => {
      this.state.elements();
      this.state.zoom();
      this.state.showGrid();

      if (this.canvasRef?.nativeElement) {
        this.render();
      }
    });
  }

  ngAfterViewInit(): void {
    this.resizeCanvas();
    this.render();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeCanvas();
    this.render();
  }

  onPointerDown(event: PointerEvent): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.setPointerCapture(event.pointerId);

    const point = this.getPoint(event);
    const tool = this.state.activeTool();
    const currentColor = this.state.strokeColor();
    const currentStrokeWidth = this.state.strokeColor();

    if (tool === Tool.TEXT) {
      const text = window.prompt('Enter text');
      if (text) {
        const element = this.textTool.create(
          point,
          text,
          currentColor,
          currentStrokeWidth
        );
        this.state.addElement(element);
      }
      return;
    }

    if (tool === Tool.ERASER) {
      this.isDrawing = true;
      this.eraseAtPoint(point);
      return;
    }

    this.isDrawing = true;
    this.startPoint = point;
    this.currentPoints = [point];
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDrawing) {
      return;
    }

    const point = this.getPoint(event);
    const tool = this.state.activeTool();

    if (tool === Tool.ERASER) {
      this.eraseAtPoint(point);
      return;
    }

    if (tool === Tool.PEN || tool === Tool.HIGHLIGHTER) {
      this.currentPoints.push(point);
      this.renderPreview();
    }
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isDrawing) {
      this.releasePointer(event);
      return;
    }

    const tool = this.state.activeTool();

    if (tool === Tool.ERASER) {
      this.isDrawing = false;
      this.startPoint = null;
      this.currentPoints = [];

      this.releasePointer(event);
      this.render();
      return;
    }

    if (!this.startPoint) {
      this.isDrawing = false;
      this.currentPoints = [];

      this.releasePointer(event);
      return;
    }

    const endPoint = this.getPoint(event);
    const currentColor = this.state.strokeColor();
    const currentStrokeWidth = this.state.strokeWidth();

    let element = null;

    switch (tool) {
      case Tool.PEN:
        element = this.penTool.create(
          this.currentPoints,
          currentColor,
          currentStrokeWidth
        );
        break;

      case Tool.HIGHLIGHTER:
        element = this.highlighterTool.create(
          this.currentPoints,
          currentColor,
          15
        );
        break;

      case Tool.LINE:
        element = this.lineTool.create(
          this.startPoint,
          endPoint,
          currentColor,
          currentStrokeWidth
        );
        break;

      case Tool.RECTANGLE:
        element = this.rectangleTool.create(
          this.startPoint,
          endPoint,
          currentColor,
          currentStrokeWidth
        );
        break;

      case Tool.CIRCLE:
        element = this.circleTool.create(
          this.startPoint,
          endPoint,
          currentColor,
          currentStrokeWidth
        );
        break;

      case Tool.ARROW:
        element = this.arrowTool.create(
          this.startPoint,
          endPoint,
          currentColor,
          currentStrokeWidth
        );
        break;
    }

    if (element) {
      this.state.addElement(element);
    }

    this.isDrawing = false;
    this.startPoint = null;
    this.currentPoints = [];

    this.releasePointer(event);
    this.render();
  }

  onPointerCancel(event: PointerEvent): void {
    this.isDrawing = false;
    this.startPoint = null;
    this.currentPoints = [];

    this.releasePointer(event);
    this.render();
  }

  private eraseAtPoint(point: Point): void {
    const elements = this.eraserTool.findElementsToDelete(
      point,
      this.state.elements()
    );

    if (!elements.length) {
      return;
    }

    const ids = new Set(elements.map(element => element.id));
    const remaining = this.state.elements().filter(element => !ids.has(element.id));

    this.state.updateElements(remaining);
  }

  private releasePointer(event: PointerEvent): void {
    const canvas = this.canvasRef.nativeElement;

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  private getPoint(event: PointerEvent): Point {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const zoom = this.state.zoom();

    return {
      x: (event.clientX - rect.left) / zoom,
      y: (event.clientY - rect.top) / zoom
    };
  }

  private render(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    this.drawing.render(
      ctx,
      this.state.elements(),
      this.state.zoom(),
      this.state.showGrid(),
      canvas.width,
      canvas.height
    );
  }

  private renderPreview(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    this.render();

    if (this.currentPoints.length < 2) {
      return;
    }

    ctx.save();
    ctx.scale(this.state.zoom(), this.state.zoom());

    const isHighlighter = this.state.activeTool() === Tool.HIGHLIGHTER;

    ctx.strokeStyle = this.state.strokeColor();
    ctx.globalAlpha = isHighlighter ? 0.35 : 1;
    ctx.lineWidth = isHighlighter ? 15 : 2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(this.currentPoints[0].x, this.currentPoints[0].y);

    for (let i = 1; i < this.currentPoints.length; i++) {
      ctx.lineTo(this.currentPoints[i].x, this.currentPoints[i].y);
    }

    ctx.stroke();
    ctx.restore();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  get currentTool(): string {
    return this.state.activeTool()?.toUpperCase() ?? '';
  }

}
