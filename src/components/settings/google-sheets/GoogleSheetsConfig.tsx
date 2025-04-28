
import React, { useState, useEffect } from "react";
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
import { SpreadsheetInfo, listSpreadsheets } from "@/services/googleSheetsService";
import { GoogleSheetsForm, SettingsFormValues } from "./GoogleSheetsForm";
import { SpreadsheetSelector } from "./SpreadsheetSelector";

interface GoogleSheetsConfigProps {
  defaultValues: Partial<SettingsFormValues>;
  onSubmit: (data: SettingsFormValues) => Promise<void>;
  isSaving: boolean;
}

export const GoogleSheetsConfig = ({ defaultValues, onSubmit, isSaving }: GoogleSheetsConfigProps) => {
  const { session } = useAuth();
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string | undefined>();
  
  const loadSpreadsheets = async () => {
    if (!session) {
      setLoadError("Vous devez être connecté pour charger vos Google Sheets");
      return;
    }
    
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const sheetsList = await listSpreadsheets(session);
      if (sheetsList) {
        setSpreadsheets(sheetsList);
        
        if (sheetsList.length === 0) {
          setLoadError("Aucun Google Sheets trouvé dans votre compte. Assurez-vous d'avoir créé au moins un fichier Google Sheets accessible.");
        }
      }
    } catch (error: any) {
      console.error("Error loading spreadsheets:", error);
      setLoadError(`Erreur lors du chargement des Google Sheets: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadSpreadsheets();
  }, [session]);

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
            <AlertDescription className="text-orange-800">{loadError}</AlertDescription>
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
            spreadsheets={spreadsheets}
            isLoading={isLoading}
            onSelect={handleSelectSpreadsheet}
            onRefresh={loadSpreadsheets}
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
