export interface CellFor3270 {
  id: string;
  Terminal: string;
  screenNumber: number;
}

interface Terminal {
  id: string;
  runId: string;
  sequence: number;
  images: TerminalImage[];
  defaultSize: TerminalSize;
}

export interface TerminalImage {
  id: string;
  sequence?: number;
  inbound?: boolean;
  type?: string;
  imageSize: TerminalSize;
  cursorRow?: number;
  cursorColumn?: number;
  aid?: string;
  fields: TerminalImageField[];
}

export interface TerminalImageField {
  row: number;
  column: number;
  unformatted?: boolean;
  fieldProtected?: boolean;
  fieldNumeric?: boolean;
  fieldDisplay?: boolean;
  fieldIntenseDisplay?: boolean;
  fieldSelectorPen?: boolean;
  fieldModified?: boolean;
  foregroundColor?: string;
  backgroundColor?: string;
  highlight?: string;
  contents: FieldContents[];
}

export interface FieldContents {
  characters?: string[];
  text?: string;
}

export interface TerminalSize {
  rows: number;
  columns: number;
}
