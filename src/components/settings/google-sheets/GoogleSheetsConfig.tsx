
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, RefreshCwIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Settings } from "@/services/settingsService";
import { 
  listSpreadsheets, 
  SpreadsheetInfo, 
  checkGoogleApiStatus, 
  GoogleApiStatus,
  listWorksheets,
  WorksheetInfo 
} from "@/services/googleSheetsService";
import { SelectedSpreadsheet } from "./SelectedSpreadsheet";
import { SpreadsheetSelector } from "./SpreadsheetSelector";
import { Skeleton } from "@/components/ui/skeleton";

interface GoogleSheetsConfigProps {
  defaultValues: Partial<Settings>;
  onSubmit: (data: Settings) => Promise<void>;
  isSaving: boolean;
}

export const GoogleSheetsConfig = ({ defaultValues, onSubmit, isSaving }: GoogleSheetsConfigProps) => {
  const { session } = useAuth();
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetInfo[]>([]);
  const [worksheets, setWorksheets] = useState<WorksheetInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWorksheets, setIsLoadingWorksheets] = useState(false);
  const [apiStatus, setApiStatus] = useState<GoogleApiStatus>(GoogleApiStatus.NEEDS_AUTH);
  const dataFetchedRef = useRef(false);
  
  const getSpreadsheets = useCallback(async () => {
    if (!session) return;
    
    setIsLoading(true);
    
    try {
      const status = await checkGoogleApiStatus(session);
      setApiStatus(status);
      
      if (status === GoogleApiStatus.READY) {
        const sheets = await listSpreadsheets(session);
        if (sheets) {
          setSpreadsheets(sheets);
        }
      }
    } catch (error) {
      console.error("Error fetching spreadsheets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);
  
  const getWorksheets = useCallback(async (spreadsheetId: string) => {
    if (!session || !spreadsheetId) return;
    
    setIsLoadingWorksheets(true);
    
    try {
      const sheets = await listWorksheets(session, spreadsheetId);
      if (sheets) {
        setWorksheets(sheets);
      }
    } catch (error) {
      console.error("Error fetching worksheets:", error);
    } finally {
      setIsLoadingWorksheets(false);
    }
  }, [session]);
  
  // Utiliser useEffect avec ref pour éviter les doubles chargements
  useEffect(() => {
    if (!dataFetchedRef.current) {
      getSpreadsheets();
      dataFetchedRef.current = true;
    }
  }, [getSpreadsheets]);
  
  // Charger les worksheets seulement quand l'ID du spreadsheet change
  useEffect(() => {
    if (defaultValues.spreadsheetId) {
      getWorksheets(defaultValues.spreadsheetId);
    }
  }, [defaultValues.spreadsheetId, getWorksheets]);
  
  const handleSelectSpreadsheet = async (spreadsheetId: string, name: string) => {
    await onSubmit({
      spreadsheetId,
      sheetName: defaultValues.sheetName || "Dépenses"
    });
    getWorksheets(spreadsheetId);
  };

  const handleSelectWorksheet = async (sheetName: string) => {
    if (defaultValues.spreadsheetId) {
      await onSubmit({
        spreadsheetId: defaultValues.spreadsheetId,
        sheetName
      });
    }
  };

  const selectedSpreadsheet = spreadsheets.find(sheet => sheet.id === defaultValues.spreadsheetId);

  // Classes partagées pour assurer une cohérence visuelle
  const labelClass = "font-medium"; // Toujours en gras, qu'on soit en chargement ou pas

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Configuration Google Sheets</span>
          {apiStatus === GoogleApiStatus.NEEDS_API_ACTIVATION && (
            <Alert variant="destructive" className="border-none bg-transparent p-0 m-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                API Google Drive non activée
              </AlertDescription>
            </Alert>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {selectedSpreadsheet ? (
          <SelectedSpreadsheet 
            spreadsheet={selectedSpreadsheet} 
            spreadsheetId={defaultValues.spreadsheetId || ""} 
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Sélectionnez un Google Sheets pour stocker vos dépenses
          </p>
        )}

        <SpreadsheetSelector 
          defaultValues={defaultValues}
          spreadsheets={spreadsheets}
          worksheets={worksheets}
          isLoading={isLoading}
          isLoadingWorksheets={isLoadingWorksheets}
          onSelectSpreadsheet={handleSelectSpreadsheet}
          onSelectWorksheet={handleSelectWorksheet}
          onRefresh={getSpreadsheets}
          apiStatus={apiStatus}
          labelClass={labelClass}
        />
        
        {apiStatus === GoogleApiStatus.READY && spreadsheets.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">
            Aucun Google Sheets trouvé sur votre compte. Vous pouvez en créer un sur 
            <a href="https://docs.google.com/spreadsheets" target="_blank" rel="noopener noreferrer" className="text-primary pl-1 hover:underline">
              Google Sheets
            </a>
          </p>
        )}
        
        {isLoading && (
          <div className="flex items-center pt-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm font-medium">Chargement des Google Sheets...</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4 pb-2">
        <div className="text-sm text-muted-foreground">
          {defaultValues.spreadsheetId ? (
            <span>Spreadsheet ID: {defaultValues.spreadsheetId.substring(0, 6)}...</span>
          ) : (
            <span>Aucun spreadsheet sélectionné</span>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={getSpreadsheets}
          disabled={isLoading || apiStatus !== GoogleApiStatus.READY}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCwIcon className="h-4 w-4 mr-2" />
          )}
          Actualiser
        </Button>
      </CardFooter>
    </Card>
  );
};
