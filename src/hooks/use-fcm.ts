'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { useFirebase } from '@/firebase';
import { FCM_VAPID_KEY } from '@/lib/fcm/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';

export function useFCM() {
  const { firebaseApp } = useFirebase();
  const { user } = useUser();
  const firestore = useFirestore();
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Vérifier si FCM est supporté
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setIsSupported(false);
      return;
    }

    if (!firebaseApp || !user || !firestore) {
      return;
    }

    setIsSupported(true);

    let messaging: Messaging | null = null;

    try {
      messaging = getMessaging(firebaseApp);
    } catch (err) {
      console.error('Error initializing messaging:', err);
      setError(err as Error);
      return;
    }

    // Fonction async pour gérer l'obtention du token
    const initializeFCM = async () => {
      try {
        // Vérifier que le service worker est enregistré
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.ready;
        }

        // Demander la permission et obtenir le token
          if (currentToken) {
          console.log('FCM Token obtained:', currentToken);
          setToken(currentToken);
          
          // Enregistrer le token dans Firestore
          const tokenRef = doc(firestore, 'fcmTokens', user.uid);
          await setDoc(tokenRef, {
            token: currentToken,
            userId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
          
          console.log('FCM token saved to Firestore');
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      } catch (err) {
        console.error('An error occurred while retrieving token:', err);
        setError(err as Error);
      }
    };

    // Appeler la fonction async
    initializeFCM();

    // Écouter les messages quand l'app est au premier plan
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Afficher une notification même si l'app est ouverte
      if ('Notification' in window && Notification.permission === 'granted') {
        const notificationTitle = payload.notification?.title || 'Zua-Car';
        const notificationOptions = {
          body: payload.notification?.body || 'Vous avez une nouvelle notification',
          icon: '/icon.jpg',
          badge: '/icon.jpg',
          tag: payload.data?.type || 'zua-car-notification',
          data: payload.data || {},
          requireInteraction: false,
          silent: false,
        };

        new Notification(notificationTitle, notificationOptions);
      }
    });
  }, [firebaseApp, user, firestore]);

  return { token, isSupported, error };
}

