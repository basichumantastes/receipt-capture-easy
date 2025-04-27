
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

const settingsFormSchema = z.object({
  spreadsheetId: z.string().min(1, "Veuillez saisir l'ID du Google Sheets"),
  sheetName: z.string().min(1, "Veuillez saisir le nom de la feuille"),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface GoogleSheetsFormProps {
  defaultValues: Partial<SettingsFormValues>;
  onSubmit: (data: SettingsFormValues) => Promise<void>;
  isSaving: boolean;
  spreadsheetId?: string;
  disabled?: boolean; // Added the missing disabled prop
}

export const GoogleSheetsForm = ({ defaultValues, onSubmit, isSaving, spreadsheetId, disabled }: GoogleSheetsFormProps) => {
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
      form.setValue("spreadsheetId", spreadsheetId, { shouldValidate: true });
    }
  }, [spreadsheetId, form]);

  return (
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
                  <Input placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" {...field} disabled={disabled} />
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
                  <Input placeholder="Dépenses" {...field} disabled={disabled} />
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
          <Button type="submit" disabled={isSaving || !form.formState.isValid || disabled}>
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
