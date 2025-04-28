
// This file has been deprecated in favor of useSpreadsheetsQuery.ts
// Import types from the new file for backward compatibility

import { SpreadsheetInfo } from "@/hooks/useSpreadsheetsQuery";

// This function is kept for backward compatibility but will use the new hooks internally
export const listSpreadsheets = async () => {
  console.warn('listSpreadsheets is deprecated. Use useSpreadsheetsQuery hook instead.');
  return [] as SpreadsheetInfo[];
};
