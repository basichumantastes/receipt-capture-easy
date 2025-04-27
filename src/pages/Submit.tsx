
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PenLine } from "lucide-react";
import { toast } from "sonner";
import ReceiptCapture from "@/components/ReceiptCapture";
import ManualInputForm from "@/components/ManualInputForm";

const Submit = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showManualInput, setShowManualInput] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

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
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Analyse du reçu terminée");
      setAnalyzing(false);
      setShowManualInput(true);
    } catch (error) {
      console.error("Error analyzing receipt:", error);
      toast.error("Erreur lors de l'analyse du reçu");
      setAnalyzing(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!showManualInput) {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <ReceiptCapture onImageCapture={handleImageCapture} />
        <Button
          variant="ghost"
          onClick={() => setShowManualInput(true)}
          className="absolute top-4 right-4 gap-2"
        >
          <PenLine className="h-4 w-4" />
          Saisie manuelle
        </Button>
      </div>
    );
  }

  return <ManualInputForm capturedImage={capturedImage} />;
};

export default Submit;
