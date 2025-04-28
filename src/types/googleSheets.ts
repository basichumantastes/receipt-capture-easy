
export enum GoogleApiStatus {
  READY,
  NEEDS_AUTH,
  NEEDS_API_ACTIVATION,
  ERROR
}

export interface SpreadsheetInfo {
  id: string;
  name: string;
  createdTime: string;
}

export interface WorksheetInfo {
  title: string;
  index: number;
}

