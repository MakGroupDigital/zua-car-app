# Configuration Firebase Cloud Messaging (FCM) pour Notifications Push

## 📱 Pourquoi FCM ?

Actuellement, les notifications push fonctionnent uniquement quand l'application est ouverte ou en arrière-plan. Pour recevoir des notifications **même quand l'app est fermée**, vous devez configurer **Firebase Cloud Messaging (FCM)**.

## 🔧 Étapes de Configuration

### 1. Activer Firebase Cloud Messaging dans Firebase Console

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet **zua-car**
3. Allez dans **⚙️ Paramètres du projet** → **Cloud Messaging**
4. Si ce n'est pas déjà fait, activez **Cloud Messaging API (Legacy)** ou **FCM API (V1)**

### 2. Générer les Clés de Serveur (VAPID Keys)

1. Dans **Cloud Messaging**, section **Web Push certificates**
2. Cliquez sur **Generate key pair** si vous n'en avez pas
3. Copiez la **clé publique** (elle sera utilisée dans le code)

### 3. Installer Firebase Messaging dans le Projet

```bash
npm install firebase
```

Firebase Messaging est déjà inclus dans le package `firebase`.

### 4. Créer un Fichier de Configuration FCM

Créez un fichier `src/lib/fcm/config.ts` :

```typescript
export const FCM_VAPID_KEY = "VOTRE_CLE_VAPID_ICI"; // À remplacer par votre clé VAPID
```

### 5. Mettre à Jour le Service Worker

Le service worker (`public/sw.js`) doit être enregistré avec FCM. Ajoutez ce code dans votre composant d'initialisation :

```typescript
// Dans src/components/notifications/fcm-setup.tsx
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getMessaging as getMessagingSw } from 'firebase/messaging/sw';
import { FCM_VAPID_KEY } from '@/lib/fcm/config';

// Dans le service worker (public/sw.js), ajoutez :
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD1qayBveIM9rUPJADxha0tRctQ5mJfF0U",
  authDomain: "zua-car.firebaseapp.com",
  projectId: "zua-car",
  storageBucket: "zua-car.firebasestorage.app",
  messagingSenderId: "33080094825",
  appId: "1:33080094825:web:9fc623968b1355ab16f2f8"
});

const messaging = firebase.messaging();

// Écouter les messages FCM
messaging.onBackgroundMessage((payload) => {
  console.log('FCM message received in background:', payload);
  
  const notificationTitle = payload.notification?.title || 'Zua-Car';
  const notificationOptions = {
    body: payload.notification?.body || 'Vous avez une nouvelle notification',
    icon: '/icon.jpg',
    badge: '/icon.jpg',
    tag: payload.data?.type || 'zua-car-notification',
    data: payload.data || {},
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

### 6. Enregistrer le Token FCM dans l'Application

Créez un hook pour gérer FCM :

```typescript
// src/hooks/use-fcm.ts
import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useFirebase } from '@/firebase';
import { FCM_VAPID_KEY } from '@/lib/fcm/config';
import { doc, setDoc } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';

export function useFCM() {
  const { firebaseApp } = useFirebase();
  const { user } = useUser();
  const firestore = useFirestore();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseApp || !user) return;

    const messaging = getMessaging(firebaseApp);

    // Demander la permission et obtenir le token
    getToken(messaging, { vapidKey: FCM_VAPID_KEY })
      .then((currentToken) => {
        if (currentToken) {
          setToken(currentToken);
          
          // Enregistrer le token dans Firestore
          if (firestore) {
            const tokenRef = doc(firestore, 'fcmTokens', user.uid);
            setDoc(tokenRef, {
              token: currentToken,
              userId: user.uid,
              createdAt: new Date(),
              updatedAt: new Date(),
            }, { merge: true });
          }
        } else {
          console.log('No registration token available.');
        }
      })
      .catch((err) => {
        console.error('An error occurred while retrieving token:', err);
      });

    // Écouter les messages quand l'app est au premier plan
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      // Vous pouvez afficher une notification personnalisée ici
    });
  }, [firebaseApp, user, firestore]);

  return { token };
}
```

### 7. Utiliser le Hook dans l'Application

Ajoutez le hook dans votre layout ou page de notifications :

```typescript
// Dans src/app/(app)/layout.tsx ou src/app/(app)/notifications/page.tsx
import { useFCM } from '@/hooks/use-fcm';

// Dans votre composant
const { token } = useFCM();
```

### 8. Envoyer des Notifications via Cloud Functions

Pour envoyer des notifications même quand l'app est fermée, vous devez utiliser **Cloud Functions** :

1. Créez une Cloud Function qui :
   - Écoute les nouveaux documents dans `notifications`
   - Récupère le token FCM de l'utilisateur depuis `fcmTokens`
   - Envoie la notification via FCM Admin SDK

Exemple de Cloud Function (`functions/src/index.ts`) :

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
        type: notification.type,
        ...notification.data,
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
      console.log('FCM notification sent successfully');
    } catch (error) {
      console.error('Error sending FCM notification:', error);
    }
  });
```

### 9. Déployer les Cloud Functions

```bash
# Installer Firebase CLI si ce n'est pas déjà fait
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser Functions (si pas déjà fait)
firebase init functions

# Déployer
firebase deploy --only functions
```

## ✅ Résultat

Une fois configuré :
- ✅ Les notifications fonctionnent **même quand l'app est fermée**
- ✅ Les notifications apparaissent dans la barre de notifications du mobile
- ✅ Le logo de l'app s'affiche dans les notifications
- ✅ Le son et la vibration fonctionnent
- ✅ Le clic sur la notification ouvre l'app

## 🔍 Vérification

1. Testez en envoyant un message à un autre utilisateur
2. Fermez complètement l'application
3. Le destinataire devrait recevoir une notification push même si l'app est fermée

## 📝 Notes Importantes

- **VAPID Key** : Vous devez générer une clé VAPID dans Firebase Console
- **Cloud Functions** : Nécessaires pour envoyer des notifications quand l'app est fermée
- **Service Worker** : Doit être enregistré et actif
- **Permissions** : L'utilisateur doit autoriser les notifications

## 🚀 Prochaines Étapes

1. Générer la clé VAPID dans Firebase Console
2. Créer le fichier de configuration FCM
3. Mettre à jour le service worker
4. Créer le hook useFCM
5. Créer et déployer la Cloud Function
6. Tester les notifications push



