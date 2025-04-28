import React, { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSpreadsheetsQuery } from "@/hooks/useSpreadsheetsQuery";
import { GoogleSheetsForm, SettingsFormValues } from "./GoogleSheetsForm";
import { SpreadsheetSelector } from "./SpreadsheetSelector";
import { useError } from "@/hooks/useError";

interface GoogleSheetsConfigProps {
  defaultValues: Partial<SettingsFormValues>;
  onSubmit: (data: SettingsFormValues) => Promise<void>;
  isSaving: boolean;
}

export const GoogleSheetsConfig = ({ defaultValues, onSubmit, isSaving }: GoogleSheetsConfigProps) => {
  const { session } = useAuth();
  const { data: spreadsheets = [], isLoading, error: loadError } = useSpreadsheetsQuery(session);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string | undefined>();
  const handleError = useError();

  // Gérer les erreurs de chargement des spreadsheets
  React.useEffect(() => {
    if (loadError) {
      handleError(loadError as Error, {
        type: 'api',
        context: 'Chargement des Google Sheets',
        displayMode: 'toast'
      });
    }
  }, [loadError, handleError]);

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
