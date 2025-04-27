
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, Brain, Settings, Layers } from "lucide-react";
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
            Notre IA analyse vos tickets et les synchronise automatiquement avec Google Sheets, pour une gestion simplifiée de vos dépenses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">IA Intelligente</h3>
              <p className="text-muted-foreground">
                Analyse automatique des tickets avec une précision optimale grâce à notre technologie d'IA avancée
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Intégration Google Sheets</h3>
              <p className="text-muted-foreground">
                Synchronisation directe avec vos tableaux Google Sheets pour un suivi simplifié de vos dépenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Workflow Adaptatif</h3>
              <p className="text-muted-foreground">
                L'application s'adapte à votre façon de travailler pour une expérience entièrement personnalisée
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
