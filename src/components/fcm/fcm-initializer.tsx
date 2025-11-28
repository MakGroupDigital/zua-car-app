'use client';

import { useFCM } from '@/hooks/use-fcm';
import { useEffect } from 'react';

/**
 * Composant invisible qui initialise FCM et enregistre le token
 * Doit être utilisé dans un layout où l'utilisateur est connecté
 */
export function FCMInitializer() {
  const { token, isSupported, error } = useFCM();

  useEffect(() => {
    if (token) {
      console.log('FCM initialized successfully. Token:', token.substring(0, 20) + '...');
    }
    
    if (error) {
      console.error('FCM initialization error:', error);
    }
    
    if (!isSupported) {
      console.warn('FCM is not supported in this browser');
    }
  }, [token, error, isSupported]);

  // Ce composant ne rend rien
  return null;
}

