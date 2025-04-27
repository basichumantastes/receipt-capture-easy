
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container max-w-5xl py-12">
        <div className="flex flex-col items-center text-center mb-12 receipt-scanner-bg py-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Capture et envoi de notes de frais simplifié
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            Numérisez vos tickets de caisse et envoyez-les directement à votre tableau Google Sheets sans effort
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Prêt à soumettre votre note de frais ?
        </h2>
        <Button 
          size="lg" 
          onClick={() => navigate('/submit')}
          className="gap-2 mx-auto px-12 py-6"
        >
          <Upload className="h-6 w-6" />
          Envoyer un reçu
        </Button>
      </div>
    </div>
  );
};

export default Home;
