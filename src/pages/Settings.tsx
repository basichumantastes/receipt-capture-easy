
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSheetsConfig, SettingsFormValues } from "@/components/settings/GoogleSheetsConfig";
import { fetchSettings, saveSettings, Settings } from "@/services/settingsService";

const SettingsPage = () => {
  const { isAuthenticated, session } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  // Default values that will be updated if we have stored settings
  const [defaultValues, setDefaultValues] = useState<Partial<SettingsFormValues>>({
    spreadsheetId: "",
    sheetName: "Dépenses",
  });
  
  // Fetch existing settings
  useEffect(() => {
    const getSettings = async () => {
      if (!isAuthenticated) return;
      
      const existingSettings = await fetchSettings(session);
      
      if (existingSettings) {
        setDefaultValues(existingSettings);
      }
    };
    
    getSettings();
  }, [isAuthenticated, session]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSaving(true);
    
    try {
      const result = await saveSettings(data, session);
      
      if (!result.success) {
        throw result.error || new Error("Unknown error occurred");
      }
      
      toast("Paramètres sauvegardés", {
        description: "Vos paramètres Google Sheets ont été mis à jour avec succès."
      });
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
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

  return (
    <div className="container max-w-5xl py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Paramètres</h1>
      
      <div className="grid gap-8">
        <GoogleSheetsConfig 
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};

export default SettingsPage;
