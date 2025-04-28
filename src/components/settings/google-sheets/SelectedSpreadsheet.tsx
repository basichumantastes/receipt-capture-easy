
import React from "react";
import { ExternalLink, LinkIcon } from "lucide-react";
import { SpreadsheetInfo } from "@/types/googleSheets";

interface SelectedSpreadsheetProps {
  spreadsheet: SpreadsheetInfo;
  spreadsheetId: string;
}

export const SelectedSpreadsheet = ({ spreadsheet, spreadsheetId }: SelectedSpreadsheetProps) => {
  return (
    <a 
      href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div className="bg-card hover:bg-accent transition-colors border rounded-lg p-4 cursor-pointer group">
        <div className="flex items-center gap-3">
          <LinkIcon className="h-6 w-6 text-primary" />
          <div className="flex-grow">
            <h3 className="font-medium">Google Sheets actuel</h3>
            <p className="text-sm text-muted-foreground">{spreadsheet.name}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </a>
  );
};
