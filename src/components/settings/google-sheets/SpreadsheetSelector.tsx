
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
import { Check, Loader2, RefreshCcw, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpreadsheetInfo } from "@/services/googleSheetsService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";

interface SpreadsheetSelectorProps {
  spreadsheets: SpreadsheetInfo[];
  isLoading: boolean;
  onSelect: (id: string, name: string) => void;
  onRefresh: () => void;
  selectedId?: string;
}

export const SpreadsheetSelector = ({
  spreadsheets,
  isLoading,
  onSelect,
  onRefresh,
  selectedId
}: SpreadsheetSelectorProps) => {
  const [open, setOpen] = React.useState(false);
  const { session, hasRequiredScopes, login } = useAuth();
  
  // Vérifier si le token Google est disponible
  const googleToken = session?.provider_token;

  return (
    <div className="flex gap-2 items-center">
      {!hasRequiredScopes && (
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
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            type="button"
            aria-expanded={open}
            className="w-10 p-0"
            disabled={isLoading || !hasRequiredScopes}
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
        onClick={onRefresh}
        disabled={isLoading || !hasRequiredScopes}
        title="Rafraîchir la liste"
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};
