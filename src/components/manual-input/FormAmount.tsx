
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormAmountProps {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormAmount = ({ value, onChange }: FormAmountProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="montant_ttc">Montant TTC</Label>
      <div className="relative">
        <Input
          id="montant_ttc"
          name="montant_ttc"
          type="number"
          step="0.01"
          value={value || ""}
          onChange={onChange}
          placeholder="0.00"
          className="pl-6"
          required
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2">€</span>
      </div>
    </div>
  );
};
