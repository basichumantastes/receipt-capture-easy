
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GoogleApiStatus, SpreadsheetInfo, WorksheetInfo } from "@/services/googleSheetsService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

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
  labelClass?: string;
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
  labelClass = "font-medium"
}: SpreadsheetSelectorProps) => {
  const selectedSpreadsheet = spreadsheets.find(sheet => sheet.id === defaultValues.spreadsheetId);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrer les spreadsheets en fonction de la recherche
  const filteredSpreadsheets = spreadsheets.filter(sheet => 
    sheet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <label htmlFor="spreadsheet" className={labelClass}>
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
            
            {/* Champ de recherche */}
            <div className="py-4">
              <div className="flex items-center border rounded-md px-3 mb-4">
                <Search className="h-4 w-4 mr-2 opacity-50" />
                <Input 
                  placeholder="Rechercher un Google Sheets..." 
                  className="flex h-9 w-full rounded-md border-0 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="py-2">
              {filteredSpreadsheets.length > 0 ? (
                <ScrollArea className="h-[300px] pr-4">
                  <ul className="space-y-2">
                    {filteredSpreadsheets.map((sheet) => (
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
                </ScrollArea>
              ) : searchQuery ? (
                <p className="text-muted-foreground">
                  Aucun Google Sheets ne correspond à votre recherche
                </p>
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
              className="mt-4"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Actualiser la liste
            </Button>
          </SheetContent>
        </Sheet>
      </div>
      
      {selectedSpreadsheet && (
        <div className="flex justify-between items-center">
          <label htmlFor="worksheet" className={labelClass}>
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
          <span className="text-sm font-medium">Chargement des onglets...</span>
        </div>
      )}
    </div>
  );
};
