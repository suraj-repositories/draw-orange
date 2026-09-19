import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { WhiteboardStateService } from '../services/whiteboard-state.service';
import { ExportService } from '../services/export.service';
import { Tool } from '../models/tool.model';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
})
export class ToolbarComponent {
  readonly whiteboard = inject(WhiteboardStateService);
  private exportService = inject(ExportService);

  readonly Tool = Tool;

  isMoreMenuOpen = false;
  isColorPickerOpen = false;

  selectedColor = '#000000';

  predefinedColors = [
    '#000000',
    '#ffffff',
    '#f44336',
    '#9c27b0',
    '#673ab7',
    '#03a9f4',
    '#4caf50',
    '#ffeb3b',
    '#ff9800',
  ];

  constructor(private elementRef: ElementRef) { }

  selectTool(tool: Tool): void {
    this.whiteboard.setTool(tool);
  }

  undo(): void {
    this.whiteboard.undo();
  }

  redo(): void {
    this.whiteboard.redo();
  }

  zoomIn(): void {
    this.whiteboard.zoomIn();
  }

  zoomOut(): void {
    this.whiteboard.zoomOut();
  }

  clearCanvas(): void {
    if (confirm('Are you sure you want to clear the canvas?')) {
      this.whiteboard.clearCanvas();
    }

    this.finalize();
  }

  exportCanvas(): void {
    this.exportService.export(this.whiteboard.elements());

    this.finalize();
  }

  importCanvas(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.exportService
      .import(file)
      .then((elements) => {
        this.whiteboard.setElements(elements);
      })
      .catch(() => {
        alert('Invalid whiteboard file.');
      });

    input.value = '';

    this.finalize();
  }

  toggleGrid(): void {
    this.whiteboard.toggleGrid();

    this.finalize();
  }

  toggleMoreMenu(): void {
    this.isMoreMenuOpen = !this.isMoreMenuOpen;

    if (this.isMoreMenuOpen) {
      this.closeColorPickerMenu();
    }
  }

  closeMoreMenu(): void {
    this.isMoreMenuOpen = false;
  }

  toggleColorPickerMenu(): void {
    this.isColorPickerOpen = !this.isColorPickerOpen;

    if (this.isColorPickerOpen) {
      this.closeMoreMenu();
    }
  }

  closeColorPickerMenu(): void {
    this.isColorPickerOpen = false;
  }

  selectColor(color: string): void {
    this.selectedColor = color;

    this.whiteboard.setStrokeColor(color);
    console.log('Selected color:', this.selectedColor);

    this.closeColorPickerMenu();
  }

  selectCustomColor(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.value) {
      return;
    }

    this.selectedColor = input.value;
    this.whiteboard.setStrokeColor(this.selectedColor);
    console.log('Selected custom color:', this.selectedColor);
  }

  finalize(): void {
    this.closeMoreMenu();
    this.closeColorPickerMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMoreMenuOpen && !this.isColorPickerOpen) {
      return;
    }

    const target = event.target as Node;

    if (!this.elementRef.nativeElement.contains(target)) {
      this.finalize();
    }
  }
}
