
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table2, FileSpreadsheet, Loader2, Search, RefreshCcw, AlertCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { SpreadsheetInfo, listSpreadsheets } from "@/services/googleSheetsService";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const settingsFormSchema = z.object({
  spreadsheetId: z.string().min(1, "Veuillez saisir l'ID du Google Sheets"),
  sheetName: z.string().min(1, "Veuillez saisir le nom de la feuille"),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface GoogleSheetsConfigProps {
  defaultValues: Partial<SettingsFormValues>;
  onSubmit: (data: SettingsFormValues) => Promise<void>;
  isSaving: boolean;
}

export const GoogleSheetsConfig = ({ defaultValues, onSubmit, isSaving }: GoogleSheetsConfigProps) => {
  const { session } = useAuth();
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
    mode: "onChange",
  });
  
  // Mise à jour du formulaire lorsque les valeurs par défaut changent
  useEffect(() => {
    if (defaultValues.spreadsheetId || defaultValues.sheetName) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);
  
  // Fonction pour charger la liste des spreadsheets
  const loadSpreadsheets = async () => {
    if (!session) {
      setLoadError("Vous devez être connecté pour charger vos Google Sheets");
      return;
    }
    
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const sheetsList = await listSpreadsheets(session);
      if (sheetsList) {
        setSpreadsheets(sheetsList);
        
        // Si aucun spreadsheet n'est trouvé, afficher un message
        if (sheetsList.length === 0) {
          setLoadError("Aucun Google Sheets trouvé dans votre compte. Assurez-vous d'avoir créé au moins un fichier Google Sheets accessible.");
        }
      }
    } catch (error: any) {
      console.error("Error loading spreadsheets:", error);
      setLoadError(`Erreur lors du chargement des Google Sheets: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Chargement initial de la liste des spreadsheets
  useEffect(() => {
    loadSpreadsheets();
  }, [session]);

  const handleSelectSpreadsheet = (spreadsheetId: string, spreadsheetName: string) => {
    form.setValue("spreadsheetId", spreadsheetId, { shouldValidate: true });
    setOpen(false);
  };

  return (
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
        {loadError && (
          <Alert variant="default" className="mb-6 bg-orange-50 border-orange-200">
            <AlertCircle className="h-4 w-4 text-orange-800" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription className="text-orange-800">{loadError}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="spreadsheetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID du Google Sheets</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" {...field} />
                        </FormControl>
                        
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              type="button"
                              aria-expanded={open}
                              className="w-10 p-0"
                              disabled={isLoading}
                            >
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0" align="start" side="bottom">
                            <Command>
                              <CommandInput placeholder="Rechercher un spreadsheet..." />
                              <CommandList>
                                <CommandEmpty>Aucun spreadsheet trouvé</CommandEmpty>
                                <CommandGroup>
                                  {spreadsheets.map((sheet) => (
                                    <CommandItem
                                      key={sheet.id}
                                      value={sheet.id}
                                      onSelect={() => handleSelectSpreadsheet(sheet.id, sheet.name)}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          sheet.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <span className="truncate">{sheet.name}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        
                        <Button 
                          variant="outline" 
                          type="button"
                          className="w-10 p-0"
                          onClick={() => loadSpreadsheets()}
                          disabled={isLoading}
                          title="Rafraîchir la liste"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormDescription>
                        L'ID de votre feuille Google Sheets se trouve dans l'URL (entre "d/" et "/edit")
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
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
              <Button type="submit" disabled={isSaving || !form.formState.isValid}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : "Enregistrer les paramètres"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6 text-sm text-muted-foreground">
        <div>
          {spreadsheets.length > 0 ? (
            <p>{spreadsheets.length} Google Sheets disponibles</p>
          ) : isLoading ? (
            <p>Chargement des Google Sheets...</p>
          ) : (
            <p>Aucun Google Sheets trouvé</p>
          )}
        </div>
        <p>
          <a 
            href="https://docs.google.com/spreadsheets/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Créer un nouveau Google Sheets
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};
