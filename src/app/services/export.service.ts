import { Injectable } from '@angular/core';
import { WhiteboardElement } from '../models/element.model';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  export(elements: WhiteboardElement[]): void {
    const data = JSON.stringify(elements, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'whiteboard.json';
    link.click();

    URL.revokeObjectURL(url);
  }

  import(file: File): Promise<WhiteboardElement[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const elements = JSON.parse(reader.result as string);

          if (!Array.isArray(elements)) {
            throw new Error('Invalid whiteboard file');
          }

          resolve(elements);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(reader.error);
      };

      reader.readAsText(file);
    });
  }
}
