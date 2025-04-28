
import React, { useState } from "react";
import { FileSpreadsheet, AlertCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useSpreadsheetsQuery } from "@/hooks/useSpreadsheetsQuery";
import { GoogleSheetsForm, SettingsFormValues } from "./GoogleSheetsForm";
import { SpreadsheetSelector } from "./SpreadsheetSelector";

interface GoogleSheetsConfigProps {
  defaultValues: Partial<SettingsFormValues>;
  onSubmit: (data: SettingsFormValues) => Promise<void>;
  isSaving: boolean;
}

export const GoogleSheetsConfig = ({ defaultValues, onSubmit, isSaving }: GoogleSheetsConfigProps) => {
  const { session } = useAuth();
  const { data: spreadsheets = [], isLoading, error: loadError } = useSpreadsheetsQuery(session);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string | undefined>();

  const handleSelectSpreadsheet = (spreadsheetId: string) => {
    setSelectedSpreadsheetId(spreadsheetId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          <CardTitle>Configuration Google Sheets</CardTitle>
        </div>
        <CardDescription>
          Configurez la connexion et le nom de la feuille pour votre Google Sheets
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadError && (
          <Alert variant="default" className="mb-6 bg-orange-50 border-orange-200">
            <AlertCircle className="h-4 w-4 text-orange-800" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription className="text-orange-800">
              {loadError instanceof Error ? loadError.message : "Erreur lors du chargement des données"}
            </AlertDescription>
          </Alert>
        )}
        
        <GoogleSheetsForm 
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isSaving={isSaving}
          spreadsheetId={selectedSpreadsheetId}
        />
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div>
            {spreadsheets.length > 0 ? (
              <p>{spreadsheets.length} Google Sheets disponibles</p>
            ) : isLoading ? (
              <p>Chargement des Google Sheets...</p>
            ) : (
              <p>Aucun Google Sheets trouvé</p>
            )}
          </div>
          <SpreadsheetSelector
            onSelect={handleSelectSpreadsheet}
            selectedId={selectedSpreadsheetId}
          />
        </div>
        <p>
          <a 
            href="https://docs.google.com/spreadsheets/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Créer un nouveau Google Sheets
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};
