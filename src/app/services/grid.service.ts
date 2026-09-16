import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  readonly size = 25;
  getGridSize(zoom: number): number {
    return this.size * zoom;
  }
}
