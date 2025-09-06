
export enum Tool {
    PEN = 'PEN',
    ERASER = 'ERASER',
}

export interface DrawingState {
    tool: Tool;
    color: string;
    lineWidth: number;
}
