
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
import { Table2, FileSpreadsheet, Loader2, Search } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  
  // Chargement de la liste des spreadsheets
  useEffect(() => {
    const loadSpreadsheets = async () => {
      if (!session) return;
      
      setIsLoading(true);
      try {
        const sheetsList = await listSpreadsheets(session);
        if (sheetsList) {
          setSpreadsheets(sheetsList);
        }
      } catch (error) {
        console.error("Error loading spreadsheets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
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
    </Card>
  );
};
