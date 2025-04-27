
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Login = () => {
  const { isAuthenticated, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from query parameters
  const from = new URLSearchParams(location.search).get('from') || '/';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  if (loading) {
    return (
      <div className="container max-w-md py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-expense-blue" />
      </div>
    );
  }

  return (
    <div className="container max-w-md py-16">
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription className="text-base">
            Connectez-vous avec votre compte Google pour accéder à l'application
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center gap-4">
          <Alert className="bg-blue-50 border-blue-200 mb-4">
            <AlertDescription className="text-blue-800 text-sm">
              Cette application demande l'accès à Google Sheets et à Google Drive (en lecture seule) 
              pour fonctionner correctement.
            </AlertDescription>
          </Alert>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mb-4 w-full text-sm">
                Comment ça fonctionne ?
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Processus d'authentification</DialogTitle>
                <DialogDescription>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Étape 1: Authentification Supabase</h3>
                      <p className="text-sm">
                        Nous utilisons Supabase comme service d'authentification sécurisé. 
                        Vous serez d'abord redirigé vers Supabase pour l'authentification.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Étape 2: Autorisation Google</h3>
                      <p className="text-sm">
                        Après authentification, vous serez redirigé vers Google pour autoriser 
                        l'accès à vos spreadsheets et documents Google Drive (en lecture seule).
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Étape 3: Configuration Google Cloud</h3>
                      <p className="text-sm">
                        Si c'est votre première utilisation, vous devrez peut-être activer l'API Google Drive 
                        dans la console Google Cloud. Des instructions vous seront fournies dans l'application.
                      </p>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm font-medium">
                        Ce processus est standard pour les applications qui utilisent les API Google et respecte 
                        les meilleures pratiques de sécurité.
                      </p>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={login}
            className="w-full flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            Se connecter avec Google
          </Button>
        </CardContent>
        
        <CardFooter className="text-center text-sm text-muted-foreground flex flex-col gap-2">
          <p>
            Si vous rencontrez des problèmes d'autorisation, vous pouvez révoquer les accès 
            précédents et vous reconnecter.
          </p>
          <a 
            href="https://myaccount.google.com/permissions" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline"
          >
            Gérer les autorisations dans Google
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
