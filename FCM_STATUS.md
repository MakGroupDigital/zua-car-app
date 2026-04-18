# ✅ Statut de l'Intégration FCM

## 🎉 Ce qui a été fait

### 1. Configuration FCM
- ✅ Clé VAPID configurée dans `src/lib/fcm/config.ts`
- ✅ Service Worker mis à jour avec FCM (`public/sw.js`)
- ✅ Firebase Messaging initialisé dans le service worker

### 2. Hook FCM
- ✅ Hook `useFCM` créé (`src/hooks/use-fcm.ts`)
- ✅ Enregistrement automatique du token FCM dans Firestore
- ✅ Gestion des messages en foreground

### 3. Intégration dans l'App
- ✅ Composant `FCMInitializer` créé
- ✅ Intégré dans le layout de l'app (`src/app/(app)/layout.tsx`)
- ✅ S'initialise automatiquement quand l'utilisateur est connecté

### 4. Règles Firestore
- ✅ Collection `fcmTokens` ajoutée aux règles
- ✅ Règles déployées sur Firebase

## ⚠️ Ce qui reste à faire

### Cloud Function pour Envoyer les Notifications

Pour que les notifications fonctionnent **même quand l'app est fermée**, vous devez créer une **Cloud Function** qui :

1. Écoute les nouveaux documents dans la collection `notifications`
2. Récupère le token FCM de l'utilisateur depuis `fcmTokens/{userId}`
3. Envoie la notification via FCM Admin SDK

### Étapes pour créer la Cloud Function

1. **Initialiser Functions** (si pas déjà fait) :
   ```bash
   firebase init functions
   ```

2. **Installer les dépendances** :
   ```bash
   cd functions
   npm install firebase-admin firebase-functions
   ```

3. **Créer la fonction** dans `functions/src/index.ts` :
   ```typescript
   import * as functions from 'firebase-functions';
   import * as admin from 'firebase-admin';

   admin.initializeApp();

   export const sendFCMNotification = functions.firestore
     .document('notifications/{notificationId}')
     .onCreate(async (snap, context) => {
       const notification = snap.data();
       const userId = notification.userId;

       // Récupérer le token FCM de l'utilisateur
       const tokenDoc = await admin.firestore()
         .collection('fcmTokens')
         .doc(userId)
         .get();

       if (!tokenDoc.exists) {
         console.log('No FCM token found for user:', userId);
         return;
       }

       const fcmToken = tokenDoc.data()?.token;

       if (!fcmToken) {
         console.log('No FCM token available for user:', userId);
         return;
       }

       // Préparer le message FCM
       const message = {
         token: fcmToken,
         notification: {
           title: notification.title,
           body: notification.body,
         },
         data: {
           type: notification.type || 'notification',
           ...(notification.data || {}),
         },
         webpush: {
           notification: {
             icon: '/icon.jpg',
             badge: '/icon.jpg',
             vibrate: [200, 100, 200],
           },
         },
       };

       // Envoyer la notification
       try {
         await admin.messaging().send(message);
         console.log('FCM notification sent successfully to user:', userId);
       } catch (error) {
         console.error('Error sending FCM notification:', error);
       }
     });
   ```

4. **Déployer la fonction** :
   ```bash
   firebase deploy --only functions
   ```

## 🧪 Test

### Test 1 : Vérifier que le token est enregistré
1. Ouvrez l'app et connectez-vous
2. Allez dans la console Firebase → Firestore
3. Vérifiez qu'un document existe dans `fcmTokens/{userId}` avec le token

### Test 2 : Tester les notifications
1. Envoyez un message à un autre utilisateur
2. Vérifiez que la notification est créée dans `notifications`
3. Si la Cloud Function est déployée, le destinataire devrait recevoir une notification push même si l'app est fermée

## 📝 Notes

- **Actuellement** : Les notifications fonctionnent quand l'app est ouverte ou en arrière-plan grâce au `GlobalNotificationListener`
- **Après déploiement de la Cloud Function** : Les notifications fonctionneront même quand l'app est complètement fermée
- **Service Worker** : Doit être enregistré et actif (vérifiez dans DevTools → Application → Service Workers)

## 🔍 Debugging

### Vérifier le token FCM
- Ouvrez la console du navigateur
- Cherchez "FCM Token obtained" dans les logs
- Vérifiez dans Firestore que le token est bien enregistré

### Vérifier le Service Worker
- Ouvrez DevTools → Application → Service Workers
- Vérifiez que le service worker est actif
- Vérifiez les logs du service worker

### Vérifier les permissions
- Vérifiez que les notifications sont autorisées dans les paramètres du navigateur
- Testez sur mobile pour une meilleure expérience



