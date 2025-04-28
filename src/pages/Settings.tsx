
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSheetsConfig } from "@/components/settings/google-sheets/GoogleSheetsConfig";
import { fetchSettings, saveSettings, Settings } from "@/services/settingsService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const SettingsPage = () => {
  const { isAuthenticated, session } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataFetchedRef = useRef(false);
  
  // Default values that will be updated if we have stored settings
  const [defaultValues, setDefaultValues] = useState<Partial<Settings>>({
    spreadsheetId: "",
    sheetName: "Dépenses",
  });
  
  // Memoize settings fetching to prevent unnecessary re-renders
  const getSettings = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    
    // Éviter les rechargements inutiles
    if (dataFetchedRef.current) {
      console.log("Settings already fetched, using cached data");
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
      
      // Marquer les données comme chargées
      dataFetchedRef.current = true;
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setError("Impossible de récupérer les paramètres existants");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, session]);
  
  // Fetch existing settings only once
  useEffect(() => {
    getSettings();
    
    // Récupérer les paramètres quand la session change
    return () => {
      dataFetchedRef.current = false;
    };
  }, [getSettings]);

  // Désactiver le rechargement automatique quand le focus change
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Ne rien faire lors du changement de visibilité
      console.log("Visibility changed, but not reloading data");
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const onSubmit = async (data: Settings) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const result = await saveSettings(data, session);
      
      if (!result.success) {
        throw result.error || new Error("Erreur inconnue");
      }
      
      // Update defaultValues without refetching from the server
      setDefaultValues(data);
      
      toast("Paramètres sauvegardés", {
        description: "Vos paramètres Google Sheets ont été mis à jour avec succès."
      });
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
      
      setError(error.message || "Une erreur s'est produite lors de la sauvegarde des paramètres");
      
      toast("Erreur", {
        description: `Une erreur s'est produite lors de la sauvegarde des paramètres: ${error.message}`,
        style: { backgroundColor: 'hsl(var(--destructive))' }
      });
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

  // Utiliser la même classe de style pour les titres, qu'on soit en chargement ou pas
  const labelClass = "text-3xl font-bold tracking-tight mb-8";

  return (
    <div className="container max-w-5xl py-12">
      <h1 className={labelClass}>Paramètres</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex flex-col space-y-8">
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
            <span className="text-lg font-medium">Chargement des paramètres...</span>
          </div>
          
          {/* Skeleton des composants de paramètres pour garder la même structure visuelle */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-7 w-56" />
            </div>
            <div className="space-y-4 pt-4">
              <Skeleton className="h-24 w-full" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-9 w-20" />
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
