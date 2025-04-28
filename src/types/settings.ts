
export interface Settings {
  spreadsheetId?: string;
  sheetName?: string;
}

export interface SettingsSaveResult {
  success: boolean;
  error?: Error;
}

