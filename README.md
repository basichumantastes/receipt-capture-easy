
# Google Sheets Configuration App

Une application simple permettant aux utilisateurs de se connecter via Google et de configurer leur Google Sheets pour des usages personnalisés.

## Fonctionnalités principales

1. **Authentification Google OAuth**
   - Connexion sécurisée avec votre compte Google
   - Gestion des permissions pour accès aux Google Sheets

2. **Sélection de Google Spreadsheets**
   - Visualisation de tous vos Google Spreadsheets
   - Sélection du spreadsheet et de l'onglet spécifique à utiliser

3. **Sauvegarde des paramètres utilisateur**
   - Stockage sécurisé des préférences dans Supabase
   - Conservation des configurations entre les sessions

## Configuration du projet

### 1. Créer un projet Google Cloud

1. Accédez à [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet
3. Activez l'API Google Sheets
4. Configurez l'écran de consentement OAuth:
   - Type d'utilisateur: External (pour les tests) ou Internal (pour une organisation)
   - Informations sur l'application: Nom, logo, etc.
   - Domaines autorisés: ajoutez votre domaine d'application
   - Étendues (scopes) nécessaires: `.../auth/spreadsheets`, `.../auth/drive`

5. Créez des identifiants OAuth:
   - Type: Application Web
   - Origines JavaScript autorisées: ajoutez l'URL de votre application (ex: `https://votre-app.vercel.app`)
   - URI de redirection autorisés: ajoutez l'URL de redirection (ex: `https://votre-app.vercel.app/login`)

6. Notez le `Client ID` qui sera utilisé dans votre application

### 2. Configuration de l'application

1. Clonez ce dépôt
2. Installez les dépendances: `npm install`
3. Créez un fichier `.env.local` avec les variables nécessaires:
   ```
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_clef_anon_supabase
   ```

## Déploiement

### Déploiement sur Vercel

1. Connectez votre dépôt GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez l'application

### Déploiement sur Netlify

1. Connectez votre dépôt GitHub à Netlify
2. Configurez les variables d'environnement
3. Ajoutez la configuration de redirection:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

## Ressources utiles

- [Documentation Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Documentation Google Sheets API](https://developers.google.com/sheets/api)
- [Documentation Supabase](https://supabase.com/docs)
