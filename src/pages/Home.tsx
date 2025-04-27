
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, Camera, ArrowRight, Clock } from "lucide-react";
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
            Capture et envoi de notes de frais simplifié
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            Numérisez vos tickets de caisse et envoyez-les directement à votre tableau Google Sheets sans effort
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
                Prenez une photo de votre reçu en quelques secondes avec votre smartphone
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ArrowRight className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Envoi Automatique</h3>
              <p className="text-muted-foreground">
                Synchronisation directe avec votre tableau de suivi des dépenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Gain de Temps</h3>
              <p className="text-muted-foreground">
                Plus besoin de saisie manuelle, gagnez du temps dans votre gestion
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
