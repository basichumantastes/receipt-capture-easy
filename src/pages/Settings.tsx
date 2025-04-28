
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSheetsConfig } from "@/components/settings/google-sheets/GoogleSheetsConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/useApi";
import { Settings } from "@/types/settings";

const SettingsPage = () => {
  const { isAuthenticated, session } = useAuth();
  const navigate = useNavigate();
  const { useApiQuery, useApiMutation } = useApi();
  
  // Charger les paramètres avec React Query
  const { 
    data: settings, 
    isLoading,
    error: settingsError
  } = useApiQuery<Settings>(
    "settings/get",
    ["settings"],
    { 
      queryOptions: {
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      mockDelay: 800
    }
  );
  
  // Mutation pour sauvegarder les paramètres
  const { 
    mutate: saveSettings,
    isPending: isSaving,
    error: saveError
  } = useApiMutation<{ success: boolean }, Settings>(
    "settings/save",
    {
      method: "POST",
      mutationOptions: {
        onSuccess: () => {
          toast("Paramètres sauvegardés", {
            description: "Vos paramètres Google Sheets ont été mis à jour avec succès."
          });
        }
      },
      mockDelay: 800
    }
  );
  
  // Valeurs par défaut
  const defaultValues: Settings = settings || {
    spreadsheetId: "",
    sheetName: "Dépenses",
  };
  
  const onSubmit = async (data: Settings) => {
    saveSettings(data);
  };

  const error = settingsError || saveError;

  if (!isAuthenticated) {
    return (
      <div className="container max-w-5xl py-12">
        <div className="flex flex-col items-center justify-center h-80">
          <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
          <p className="text-muted-foreground mb-6">
            Veuillez vous connecter pour accéder aux paramètres
          </p>
          <Button onClick={() => navigate("/login")}>Se connecter</Button>
        </div>
      </div>
    );
  }

  // Use the same style class for titles, whether loading or not
  const labelClass = "text-3xl font-bold tracking-tight mb-8";

  return (
    <div className="container max-w-5xl py-12">
      <h1 className={labelClass}>Paramètres</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Une erreur est survenue lors du chargement des paramètres"}
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex flex-col space-y-8">
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
            <span className="text-lg font-medium">Chargement des paramètres...</span>
          </div>
          
          {/* Skeleton for parameter components to maintain visual structure */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-7 w-56" />
            </div>
            <div className="space-y-4 pt-4">
              <Skeleton className="h-24 w-full" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-8">
          <GoogleSheetsConfig 
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isSaving={isSaving}
          />
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

