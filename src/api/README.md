
# Serverless API Functions

This directory contains serverless function templates that would be implemented on your chosen platform (Vercel, Netlify, or Firebase).

## Implementation Instructions

### Vercel Deployment

1. Create a `api` directory in the root of your project
2. Implement the functions as described in the templates
3. Set up environment variables in your Vercel project:
   - `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
   - `SCRIPT_URL` - Your Google Apps Script URL
   - `ORIGIN` - Your application's base URL

### Netlify Deployment

1. Create a `functions` directory in the root of your project
2. Implement the functions based on the templates
3. Create a `netlify.toml` file to specify function paths
4. Set up environment variables in your Netlify project

### Firebase Deployment

1. Set up Firebase functions using the Firebase CLI
2. Implement the functions based on the templates
3. Configure environment variables in Firebase

## Function Templates

Two main API endpoints need to be implemented:

1. `/login` - Handles the Google OAuth flow
2. `/submit` - Processes and forwards expense data to Google Sheets

See the template files in this directory for implementation details.
