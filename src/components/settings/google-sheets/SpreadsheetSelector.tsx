
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
  
  const isSelectionDisabled = isLoading || apiStatus !== GoogleApiStatus.READY;

  return (
    <div className="flex gap-2 items-center">
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
