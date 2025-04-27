import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader2, SendHorizonal } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReceiptCapture from "@/components/ReceiptCapture";

interface ExpenseData {
  date: string;
  commercant: string;
  montant_ttc: number;
  categorie: string;
  motif: string;
}

const Submit = () => {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [formData, setFormData] = useState<ExpenseData>({
    date: format(new Date(), "yyyy-MM-dd"),
    commercant: "",
    montant_ttc: 0,
    categorie: "Restaurant",
    motif: "",
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?from=/submit', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleImageCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setAnalyzing(true);
    
    try {
      // TODO: Implement OCR and OpenAI analysis
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Analyse du reçu terminée");
      setAnalyzing(false);
    } catch (error) {
      console.error("Error analyzing receipt:", error);
      toast.error("Erreur lors de l'analyse du reçu");
      setAnalyzing(false);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      setFormData({
        ...formData,
        date: format(date, "yyyy-MM-dd"),
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    
    if (!isAuthenticated || !token) {
      toast.error("Vous devez être connecté pour soumettre une dépense");
      navigate("/login?from=/submit");
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, this would be an environment variable
      const SCRIPT_URL = "https://script.google.com/macros/s/your-script-id/exec";
      
      // Mock the API call for now
      console.log("Sending data:", formData);
      console.log("With token:", token);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, you would use fetch:
      /*
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Response:", data);
      */
      
      toast.success("Dépense soumise avec succès !");
      
      // Reset form after successful submission
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container max-w-lg py-12">
      <Card>
        <CardHeader>
          <CardTitle>Soumettre une note de frais</CardTitle>
          <CardDescription>
            Prenez une photo de votre ticket pour l'analyser automatiquement, ou remplissez les détails manuellement
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <ReceiptCapture onImageCapture={handleImageCapture} />
            
            {analyzing && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyse du reçu en cours...</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: fr }) : "Sélectionnez une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commercant">Commerçant</Label>
              <Input
                id="commercant"
                name="commercant"
                value={formData.commercant}
                onChange={handleChange}
                placeholder="Nom du commerçant"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="montant_ttc">Montant TTC</Label>
              <div className="relative">
                <Input
                  id="montant_ttc"
                  name="montant_ttc"
                  type="number"
                  step="0.01"
                  value={formData.montant_ttc || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="pl-6"
                  required
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">€</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categorie">Catégorie</Label>
              <Select
                value={formData.categorie}
                onValueChange={handleCategoryChange}
              >
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
            
            <div className="space-y-2">
              <Label htmlFor="motif">Motif</Label>
              <Textarea
                id="motif"
                name="motif"
                value={formData.motif}
                onChange={handleChange}
                placeholder="Détails de la dépense"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit"
              className="w-full gap-2"
              disabled={loading || analyzing}
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

export default Submit;
