
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { FileSpreadsheet, Table2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const settingsFormSchema = z.object({
  spreadsheetId: z.string().min(1, "Veuillez saisir l'ID du Google Sheets"),
  sheetName: z.string().min(1, "Veuillez saisir le nom de la feuille"),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const Settings = () => {
  const { isAuthenticated, session } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  // Default values that will be updated if we have stored settings
  const [defaultValues, setDefaultValues] = useState<Partial<SettingsFormValues>>({
    spreadsheetId: "",
    sheetName: "Dépenses",
  });
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });
  
  // Fetch existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!isAuthenticated) return;
        
        const { data: existingSettings } = await supabase.functions.invoke('get-settings', {
          headers: session?.access_token 
            ? { Authorization: `Bearer ${session.access_token}` } 
            : undefined
        });
        
        if (existingSettings && existingSettings.spreadsheetId) {
          setDefaultValues(existingSettings);
          form.reset(existingSettings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    
    fetchSettings();
  }, [isAuthenticated, session]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSaving(true);
    
    try {
      if (!isAuthenticated || !session?.access_token) {
        throw new Error("You must be logged in to save settings");
      }
      
      // Save settings using edge function
      const { error } = await supabase.functions.invoke('save-settings', {
        body: data,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      // Also need to update the environment variables for the edge functions
      // We need admin privileges for this, so we'll use a separate function
      const { error: envError } = await supabase.functions.invoke('update-env-vars', {
        body: {
          SPREADSHEET_ID: data.spreadsheetId,
          SHEET_NAME: data.sheetName
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (envError) {
        console.error("Error updating environment variables:", envError);
        // This is not critical, so we'll just log it and continue
      }
      
      toast("Paramètres sauvegardés", {
        description: "Vos paramètres Google Sheets ont été mis à jour avec succès."
      });
    } catch (error) {
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="spreadsheetId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID du Google Sheets</FormLabel>
                        <FormControl>
                          <Input placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" {...field} />
                        </FormControl>
                        <FormDescription>
                          L'ID de votre feuille Google Sheets se trouve dans l'URL (entre "d/" et "/edit")
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sheetName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la feuille</FormLabel>
                        <FormControl>
                          <Input placeholder="Dépenses" {...field} />
                        </FormControl>
                        <FormDescription>
                          Le nom de l'onglet dans lequel écrire les données
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                    <Table2 className="h-5 w-5 text-primary" />
                    Configuration des colonnes
                  </h3>
                  
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-md mb-6">
                    <p className="text-orange-800 text-sm">
                      L'application écrit actuellement dans des colonnes fixes (A à E) dans l'ordre suivant : Date, Commerçant, Montant TTC, Catégorie, Motif. 
                      Assurez-vous que votre feuille de calcul suit ce format.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Enregistrement..." : "Enregistrer les paramètres"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
