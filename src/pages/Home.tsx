
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ReceiptText, Settings } from "lucide-react";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center">
        <ReceiptText className="h-16 w-16 mx-auto mb-6 text-expense-blue" />
        <h1 className="text-4xl font-bold mb-4">Receipt Capture</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Gérez vos dépenses simplement en les enregistrant dans votre Google Spreadsheet.
        </p>
        
        {isAuthenticated ? (
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => navigate("/settings")}
              className="gap-2"
            >
              <Settings className="h-5 w-5" />
              Configurer mes paramètres
            </Button>
          </div>
        ) : (
          <Button 
            size="lg"
            onClick={() => navigate("/login")}
          >
            Commencer
          </Button>
        )}
      </div>
    </div>
  );
};

export default Home;
