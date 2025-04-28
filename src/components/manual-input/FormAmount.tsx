
import React from "react";
import { FormField } from "@/components/form/FormField";

interface FormAmountProps {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormAmount = ({ value, onChange }: FormAmountProps) => {
  return (
    <div className="relative">
      <FormField
        label="Montant TTC"
        name="montant_ttc"
        type="number"
        value={value || ""}
        onChange={onChange}
        placeholder="0.00"
        required
        className="relative"
      />
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2">€</span>
    </div>
  );
};
