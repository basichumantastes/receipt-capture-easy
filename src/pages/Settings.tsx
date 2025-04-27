
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
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
import { FileSpreadsheet, Table2, Database } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const settingsFormSchema = z.object({
  spreadsheetUrl: z.string().url("Veuillez saisir une URL Google Sheets valide"),
  sheetName: z.string().min(1, "Veuillez saisir le nom de la feuille"),
  columnMappings: z.object({
    date: z.string().min(1, "Veuillez spécifier une colonne"),
    commercant: z.string().min(1, "Veuillez spécifier une colonne"),
    montant_ttc: z.string().min(1, "Veuillez spécifier une colonne"),
    categorie: z.string().min(1, "Veuillez spécifier une colonne"),
    motif: z.string().optional(),
  }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const Settings = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Les valeurs par défaut pour le formulaire pourraient venir d'une API ou du stockage local
  const defaultValues: Partial<SettingsFormValues> = {
    spreadsheetUrl: "",
    sheetName: "Dépenses",
    columnMappings: {
      date: "A",
      commercant: "B",
      montant_ttc: "C",
      categorie: "D",
      motif: "E",
    },
  };

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSaving(true);
    
    try {
      // Ici nous simulons la sauvegarde des paramètres
      // Dans une implémentation réelle, vous enverriez ces données à votre backend
      console.log("Saving settings:", data);
      
      // Simuler un délai de réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Afficher un toast de succès
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos paramètres Google Sheets ont été mis à jour avec succès.",
      });
      
      // Rediriger vers la page d'accueil ou rester sur la page
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la sauvegarde des paramètres.",
        variant: "destructive",
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
              Configurez la connexion et le mappage des colonnes pour votre feuille Google Sheets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="spreadsheetUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL du Google Sheets</FormLabel>
                        <FormControl>
                          <Input placeholder="https://docs.google.com/spreadsheets/d/..." {...field} />
                        </FormControl>
                        <FormDescription>
                          L'URL complet de votre feuille Google Sheets
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
                    Mappage des colonnes
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="columnMappings.date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input placeholder="A" {...field} />
                          </FormControl>
                          <FormDescription>
                            Colonne pour la date du ticket
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="columnMappings.commercant"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commerçant</FormLabel>
                          <FormControl>
                            <Input placeholder="B" {...field} />
                          </FormControl>
                          <FormDescription>
                            Colonne pour le nom du commerçant
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="columnMappings.montant_ttc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant TTC</FormLabel>
                          <FormControl>
                            <Input placeholder="C" {...field} />
                          </FormControl>
                          <FormDescription>
                            Colonne pour le montant TTC
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="columnMappings.categorie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie</FormLabel>
                          <FormControl>
                            <Input placeholder="D" {...field} />
                          </FormControl>
                          <FormDescription>
                            Colonne pour la catégorie
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="columnMappings.motif"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motif (optionnel)</FormLabel>
                          <FormControl>
                            <Input placeholder="E" {...field} />
                          </FormControl>
                          <FormDescription>
                            Colonne pour le motif de la dépense
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
