
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Settings } from "@/types/settings";
import { GoogleApiStatus, SpreadsheetInfo, WorksheetInfo } from "@/types/googleSheets";
import { SelectedSpreadsheet } from "./SelectedSpreadsheet";
import { SpreadsheetSelector } from "./SpreadsheetSelector";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";

interface GoogleSheetsConfigProps {
  defaultValues: Partial<Settings>;
  onSubmit: (data: Settings) => Promise<void>;
  isSaving: boolean;
}

export const GoogleSheetsConfig = ({ defaultValues, onSubmit, isSaving }: GoogleSheetsConfigProps) => {
  const { session } = useAuth();
  const { useApiQuery, useApiMutation } = useApi();
  const [isLoadingWorksheets, setIsLoadingWorksheets] = useState(false);
  
  // Utilisation de React Query pour charger le statut de l'API Google
  const { 
    data: apiStatus = GoogleApiStatus.READY,
    isLoading: isLoadingStatus 
  } = useApiQuery<GoogleApiStatus>(
    "google/status",
    ["googleApiStatus"],
    { 
      queryOptions: {
        enabled: !!session,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    }
  );
  
  // Utilisation de React Query pour charger la liste des spreadsheets
  const { 
    data: spreadsheets = [], 
    isLoading: isLoadingSpreadsheets,
    refetch: refetchSpreadsheets
  } = useApiQuery<SpreadsheetInfo[]>(
    "sheets/list", 
    ["spreadsheets"], 
    {
      queryOptions: {
        enabled: !!session && apiStatus === GoogleApiStatus.READY,
        staleTime: 2 * 60 * 1000, // 2 minutes
      },
      mockDelay: 800
    }
  );
  
  // Utilisation de React Query pour charger les worksheets
  const { 
    data: worksheets = [], 
    refetch: refetchWorksheets 
  } = useApiQuery<WorksheetInfo[]>(
    "sheets/tabs", 
    ["worksheets", defaultValues.spreadsheetId || ""], 
    {
      queryOptions: {
        enabled: !!session && !!defaultValues.spreadsheetId,
        staleTime: 2 * 60 * 1000, // 2 minutes
      },
      mockDelay: 500
    }
  );
  
  // Fonction pour rafraîchir les spreadsheets
  const getSpreadsheets = async () => {
    try {
      await refetchSpreadsheets();
    } catch (error) {
      console.error("Error refetching spreadsheets:", error);
    }
  };
  
  // Fonction pour charger les worksheets d'un spreadsheet
  const getWorksheets = async (spreadsheetId: string) => {
    if (!session || !spreadsheetId) return;
    
    setIsLoadingWorksheets(true);
    try {
      await refetchWorksheets();
    } catch (error) {
      console.error("Error fetching worksheets:", error);
    } finally {
      setIsLoadingWorksheets(false);
    }
  };
  
  // Charger les worksheets quand le spreadsheetId change
  useEffect(() => {
    if (defaultValues.spreadsheetId) {
      getWorksheets(defaultValues.spreadsheetId);
    }
  }, [defaultValues.spreadsheetId]);
  
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
  const isLoading = isLoadingStatus || isLoadingSpreadsheets;

  // Shared classes for consistent visual styling
  const labelClass = "font-medium";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Configuration Google Sheets</span>
        </CardTitle>
        <CardDescription>
          Sélectionnez le Google Sheets et l'onglet où stocker vos données
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {selectedSpreadsheet ? (
          <SelectedSpreadsheet 
            spreadsheet={selectedSpreadsheet} 
            spreadsheetId={defaultValues.spreadsheetId || ""} 
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Sélectionnez un Google Sheets pour stocker vos données
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
    </Card>
  );
};

