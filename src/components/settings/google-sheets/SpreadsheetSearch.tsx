
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { GoogleApiStatus, SpreadsheetInfo } from "@/services/googleSheetsService";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface SpreadsheetSearchProps {
  spreadsheets: SpreadsheetInfo[];
  isLoading: boolean;
  onSelect: (id: string, name: string) => void;
  onRefresh: () => void;
  selectedId: string | undefined;
  apiStatus: GoogleApiStatus;
}

export const SpreadsheetSearch = ({
  spreadsheets,
  isLoading,
  onSelect,
  onRefresh,
  selectedId,
  apiStatus,
}: SpreadsheetSearchProps) => {
  return (
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
                      onSelect(sheet.id, sheet.name);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent ${
                      sheet.id === selectedId
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
  );
};
