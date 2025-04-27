
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, Brain, Settings, Clock, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container max-w-5xl py-12">
        <div className="flex flex-col items-center text-center mb-12 receipt-scanner-bg py-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            La gestion intelligente de vos notes de frais
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            Capturez, analysez et synchronisez vos tickets en quelques secondes avec notre solution IA intégrée à Google Sheets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Capture Rapide</h3>
              <p className="text-muted-foreground">
                Prenez une photo de votre ticket en un clic et laissez notre application faire le reste
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Analyse IA Instantanée</h3>
              <p className="text-muted-foreground">
                Notre technologie d'IA extrait automatiquement toutes les informations importantes du ticket en quelques secondes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Synchronisation Immédiate</h3>
              <p className="text-muted-foreground">
                Les données sont instantanément envoyées vers votre tableau Google Sheets, sans intervention manuelle
              </p>
            </CardContent>
          </Card>
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
