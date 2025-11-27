/**
 * Configuration CinetPay
 * 
 * Pour utiliser CinetPay, vous devez :
 * 1. Créer un compte sur https://cinetpay.com
 * 2. Obtenir votre API Key et Site ID
 * 3. Remplacer les valeurs ci-dessous ou utiliser des variables d'environnement
 */

export const CINETPAY_CONFIG = {
  // API Key CinetPay
  apiKey: process.env.NEXT_PUBLIC_CINETPAY_API_KEY || '164212755567a4f2ee234470.03998181',
  
  // Site ID CinetPay
  siteId: process.env.NEXT_PUBLIC_CINETPAY_SITE_ID || '105887367',
  
  // Secret Key CinetPay (pour les vérifications serveur)
  secretKey: process.env.NEXT_PUBLIC_CINETPAY_SECRET_KEY || '7025377867a4f384a3e646.97567657',
  
  // URL de base de l'application
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002',
  
  // URLs de callback
  notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/cinetpay/notify`,
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/security/payment/success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/security/payment/cancel`,
  
  // Devise par défaut
  currency: 'USD',
  
  // Montant de l'abonnement mensuel GPS
  subscriptionAmount: 12,
};

