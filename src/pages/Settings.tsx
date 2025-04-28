import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNotify } from "@/hooks/useNotify";
import { useError } from "@/hooks/useError";
import { GoogleSheetsConfig } from "@/components/settings/google-sheets/GoogleSheetsConfig";
import { fetchSettings, saveSettings, Settings } from "@/services/settingsService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const SettingsPage = () => {
  const { isAuthenticated, session } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();
  const handleError = useError();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default values that will be updated if we have stored settings
  const [defaultValues, setDefaultValues] = useState<Partial<Settings>>({
    spreadsheetId: "",
    sheetName: "Dépenses",
  });
  
  // Fetch existing settings
  useEffect(() => {
    const getSettings = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const existingSettings = await fetchSettings(session);
        
        if (existingSettings) {
          console.log("Loaded existing settings:", existingSettings);
          setDefaultValues(existingSettings);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
        setError("Impossible de récupérer les paramètres existants");
      } finally {
        setIsLoading(false);
      }
    };
    
    getSettings();
  }, [isAuthenticated, session]);

  const onSubmit = async (data: Settings) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const result = await saveSettings(data, session);
      
      if (!result.success) {
        throw result.error || new Error("Erreur inconnue");
      }
      
      notify.success("Paramètres sauvegardés", {
        description: "Vos paramètres Google Sheets ont été mis à jour avec succès."
      });
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
      handleError(error as Error, "Erreur lors de la sauvegarde des paramètres");
      setError(error.message || "Une erreur s'est produite lors de la sauvegarde des paramètres");
    } finally {
      setIsSaving(false);
    }
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
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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
