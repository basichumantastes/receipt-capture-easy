
# Receipt Capture for Google Sheets

Une application simple pour connecter votre compte Google et sélectionner le Google Sheets à utiliser pour stocker vos dépenses.

## Fonctionnalités

- Authentification Google OAuth
- Accès à vos Google Spreadsheets
- Sélection du spreadsheet et de l'onglet à utiliser
- Sauvegarde des paramètres utilisateur dans Supabase

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
3. Créez un fichier `.env.local` avec les variables nécessaires

## Déploiement

### Déploiement sur Vercel

1. Connectez votre dépôt GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez l'application

### Déploiement sur Netlify

1. Connectez votre dépôt GitHub à Netlify
2. Configurez les variables d'environnement
3. Créez un fichier `netlify.toml`:
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
4. Déployez l'application

## Dépannage

- **Problèmes d'authentification**: Vérifiez que votre Client ID est correct et que les origines autorisées sont bien configurées dans Google Cloud Console.
- **Erreurs CORS**: Assurez-vous que les origines sont correctement configurées.

## Ressources utiles

- [Documentation Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Documentation Google Sheets API](https://developers.google.com/sheets/api)
