
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormReasonProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const FormReason = ({ value, onChange }: FormReasonProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="motif">Motif</Label>
      <Textarea
        id="motif"
        name="motif"
        value={value}
        onChange={onChange}
        placeholder="Détails de la dépense"
        rows={3}
      />
    </div>
  );
};
