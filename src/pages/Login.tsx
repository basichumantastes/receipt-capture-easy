
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/spreadsheets',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Échec de la connexion avec Google");
    }
  };

  // Check auth state and redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="container flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-md py-16">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Connexion Requise</CardTitle>
          <CardDescription>
            Connectez-vous avec votre compte Google pour accéder à Receipt Scanner et gérer vos notes de frais
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Button 
            onClick={handleGoogleLogin}
            className="w-full max-w-sm"
            size="lg"
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="w-5 h-5 mr-2"
            />
            Continuer avec Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
