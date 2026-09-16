import {
  Component,
  ElementRef,
  HostListener,
  inject
} from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { WhiteboardStateService }
  from '../services/whiteboard-state.service';

import { ExportService }
  from '../services/export.service';

import { Tool }
  from '../models/tool.model';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {

  readonly whiteboard =
    inject(WhiteboardStateService);

  private exportService =
    inject(ExportService);

  readonly Tool = Tool;

  isMoreMenuOpen = false;

  constructor(
    private elementRef: ElementRef
  ) {}

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

    if (
      confirm(
        'Are you sure you want to clear the canvas?'
      )
    ) {
      this.whiteboard.clearCanvas();
    }

    this.closeMoreMenu();
  }

  exportCanvas(): void {

    this.exportService.export(
      this.whiteboard.elements()
    );

    this.closeMoreMenu();
  }

  importCanvas(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    this.exportService
      .import(file)
      .then(elements => {

        this.whiteboard.setElements(
          elements
        );

      })
      .catch(() => {

        alert(
          'Invalid whiteboard file.'
        );

      });

    input.value = '';

    this.closeMoreMenu();
  }

  toggleGrid(): void {

    this.whiteboard.toggleGrid();

    this.closeMoreMenu();
  }

  toggleMoreMenu(): void {
    this.isMoreMenuOpen =
      !this.isMoreMenuOpen;
  }

  closeMoreMenu(): void {
    this.isMoreMenuOpen = false;
  }

  @HostListener(
    'document:click',
    ['$event']
  )
  onDocumentClick(
    event: MouseEvent
  ): void {

    if (!this.isMoreMenuOpen) {
      return;
    }

    const target =
      event.target as Node;

    if (
      !this.elementRef
        .nativeElement
        .contains(target)
    ) {
      this.closeMoreMenu();
    }
  }
}
