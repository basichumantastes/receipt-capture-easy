
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SpreadsheetSelector } from "./SpreadsheetSelector";
import { listSpreadsheets, SpreadsheetInfo, checkGoogleApiStatus, GoogleApiStatus } from "@/services/googleSheetsService";
import { useAuth } from "@/contexts/AuthContext";
import { Settings } from "@/services/settingsService";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [isLoading, setIsLoading] = useState(false);
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
  
  useEffect(() => {
    getSpreadsheets();
  }, [session]);
  
  const handleSelectSpreadsheet = (spreadsheetId: string, name: string) => {
    // Create a form submission with the selected spreadsheet
    onSubmit({
      spreadsheetId,
      sheetName: defaultValues.sheetName || "Dépenses"
    });
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
        <CardDescription>
          {selectedSpreadsheet ? (
            <div className="text-sm text-muted-foreground mt-2">
              Spreadsheet actuel : <span className="font-medium">{selectedSpreadsheet.name}</span>
            </div>
          ) : (
            "Sélectionnez un Google Sheets pour stocker vos dépenses"
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="spreadsheet" className="font-medium">
              Google Sheets
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
