// Configuration Firebase pour Nzila
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD1qayBveIM9rUPJADxha0tRctQ5mJfF0U",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "zua-car.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "zua-car",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "zua-car.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "33080094825",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:33080094825:web:9fc623968b1355ab16f2f8"
};

// Validation de la configuration Firebase
export const isFirebaseConfigValid = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

// Configuration pour l'environnement de production
export const getFirebaseConfig = () => {
  if (!isFirebaseConfigValid()) {
    console.warn('Firebase configuration is incomplete. Some features may not work properly.');
  }
  return firebaseConfig;
};
