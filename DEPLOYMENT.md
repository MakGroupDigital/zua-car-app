# Guide de Déploiement Firebase Hosting

Ce projet utilise Firebase App Hosting pour le déploiement.

## Fichiers de Configuration Requis

### 1. `firebase.json`
Configuration principale de Firebase avec :
- `hosting`: Configuration pour Firebase App Hosting avec frameworksBackend
- `firestore`: Règles de sécurité Firestore
- `storage`: Règles de sécurité Storage

### 2. `.firebaserc`
Configuration du projet Firebase (projet: `zua-car`)

### 3. `apphosting.yaml`
Configuration pour Firebase App Hosting (maxInstances: 1)

### 4. `firestore.rules`
Règles de sécurité Firestore (à la racine du projet)

### 5. `storage.rules`
Règles de sécurité Firebase Storage

### 6. `next.config.ts`
Configuration Next.js avec :
- Support des images distantes (Firebase Storage, etc.)
- Ignore des erreurs TypeScript et ESLint pendant le build

### 7. `package.json`
Scripts de build :
- `build`: `NODE_ENV=production next build`
- `start`: `next start`

## Variables d'Environnement

Firebase App Hosting configure automatiquement les variables d'environnement Firebase en production.

Pour le développement local, les variables sont définies dans `src/firebase/config.ts`.

### Variables Optionnelles

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Clé API Google Maps (optionnel)
- `NEXT_PUBLIC_CINETPAY_API_KEY`: Clé API CinetPay (optionnel)
- `NEXT_PUBLIC_CINETPAY_SITE_ID`: Site ID CinetPay (optionnel)
- `NEXT_PUBLIC_CINETPAY_SECRET_KEY`: Secret Key CinetPay (optionnel)
- `NEXT_PUBLIC_APP_URL`: URL de base de l'application (optionnel)

## Déploiement

1. **Connecter le projet à Firebase**:
   ```bash
   firebase login
   firebase use zua-car
   ```

2. **Déployer les règles Firestore et Storage**:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

3. **Déployer l'application**:
   ```bash
   firebase deploy --only hosting
   ```

   Ou via Firebase Console en connectant le dépôt GitHub.

## Structure du Projet

- `/src`: Code source de l'application Next.js
- `/public`: Fichiers statiques (manifest.json, sw.js, icon.jpg)
- `/firestore.rules`: Règles de sécurité Firestore
- `/storage.rules`: Règles de sécurité Storage
- `/firebase.json`: Configuration Firebase
- `/.firebaserc`: Configuration du projet

## Notes Importantes

- Firebase App Hosting configure automatiquement les variables d'environnement Firebase
- Le code dans `src/firebase/index.ts` essaie d'abord `initializeApp()` sans arguments pour utiliser les variables d'environnement d'App Hosting
- En cas d'échec, il utilise `firebaseConfig` de `src/firebase/config.ts` (pour le développement local)

