
import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Define Google Sign-In types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: (notification?: any) => void;
        };
      };
    };
  }
}

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  // Get redirect path from query parameters
  const from = new URLSearchParams(location.search).get('from') || '/';
  
  useEffect(() => {
    // If already authenticated, redirect
    if (isAuthenticated) {
      navigate(from, { replace: true });
      return;
    }
    
    // Handle credential response from Google
    const handleCredentialResponse = (response: any) => {
      if (response.credential) {
        login(response.credential);
        navigate(from, { replace: true });
      }
    };

    // Load Google Identity Services script
    if (!window.google && !scriptLoaded.current) {
      scriptLoaded.current = true;
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogleSignIn(handleCredentialResponse);
      script.onerror = () => toast.error("Impossible de charger Google Sign-In");
      document.body.appendChild(script);
    } else if (window.google) {
      initializeGoogleSignIn(handleCredentialResponse);
    }

    function initializeGoogleSignIn(callback: (response: any) => void) {
      try {
        if (!window.google) {
          console.error("Google API not loaded");
          return;
        }

        window.google.accounts.id.initialize({
          client_id: "GOOGLE_CLIENT_ID", // Will be replaced with environment variable
          callback: callback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            shape: "rectangular",
            text: "signin_with",
            logo_alignment: "center",
            width: 300
          });
        }

        // Optionally display the One Tap prompt
        // window.google.accounts.id.prompt();
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
        toast.error("Erreur lors de l'initialisation de Google Sign-In");
      }
    }

    return () => {
      // Cleanup if needed
    };
  }, [isAuthenticated, login, navigate, from]);

  return (
    <div className="container max-w-md py-16">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Connectez-vous avec votre compte Google pour accéder à l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {!window.google ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-expense-blue" />
              <span className="ml-2">Chargement...</span>
            </div>
          ) : (
            <div ref={buttonRef} className="google-signin-button"></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
