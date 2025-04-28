
import React from 'react';
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
import { Button } from "@/components/ui/button";
import { Check, Loader2, RefreshCcw, Search, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpreadsheetInfo, useSpreadsheetsQuery } from "@/hooks/useSpreadsheetsQuery";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { queryClient } from '@/lib/queryClient';

interface SpreadsheetSelectorProps {
  onSelect: (id: string, name: string) => void;
  selectedId?: string;
}

export const SpreadsheetSelector = ({
  onSelect,
  selectedId
}: SpreadsheetSelectorProps) => {
  const [open, setOpen] = React.useState(false);
  const { session, hasRequiredScopes, login } = useAuth();
  
  // Use React Query to fetch spreadsheets
  const { data: spreadsheets = [], isLoading, refetch } = useSpreadsheetsQuery(session);
  
  // Check if Google token is available
  const googleToken = session?.provider_token;
  const hasGoogleToken = !!googleToken;

  // Handler to refresh spreadsheets list
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['spreadsheets'] });
    refetch();
  };

  return (
    <div className="flex gap-2 items-center">
      {(!hasGoogleToken || !hasRequiredScopes) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={login} 
                  className="text-xs px-2 py-0 h-6"
                >
                  Reconnexion requise
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Autorisations Google insuffisantes. Veuillez vous reconnecter avec le bouton ci-contre.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs px-2 py-0 h-6 flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Google Cloud
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Configuration Google Cloud</SheetTitle>
            <SheetDescription>
              Votre application n'est pas encore en production sur Google Cloud. 
              Suivez ces étapes pour configurer l'accès à l'API Google Drive:
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. Activer l'API Google Drive</h3>
              <p className="text-sm text-muted-foreground">
                Vous devez activer l'API Google Drive dans votre console Google Cloud
                pour pouvoir accéder à vos spreadsheets.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.open("https://console.developers.google.com/apis/api/drive.googleapis.com/overview", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" /> Aller à la console Google Cloud
              </Button>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">2. Configurer les écrans de consentement et d'autorisation</h3>
              <p className="text-sm text-muted-foreground">
                Assurez-vous que votre application est correctement configurée dans la 
                console Google Cloud, notamment les écrans de consentement et les domaines autorisés.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" /> Gérer les identifiants OAuth
              </Button>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">3. Se reconnecter à l'application</h3>
              <p className="text-sm text-muted-foreground">
                Une fois les API activées, reconnectez-vous à l'application pour 
                obtenir un nouveau jeton d'accès avec les bonnes permissions.
              </p>
              <Button
                onClick={login}
                className="mt-2"
                size="sm"
              >
                Se reconnecter
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            type="button"
            aria-expanded={open}
            className="w-10 p-0"
            disabled={isLoading || !hasGoogleToken || !hasRequiredScopes}
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
                    onSelect={() => {
                      onSelect(sheet.id, sheet.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        sheet.id === selectedId
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
        onClick={handleRefresh}
        disabled={isLoading || !hasGoogleToken || !hasRequiredScopes}
        title="Rafraîchir la liste"
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};
