
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" disabled={apiStatus !== GoogleApiStatus.READY || isLoading}>
              Choisir
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sélectionner un Google Sheets</SheetTitle>
            </SheetHeader>
            <div className="py-6">
              {spreadsheets.length > 0 ? (
                <ul className="space-y-2">
                  {spreadsheets.map((sheet) => (
                    <li key={sheet.id}>
                      <button
                        onClick={() => {
                          onSelectSpreadsheet(sheet.id, sheet.name);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent ${
                          sheet.id === defaultValues.spreadsheetId
                            ? "bg-accent"
                            : ""
                        }`}
                      >
                        <div className="font-medium">{sheet.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(sheet.createdTime).toLocaleDateString()}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  Aucun Google Sheets trouvé sur votre compte
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isLoading}
              className="mt-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Actualiser la liste
            </Button>
          </SheetContent>
        </Sheet>
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
