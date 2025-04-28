
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotify } from "@/hooks/useNotify";
import ManualInputForm from "@/components/ManualInputForm";
import CameraView from "@/components/capture/CameraView";
import { useSubmitExpenseMutation } from "@/hooks/useExpenseMutation";

const Submit = () => {
  const { isAuthenticated, session } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();
  const [showManualInput, setShowManualInput] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Use React Query for submitting expenses
  const { mutate: submitExpense } = useSubmitExpenseMutation(session);

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
      notify.success("Analyse du reçu terminée");
      setAnalyzing(false);
      setShowManualInput(true);
    } catch (error) {
      console.error("Error analyzing receipt:", error);
      notify.error(error instanceof Error ? error.message : "Erreur lors de l'analyse du reçu");
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
        <ManualInputForm capturedImage={capturedImage} onSubmit={submitExpense} />
      )}
    </>
  );
};

export default Submit;
