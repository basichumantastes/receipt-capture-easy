
# Receipt Capture Easy

Une application simple pour capturer et envoyer des tickets de caisse directement vers Google Sheets via un raccourci iOS.

## Fonctionnalités

- Authentification Google OAuth
- Envoi de tickets de caisse depuis un raccourci iOS
- Intégration transparente avec Google Sheets
- Déploiement serverless facile

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

### 2. Configurer Google Apps Script

1. Créez un nouveau script Google Apps Script
2. Implémentez un script qui:
   - Reçoit les données JSON
   - Vérifie le token d'authentification
   - Copie un template de feuille de calcul dans le Drive de l'utilisateur (si nécessaire)
   - Ajoute une nouvelle ligne avec les données de dépense

Exemple de code Apps Script:

```javascript
function doPost(e) {
  try {
    // Parse le JSON reçu
    const data = JSON.parse(e.postData.contents);
    
    // Vérifie le token d'authentification (à implémenter)
    const token = e.parameter.token || e.headers['Authorization'].replace('Bearer ', '');
    const userEmail = validateToken(token); // Fonction à implémenter
    
    if (!userEmail) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Authentication failed'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Recherche ou crée une feuille de calcul pour l'utilisateur
    const spreadsheet = findOrCreateSpreadsheet(userEmail);
    
    // Ajoute les données à la feuille
    const sheet = spreadsheet.getActiveSheet();
    sheet.appendRow([
      data.date,
      data.commercant,
      data.montant_ttc,
      data.categorie,
      data.motif,
      new Date() // Timestamp
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Expense added successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function findOrCreateSpreadsheet(userEmail) {
  // À implémenter: recherche ou crée une feuille de calcul pour l'utilisateur
  // en utilisant un template prédéfini
  
  // Exemple simplifié:
  const files = DriveApp.getFilesByName(`Expenses-${userEmail}`);
  
  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.openById(file.getId());
  } else {
    const template = DriveApp.getFileById('YOUR_TEMPLATE_SPREADSHEET_ID');
    const copy = template.makeCopy(`Expenses-${userEmail}`);
    return SpreadsheetApp.openById(copy.getId());
  }
}

function validateToken(token) {
  // À implémenter: validation du token JWT de Google
  // Pour un exemple complet, consultez:
  // https://developers.google.com/identity/sign-in/web/backend-auth
  
  // Retourne l'email de l'utilisateur si valide, sinon null
}
```

3. Déployez le script en tant que Application Web:
   - Exécuter en tant que: "Moi-même" (ou un compte de service)
   - Qui a accès: "Tout le monde" ou "Tout le monde dans votre organisation"
   - Copiez l'URL de déploiement (SCRIPT_URL)

### 3. Configuration de l'application

1. Clonez ce dépôt
2. Installez les dépendances: `npm install`
3. Créez un fichier `.env.local` avec les variables suivantes:
   ```
   VITE_GOOGLE_CLIENT_ID=votre_client_id
   VITE_SCRIPT_URL=url_de_votre_script
   VITE_ORIGIN=url_de_votre_application
   ```

## Déploiement

### Déploiement sur Vercel

1. Connectez votre dépôt GitHub à Vercel
2. Configurez les variables d'environnement:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_SCRIPT_URL`
   - `VITE_ORIGIN`
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

### Déploiement sur Firebase Hosting

1. Installez Firebase CLI: `npm install -g firebase-tools`
2. Initialisez Firebase: `firebase init`
3. Configurez les variables d'environnement dans Firebase Functions
4. Déployez: `firebase deploy`

## Configuration du raccourci iOS

Créez un raccourci iOS qui:

1. Demande les informations du ticket (date, commerçant, montant, catégorie, motif)
2. Convertit ces informations en JSON
3. Envoie une requête POST à votre endpoint `/submit`
4. Affiche le résultat

Exemple de raccourci iOS:
1. Demander du texte: "Commerçant"
2. Demander un nombre: "Montant TTC"
3. Sélectionner dans une liste: "Catégorie" (options: Restaurant, Transport, etc.)
4. Demander du texte: "Motif"
5. Obtenir la date actuelle
6. Formater la date (YYYY-MM-DD)
7. URL: https://votre-app.vercel.app/submit
8. Méthode: POST
9. Corps: JSON avec les variables collectées
10. En-têtes: Content-Type: application/json
11. Afficher le résultat

## Dépannage

- **Problèmes d'authentification**: Vérifiez que votre Client ID est correct et que les origines autorisées sont bien configurées dans Google Cloud Console.
- **Erreurs CORS**: Assurez-vous que votre Google Apps Script autorise les requêtes CORS.
- **Problèmes avec le raccourci iOS**: Vérifiez le format JSON et les en-têtes de la requête.

## Ressources utiles

- [Documentation Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Documentation Google Apps Script](https://developers.google.com/apps-script)
- [Documentation des raccourcis iOS](https://support.apple.com/guide/shortcuts/welcome/ios)
