
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormMerchantProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormMerchant = ({ value, onChange }: FormMerchantProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="commercant">Commerçant</Label>
      <Input
        id="commercant"
        name="commercant"
        value={value}
        onChange={onChange}
        placeholder="Nom du commerçant"
        required
      />
    </div>
  );
};
