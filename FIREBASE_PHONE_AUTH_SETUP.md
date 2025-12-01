# Configuration Firebase pour l'authentification par téléphone

## Erreur `auth/invalid-app-credential`

Cette erreur se produit généralement lorsque la configuration Firebase n'est pas correcte pour l'authentification par téléphone.

## Étapes de configuration

### 1. Activer l'authentification par téléphone dans Firebase Console

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet `zua-car`
3. Allez dans **Authentication** > **Sign-in method**
4. Activez **Phone** comme méthode de connexion
5. Configurez les domaines autorisés :
   - Ajoutez `localhost` pour le développement
   - Ajoutez votre domaine de production

### 2. Vérifier les domaines autorisés

1. Dans Firebase Console, allez dans **Authentication** > **Settings** > **Authorized domains**
2. Assurez-vous que les domaines suivants sont ajoutés :
   - `localhost` (pour le développement)
   - Votre domaine de production (ex: `zua-car.web.app`)

### 3. Vérifier la configuration reCAPTCHA

L'authentification par téléphone utilise reCAPTCHA v3. Assurez-vous que :
- reCAPTCHA est activé dans votre projet Firebase
- Le domaine `localhost` est autorisé pour reCAPTCHA

### 4. Vérifier les quotas Firebase

1. Allez dans **Authentication** > **Usage**
2. Vérifiez que vous n'avez pas dépassé les quotas gratuits :
   - 10 000 vérifications SMS par mois (gratuit)
   - Au-delà, vous devrez activer la facturation

### 5. Tester avec un numéro de test

Pour le développement, vous pouvez utiliser des numéros de test :
1. Dans Firebase Console, allez dans **Authentication** > **Sign-in method** > **Phone**
2. Cliquez sur **Phone numbers for testing**
3. Ajoutez un numéro de test avec un code OTP personnalisé

Exemple :
- Numéro : `+243900000000`
- Code : `123456`

## Dépannage

### L'erreur persiste après configuration

1. **Videz le cache du navigateur** et rechargez la page
2. **Vérifiez la console du navigateur** pour d'autres erreurs
3. **Vérifiez que le conteneur reCAPTCHA existe** dans le DOM :
   ```javascript
   document.getElementById('recaptcha-container')
   ```
4. **Vérifiez les logs Firebase** dans la console pour plus de détails

### Le code SMS n'arrive pas

1. Vérifiez que le numéro est au format international (ex: `+243...`)
2. Vérifiez que vous n'avez pas dépassé le quota SMS
3. Vérifiez les logs Firebase pour voir si l'envoi a échoué
4. Utilisez un numéro de test pour le développement

## Configuration recommandée pour la production

1. Activez la facturation Firebase (nécessaire pour plus de 10 000 SMS/mois)
2. Configurez un domaine personnalisé
3. Activez App Check pour sécuriser votre application
4. Configurez les règles de sécurité Firestore pour l'authentification

## Support

Si le problème persiste :
1. Vérifiez la [documentation Firebase](https://firebase.google.com/docs/auth/web/phone-auth)
2. Consultez les [forums Firebase](https://firebase.google.com/support)
3. Vérifiez les [statuts Firebase](https://status.firebase.google.com/)

