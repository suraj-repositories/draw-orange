import { Injectable, signal } from '@angular/core';
import { WhiteboardElement } from '../models/element.model';
import { Tool } from '../models/tool.model';
import { HistoryService } from './history.service';

@Injectable({
  providedIn: 'root'
})
export class WhiteboardStateService {

  private history = new HistoryService();
  readonly elements = signal<WhiteboardElement[]>([]);
  readonly activeTool = signal<Tool>(Tool.SELECT);
  readonly strokeColor = signal<string>('#000000');
  readonly strokeWidth = signal<any>(2);

  readonly zoom = signal(1);
  readonly showGrid = signal(false);
  setTool(tool: Tool): void {
    this.activeTool.set(tool);
  }

  addElement(element: WhiteboardElement): void {
    this.history.save(this.elements());
    this.elements.update(elements => [
      ...elements,
      element
    ]);
  }

  updateElements(elements: WhiteboardElement[]): void {
    this.elements.set(elements);
  }

  clearCanvas(): void {
    if (this.elements().length === 0) {
      return;
    }
    this.history.save(this.elements());
    this.elements.set([]);
  }

  undo(): void {
    const result = this.history.undo(this.elements());
    if (result) {
      this.elements.set(result);
    }
  }

  redo(): void {
    const result = this.history.redo(this.elements());
    if (result) {
      this.elements.set(result);
    }
  }

  zoomIn(): void {
    this.zoom.update(value =>
      Math.min(value + 0.1, 5)
    );
  }

  zoomOut(): void {
    this.zoom.update(value =>
      Math.max(value - 0.1, 0.1)
    );
  }

  resetZoom(): void {
    this.zoom.set(1);
  }

  toggleGrid(): void {
    this.showGrid.update(value => !value);
  }

  setElements(elements: WhiteboardElement[]): void {
    this.elements.set(elements);
    this.history.clear();
  }

  setStrokeColor(color: string): void {
    this.strokeColor.set(color);
  }
}
