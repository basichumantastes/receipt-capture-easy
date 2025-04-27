
import React, { useState } from 'react';
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
import { Check, Loader2, RefreshCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleApiStatus, SpreadsheetInfo } from "@/services/googleSheetsService";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SpreadsheetSelectorProps {
  spreadsheets: SpreadsheetInfo[];
  isLoading: boolean;
  onSelect: (id: string, name: string) => void;
  onRefresh: () => void;
  selectedId?: string;
  apiStatus: GoogleApiStatus;
}

export const SpreadsheetSelector = ({
  spreadsheets,
  isLoading,
  onSelect,
  onRefresh,
  selectedId,
  apiStatus
}: SpreadsheetSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { login } = useAuth();
  
  // Determine if spreadsheet selection should be disabled
  const isSelectionDisabled = isLoading || apiStatus !== GoogleApiStatus.READY;

  return (
    <div className="flex gap-2 items-center">
      {apiStatus === GoogleApiStatus.NEEDS_API_ACTIVATION && (
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="destructive"
              size="sm"
              className="text-xs"
            >
              Configurer Google Cloud
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configuration Google Cloud requise</DialogTitle>
              <DialogDescription>
                Pour utiliser cette application, vous devez activer l'API Google Drive dans votre projet Google Cloud.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">1. Activer l'API Google Drive</h3>
                <p className="text-sm text-muted-foreground">
                  Accédez à la console Google Cloud et activez l'API Google Drive pour votre projet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open("https://console.developers.google.com/apis/api/drive.googleapis.com/overview", "_blank")}
                >
                  Activer l'API Google Drive
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">2. Reconnecter l'application</h3>
                <p className="text-sm text-muted-foreground">
                  Une fois l'API activée, reconnectez-vous à l'application pour obtenir un nouveau jeton d'accès.
                </p>
                <Button
                  onClick={login}
                  className="mt-2"
                  size="sm"
                >
                  Se reconnecter
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Note: L'activation de l'API peut prendre quelques minutes avant d'être effective.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {apiStatus === GoogleApiStatus.NEEDS_AUTH && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={login} 
        >
          Reconnecter
        </Button>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            type="button"
            aria-expanded={open}
            className="w-10 p-0"
            disabled={isSelectionDisabled}
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
        disabled={isSelectionDisabled}
        title="Rafraîchir la liste"
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};
