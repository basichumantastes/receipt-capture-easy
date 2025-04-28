
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNotify } from "@/hooks/useNotify";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSheetsConfig } from "@/components/settings/google-sheets/GoogleSheetsConfig";
import { useSettingsQuery, useSaveSettingsMutation, Settings } from "@/hooks/useSettingsQuery";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const SettingsPage = () => {
  const { isAuthenticated, session } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();
  
  // Use React Query hooks
  const { data: settings, isLoading, error: fetchError } = useSettingsQuery(session);
  const { mutate: saveSettings, isPending: isSaving } = useSaveSettingsMutation(session);
  
  // Error state for form specific errors (not fetch errors)
  const [formError, setFormError] = useState<string | null>(null);

  // Default values that will be updated from settings
  const defaultValues = {
    spreadsheetId: settings?.spreadsheetId || "",
    sheetName: settings?.sheetName || "Dépenses",
  };

  const onSubmit = async (data: Settings) => {
    setFormError(null);
    saveSettings(data);
  };

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

  return (
    <div className="container max-w-5xl py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Paramètres</h1>
      
      {(fetchError || formError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{fetchError instanceof Error ? fetchError.message : formError}</AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Chargement des paramètres...</span>
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
