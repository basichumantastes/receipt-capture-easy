
import React from "react";
import { FormField } from "@/components/form/FormField";

interface FormMerchantProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormMerchant = ({ value, onChange }: FormMerchantProps) => {
  return (
    <FormField
      label="Commerçant"
      name="commercant"
      value={value}
      onChange={onChange}
      placeholder="Nom du commerçant"
      required
    />
  );
};
