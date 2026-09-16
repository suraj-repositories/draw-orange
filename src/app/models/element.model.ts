export type ElementType =
  | 'stroke'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'text';

export interface Point {
  x: number;
  y: number;
}

export interface WhiteboardElement {
  id: string;
  type: ElementType;

  points?: Point[];

  x?: number;
  y?: number;
  width?: number;
  height?: number;

  x2?: number;
  y2?: number;

  text?: string;

  stroke: string;
  strokeWidth: number;
  fill?: string;

  opacity?: number;
}
