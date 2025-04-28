
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Receipt Capture Easy</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Numérisez vos tickets de caisse et envoyez-les directement à Google Sheets sans effort
        </p>
        
        <div className="space-y-6">
          {isAuthenticated ? (
            <Button 
              size="lg"
              onClick={() => navigate("/settings")}
              className="gap-2"
            >
              <Settings className="h-5 w-5" />
              Configurer mes paramètres
            </Button>
          ) : (
            <Button 
              size="lg"
              onClick={() => navigate("/login")}
            >
              Se connecter avec Google
            </Button>
          )}
          
          <div className="text-sm text-muted-foreground mt-8">
            <p>Version simplifiée - Capture et envoi de notes de frais</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
