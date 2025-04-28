# Receipt Capture Easy

Une application simple pour capturer et envoyer des tickets de caisse directement vers Google Sheets via une interface web moderne.

## Fonctionnalités

- Authentification sécurisée via Google OAuth (Supabase Auth)
- Interface web moderne et responsive
- Envoi de tickets de caisse via l'interface web
- Intégration directe avec Google Sheets via l'API officielle
- Déploiement serverless avec Supabase Edge Functions
- Configuration flexible des feuilles Google Sheets

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase Edge Functions
- **Authentication**: Supabase Auth avec Google OAuth
- **Storage**: Google Sheets API
- **UI Framework**: Shadcn/UI + Tailwind CSS

## Configuration du projet

### 1. Créer un projet Google Cloud

1. Accédez à [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet
3. Activez les APIs nécessaires:
   - Google Sheets API
   - Google Drive API
4. Configurez l'écran de consentement OAuth:
   - Type d'utilisateur: External (pour les tests) ou Internal (pour une organisation)
   - Informations sur l'application: Nom, logo, etc.
   - Domaines autorisés: ajoutez votre domaine d'application
   - Étendues (scopes) nécessaires:
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive.readonly`

5. Créez des identifiants OAuth:
   - Type: Application Web
   - Origines JavaScript autorisées: ajoutez votre URL Supabase (ex: `https://[project-ref].supabase.co`)
   - URI de redirection autorisés: ajoutez l'URL de redirection Supabase Auth (ex: `https://[project-ref].supabase.co/auth/v1/callback`)

### 2. Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Configurez l'authentification Google:
   - Activez le provider Google dans Authentication > Providers
   - Ajoutez vos Client ID et Client Secret Google
3. Déployez les Edge Functions:
   ```bash
   supabase functions deploy
   ```

### 3. Configuration de l'application

1. Clonez ce dépôt
2. Installez les dépendances:
   ```bash
   npm install
   ```
3. Créez un fichier `.env.local` avec les variables suivantes:
   ```
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
   ```

## Déploiement

Le frontend peut être déployé sur n'importe quelle plateforme supportant les applications Vite:

1. Construisez l'application:
   ```bash
   npm run build
   ```
2. Déployez le contenu du dossier `dist`

Les plateformes recommandées:
- Vercel
- Netlify
- Firebase Hosting

## Dépannage

- **Problèmes d'authentification**: Vérifiez la configuration OAuth dans Supabase et Google Cloud Console
- **Erreurs Edge Functions**: Consultez les logs dans la console Supabase
- **Problèmes d'accès aux Sheets**: Vérifiez les permissions et scopes OAuth

## Ressources utiles

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Google Sheets API](https://developers.google.com/sheets/api)
- [Documentation Vite](https://vitejs.dev)
- [Documentation Shadcn/UI](https://ui.shadcn.com)
