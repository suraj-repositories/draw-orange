import { Injectable } from '@angular/core';
import { WhiteboardElement } from '../models/element.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  private undoStack: WhiteboardElement[][] = [];
  private redoStack: WhiteboardElement[][] = [];

  save(elements: WhiteboardElement[]): void {
    this.undoStack.push(this.clone(elements));
    this.redoStack = [];
  }

  undo(current: WhiteboardElement[]): WhiteboardElement[] | null {
    if (this.undoStack.length === 0) {
      return null;
    }
    this.redoStack.push(this.clone(current));
    return this.clone(this.undoStack.pop()!);
  }

  redo(current: WhiteboardElement[]): WhiteboardElement[] | null {
    if (this.redoStack.length === 0) {
      return null;
    }
    this.undoStack.push(this.clone(current));
    return this.clone(this.redoStack.pop()!);
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  private clone(elements: WhiteboardElement[]): WhiteboardElement[] {
    return structuredClone(elements);
  }
}
