
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ReceiptText, LogIn, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="container max-w-5xl py-12">
      <div className="flex flex-col items-center text-center mb-12 receipt-scanner-bg py-16">
        <ReceiptText className="h-16 w-16 text-expense-blue mb-6 animate-pulse-subtle" />
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Capture et envoi de notes de frais simplifié
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Numérisez vos tickets de caisse et envoyez-les directement à votre tableau Google Sheets sans effort
        </p>
        
        {isAuthenticated ? (
          <Button 
            size="lg" 
            onClick={() => navigate('/submit')}
            className="gap-2"
          >
            <Upload className="h-5 w-5" />
            Envoyer un reçu
          </Button>
        ) : (
          <Button 
            size="lg" 
            onClick={() => navigate('/login')}
            className="gap-2"
          >
            <LogIn className="h-5 w-5" />
            Commencer
          </Button>
        )}
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Connexion simple</CardTitle>
            <CardDescription>Authentification via Google OAuth</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Connectez-vous avec votre compte Google pour accéder à vos tableaux et documents.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Envoi rapide</CardTitle>
            <CardDescription>Depuis l'application Raccourcis iOS</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Capturez vos tickets et envoyez-les directement depuis votre téléphone via un raccourci iOS.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Intégration Sheets</CardTitle>
            <CardDescription>Mise à jour automatique</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Vos données sont automatiquement ajoutées à votre feuille de calcul Google Sheets personnelle.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
