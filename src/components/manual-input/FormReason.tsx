
import React from "react";
import { FormField } from "@/components/form/FormField";

interface FormReasonProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const FormReason = ({ value, onChange }: FormReasonProps) => {
  return (
    <FormField
      label="Motif"
      name="motif"
      type="textarea"
      value={value}
      onChange={onChange}
      placeholder="Détails de la dépense"
      rows={3}
    />
  );
};
