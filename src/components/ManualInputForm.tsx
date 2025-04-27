
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Camera, SendHorizonal } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { FormDatePicker } from "./manual-input/FormDatePicker";
import { FormMerchant } from "./manual-input/FormMerchant";
import { FormAmount } from "./manual-input/FormAmount";
import { FormCategory } from "./manual-input/FormCategory";
import { FormReason } from "./manual-input/FormReason";

interface ExpenseData {
  date: string;
  commercant: string;
  montant_ttc: number;
  categorie: string;
  motif: string;
}

interface ManualInputFormProps {
  capturedImage: string | null;
}

const ManualInputForm = ({ capturedImage }: ManualInputFormProps) => {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState<ExpenseData>({
    date: format(new Date(), "yyyy-MM-dd"),
    commercant: "",
    montant_ttc: 0,
    categorie: "Restaurant",
    motif: "",
  });

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      setFormData({
        ...formData,
        date: format(date, "yyyy-MM-dd"),
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "montant_ttc" ? parseFloat(value) : value,
    });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      categorie: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Dépense soumise avec succès !");
      
      // Reset form
      setFormData({
        date: format(new Date(), "yyyy-MM-dd"),
        commercant: "",
        montant_ttc: 0,
        categorie: "Restaurant",
        motif: "",
      });
      setDate(new Date());
    } catch (error) {
      console.error("Error submitting expense:", error);
      toast.error("Erreur lors de la soumission de la dépense");
    } finally {
      setLoading(false);
    }
  };

  const handleRetakePicture = () => {
    window.location.reload();
  };

  return (
    <div className="container max-w-lg py-12">
      <Card>
        <CardHeader>
          <CardTitle>Détails de la note de frais</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {capturedImage && (
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="Reçu capturé" 
                  className="w-full rounded-lg mb-4"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetakePicture}
                  className="absolute top-2 right-2 gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Reprendre
                </Button>
              </div>
            )}
            
            <FormDatePicker date={date} onDateChange={handleDateChange} />
            <FormMerchant value={formData.commercant} onChange={handleChange} />
            <FormAmount value={formData.montant_ttc} onChange={handleChange} />
            <FormCategory value={formData.categorie} onValueChange={handleCategoryChange} />
            <FormReason value={formData.motif} onChange={handleChange} />
          </CardContent>
          <CardFooter>
            <Button 
              type="submit"
              className="w-full gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <SendHorizonal className="h-4 w-4" />
                  Soumettre la dépense
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ManualInputForm;
