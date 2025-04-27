
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ManualInputForm from "@/components/ManualInputForm";
import CameraView from "@/components/capture/CameraView";
import { toast } from "sonner";

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

  return (
    <>
      {!showManualInput ? (
        <CameraView 
          onImageCapture={handleImageCapture}
          onManualInputClick={() => setShowManualInput(true)}
        />
      ) : (
        <ManualInputForm capturedImage={capturedImage} />
      )}
    </>
  );
};

export default Submit;
