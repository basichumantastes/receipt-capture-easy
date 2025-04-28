
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TestLoginFormProps {
  onSubmit: (email: string, token: string) => void;
}

export const TestLoginForm = ({ onSubmit }: TestLoginFormProps) => {
  const [email, setEmail] = useState('test.user@example.com');
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, token);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert className="bg-amber-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Pour tester avec de vraies données Google Sheets, collez un token Google valide ci-dessous.
          Vous pouvez obtenir ce token en :
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li>Vous connectant normalement en production et en copiant le token depuis le localStorage (provider_token)</li>
            <li>Utilisant l'<a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer" className="underline">OAuth Playground de Google</a></li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email de test"
        />
      </div>

      <div className="space-y-2">
        <Input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token Google (optionnel)"
        />
        <p className="text-xs text-muted-foreground">
          Si non renseigné, le mode test utilisera des données simulées
        </p>
      </div>

      <Button type="submit" className="w-full">
        Simuler une connexion
      </Button>
    </form>
  );
};
