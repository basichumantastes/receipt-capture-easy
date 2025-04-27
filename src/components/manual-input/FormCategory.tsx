
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormCategoryProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const FormCategory = ({ value, onValueChange }: FormCategoryProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="categorie">Catégorie</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez une catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Restaurant">Restaurant</SelectItem>
          <SelectItem value="Transport">Transport</SelectItem>
          <SelectItem value="Hébergement">Hébergement</SelectItem>
          <SelectItem value="Fournitures">Fournitures</SelectItem>
          <SelectItem value="Autre">Autre</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
