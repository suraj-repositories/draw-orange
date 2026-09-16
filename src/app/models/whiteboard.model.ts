import { WhiteboardElement } from './element.model';
import { Tool } from './tool.model';

export interface WhiteboardState {
  elements: WhiteboardElement[];
  activeTool: Tool;
  zoom: number;
  showGrid: boolean;
}
