import React from "react";
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
import { Loader2, Table2 } from "lucide-react";
import { useError } from "@/hooks/useError";
import { Alert, AlertDescription } from "@/components/ui/alert";

const settingsFormSchema = z.object({
  spreadsheetId: z
    .string()
    .min(1, "Veuillez saisir l'ID du Google Sheets")
    .regex(/^[a-zA-Z0-9-_]+$/, "L'ID du Google Sheets n'est pas valide"),
  sheetName: z
    .string()
    .min(1, "Veuillez saisir le nom de la feuille")
    .max(100, "Le nom de la feuille ne doit pas dépasser 100 caractères"),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface GoogleSheetsFormProps {
  defaultValues: Partial<SettingsFormValues>;
  onSubmit: (data: SettingsFormValues) => Promise<void>;
  isSaving: boolean;
  spreadsheetId?: string;
}

export const GoogleSheetsForm = ({ defaultValues, onSubmit, isSaving, spreadsheetId }: GoogleSheetsFormProps) => {
  const handleError = useError();
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
    mode: "onChange",
  });

  React.useEffect(() => {
    if (defaultValues.spreadsheetId || defaultValues.sheetName) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  React.useEffect(() => {
    if (spreadsheetId) {
      form.setValue("spreadsheetId", spreadsheetId, { 
        shouldValidate: true,
        shouldDirty: true
      });
    }
  }, [spreadsheetId, form]);

  const handleSubmit = async (data: SettingsFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      handleError(error as Error, {
        type: 'validation',
        context: 'Validation des paramètres',
        displayMode: 'alert'
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="spreadsheetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID du Google Sheets</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" 
                    {...field}
                    className={form.formState.errors.spreadsheetId ? "border-destructive" : ""}
                  />
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
                  <Input 
                    placeholder="Dépenses" 
                    {...field}
                    className={form.formState.errors.sheetName ? "border-destructive" : ""}
                  />
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
          
          <Alert>
            <AlertDescription>
              Les données sont écrites dans les colonnes A à E dans l'ordre suivant: 
              Date, Commerçant, Montant TTC, Catégorie, Motif. 
              Assurez-vous que votre feuille de calcul est configurée en conséquence.
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSaving || !form.formState.isValid || !form.formState.isDirty}
          >
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
  );
};
