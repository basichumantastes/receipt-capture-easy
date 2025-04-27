
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SpreadsheetSelector } from "./SpreadsheetSelector";
import { listSpreadsheets, SpreadsheetInfo, checkGoogleApiStatus, GoogleApiStatus, listWorksheets, WorksheetInfo } from "@/services/googleSheetsService";
import { useAuth } from "@/contexts/AuthContext";
import { Settings } from "@/services/settingsService";
import { Loader2, AlertCircle, FileSpreadsheet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GoogleSheetsConfigProps {
  defaultValues: Partial<Settings>;
  onSubmit: (data: Settings) => Promise<void>;
  isSaving: boolean;
}

export const GoogleSheetsConfig: React.FC<GoogleSheetsConfigProps> = ({ 
  defaultValues, 
  onSubmit,
  isSaving
}) => {
  const { session } = useAuth();
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetInfo[]>([]);
  const [worksheets, setWorksheets] = useState<WorksheetInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWorksheets, setIsLoadingWorksheets] = useState(false);
  const [apiStatus, setApiStatus] = useState<GoogleApiStatus>(GoogleApiStatus.NEEDS_AUTH);
  
  const getSpreadsheets = async () => {
    if (!session) return;
    
    setIsLoading(true);
    
    try {
      // First check API configuration status
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
  };
  
  const getWorksheets = async (spreadsheetId: string) => {
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
  };
  
  useEffect(() => {
    getSpreadsheets();
  }, [session]);
  
  useEffect(() => {
    if (defaultValues.spreadsheetId) {
      getWorksheets(defaultValues.spreadsheetId);
    }
  }, [defaultValues.spreadsheetId, session]);
  
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

  // Find currently selected spreadsheet name
  const selectedSpreadsheet = spreadsheets.find(sheet => sheet.id === defaultValues.spreadsheetId);

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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">Google Sheets actuel</h3>
                <p className="text-sm text-green-700">{selectedSpreadsheet.name}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sélectionnez un Google Sheets pour stocker vos dépenses
          </p>
        )}

        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="spreadsheet" className="font-medium">
              Sélectionner un Google Sheets
            </label>
            <SpreadsheetSelector 
              spreadsheets={spreadsheets}
              isLoading={isLoading}
              onSelect={handleSelectSpreadsheet}
              onRefresh={getSpreadsheets}
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
                onValueChange={handleSelectWorksheet}
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
              <span className="text-sm">Chargement des Google Sheets...</span>
            </div>
          )}

          {isLoadingWorksheets && (
            <div className="flex items-center pt-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Chargement des onglets...</span>
            </div>
          )}
        </div>
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
            <RefreshIcon className="h-4 w-4 mr-2" />
          )}
          Actualiser
        </Button>
      </CardFooter>
    </Card>
  );
};

function RefreshIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
    </svg>
  );
}
