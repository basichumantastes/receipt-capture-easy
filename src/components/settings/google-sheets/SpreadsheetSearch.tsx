
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { SpreadsheetSelector as SpreadsheetSearch } from "./SpreadsheetSearch";
import { GoogleApiStatus, SpreadsheetInfo, WorksheetInfo } from "@/services/googleSheetsService";

interface SpreadsheetSelectorProps {
  defaultValues: {
    spreadsheetId?: string;
    sheetName?: string;
  };
  spreadsheets: SpreadsheetInfo[];
  worksheets: WorksheetInfo[];
  isLoading: boolean;
  isLoadingWorksheets: boolean;
  onSelectSpreadsheet: (id: string, name: string) => void;
  onSelectWorksheet: (name: string) => void;
  onRefresh: () => void;
  apiStatus: GoogleApiStatus;
}

export const SpreadsheetSelector = ({
  defaultValues,
  spreadsheets,
  worksheets,
  isLoading,
  isLoadingWorksheets,
  onSelectSpreadsheet,
  onSelectWorksheet,
  onRefresh,
  apiStatus,
}: SpreadsheetSelectorProps) => {
  const selectedSpreadsheet = spreadsheets.find(sheet => sheet.id === defaultValues.spreadsheetId);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <label htmlFor="spreadsheet" className="font-medium">
          Sélectionner un Google Sheets
        </label>
        <SpreadsheetSearch 
          spreadsheets={spreadsheets}
          isLoading={isLoading}
          onSelect={onSelectSpreadsheet}
          onRefresh={onRefresh}
          selectedId={defaultValues.spreadsheetId}
          apiStatus={apiStatus}
        />
      </div>
      
      {selectedSpreadsheet && (
        <div className="flex justify-between items-center">
          <label htmlFor="worksheet" className="font-medium">
            Sélectionner un onglet
          </label>
          <Select
            value={defaultValues.sheetName}
            onValueChange={onSelectWorksheet}
            disabled={isLoadingWorksheets || !worksheets.length}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sélectionner l'onglet" />
            </SelectTrigger>
            <SelectContent>
              {worksheets.map((sheet) => (
                <SelectItem key={sheet.index} value={sheet.title}>
                  {sheet.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {isLoadingWorksheets && (
        <div className="flex items-center pt-2">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Chargement des onglets...</span>
        </div>
      )}
    </div>
  );
};
