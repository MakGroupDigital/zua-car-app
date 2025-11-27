import { NextRequest, NextResponse } from 'next/server';
import { CINETPAY_CONFIG } from '@/lib/cinetpay/config';

/**
 * Route API pour initialiser un paiement CinetPay
 * Cette route doit être appelée côté serveur pour sécuriser les identifiants API
 */
export async function POST(request: NextRequest) {
  console.log('[CinetPay Checkout] Received request');
  
  try {
    let body;
    try {
      body = await request.json();
      console.log('[CinetPay Checkout] Request body parsed:', { transactionId: body.transactionId, amount: body.amount });
    } catch (parseError: any) {
      console.error('[CinetPay Checkout] JSON parse error:', parseError);
      return NextResponse.json(
        { success: false, error: 'Corps de la requête invalide (JSON attendu)' },
        { status: 400 }
      );
    }
    
    const {
      transactionId,
      amount,
      currency = 'USD',
      description,
      customerName,
      customerSurname,
      customerEmail,
      customerPhoneNumber,
      customerAddress,
      customerCity,
      customerZipCode,
      paymentMethod,
    } = body;

    // Validation des données
    if (!transactionId || !amount || !customerEmail) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Préparer les données pour CinetPay selon la documentation officielle
    // URL: https://api-checkout.cinetpay.com/v2/payment
    // Format: JSON avec Content-Type: application/json
    // Pas de signature MD5 requise pour l'initialisation
    
    const paymentData: any = {
      apikey: CINETPAY_CONFIG.apiKey,
      site_id: CINETPAY_CONFIG.siteId,
      transaction_id: transactionId,
      amount: amount,
      currency: currency,
      description: description || 'Abonnement GPS Zua-Car',
      notify_url: CINETPAY_CONFIG.notifyUrl,
      return_url: CINETPAY_CONFIG.returnUrl,
      channels: paymentMethod === 'mobile' ? 'MOBILE_MONEY' : 'CREDIT_CARD',
      lang: 'fr',
    };

    // Pour le paiement par carte bancaire, ajouter les informations client
    // Tous les champs sont OBLIGATOIRES selon la documentation CinetPay
    if (paymentMethod === 'card') {
      paymentData.customer_name = customerName || 'Client';
      paymentData.customer_surname = customerSurname || 'Client';
      paymentData.customer_email = customerEmail;
      paymentData.customer_phone_number = customerPhoneNumber || '+243000000000';
      // Utiliser les valeurs du formulaire ou des valeurs par défaut valides
      paymentData.customer_address = customerAddress || 'Non spécifiée'; // Obligatoire, ne peut pas être vide
      paymentData.customer_city = customerCity || 'Kinshasa'; // Obligatoire, ne peut pas être vide
      paymentData.customer_country = 'CD'; // Code ISO du pays (Congo Démocratique)
      paymentData.customer_state = 'CD'; // Obligatoire
      paymentData.customer_zip_code = customerZipCode || '00000'; // Obligatoire, ne peut pas être vide
    } else if (paymentMethod === 'mobile' && customerPhoneNumber) {
      // Pour Mobile Money, on peut préfixer le numéro
      paymentData.customer_phone_number = customerPhoneNumber;
    }

    console.log('[CinetPay Checkout] Calling CinetPay API with transaction:', transactionId);
    console.log('[CinetPay Checkout] Payment data:', JSON.stringify(paymentData, null, 2));

    // Appel à l'API CinetPay pour créer la transaction
    // URL correcte selon la documentation officielle : https://api-checkout.cinetpay.com/v2/payment
    const cinetpayUrl = 'https://api-checkout.cinetpay.com/v2/payment';
    
    console.log(`[CinetPay Checkout] Site ID: ${CINETPAY_CONFIG.siteId}`);
    console.log(`[CinetPay Checkout] API Key: ${CINETPAY_CONFIG.apiKey.substring(0, 10)}...`);
    console.log(`[CinetPay Checkout] Payment data keys:`, Object.keys(paymentData));
    
    // Ajouter un timeout pour éviter que la requête reste bloquée
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 secondes timeout
    
    console.log(`[CinetPay Checkout] Calling: ${cinetpayUrl}`);
    console.log(`[CinetPay Checkout] Payment data:`, JSON.stringify(paymentData, null, 2));
    
    let cinetpayResponse: Response;
    try {
      // Format JSON selon la documentation CinetPay
      cinetpayResponse = await fetch(cinetpayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(paymentData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('La requête vers CinetPay a pris trop de temps. Vérifiez votre connexion internet.');
      }
      throw fetchError;
    }

    // Vérifier que la réponse est bien du JSON
    const contentType = cinetpayResponse.headers.get('content-type');
    const statusCode = cinetpayResponse.status;
    let cinetpayData;
    
    console.log('[CinetPay Checkout] Response status:', statusCode);
    console.log('[CinetPay Checkout] Response content-type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      cinetpayData = await cinetpayResponse.json();
      console.log('[CinetPay Checkout] Response data:', JSON.stringify(cinetpayData).substring(0, 500));
    } else {
      const text = await cinetpayResponse.text();
      console.error('[CinetPay Checkout] Non-JSON response (first 2000 chars):', text.substring(0, 2000));
      console.error('[CinetPay Checkout] Response status:', statusCode);
      console.error('[CinetPay Checkout] Response headers:', Object.fromEntries(cinetpayResponse.headers.entries()));
      console.error('[CinetPay Checkout] Request data sent:', JSON.stringify(paymentData, null, 2));
      console.error('[CinetPay Checkout] URL used:', successfulUrl || 'Unknown');
      
      // Si c'est un 502, suggérer de vérifier l'URL et les identifiants
      if (statusCode === 502) {
        console.error('[CinetPay Checkout] Error 502: Bad Gateway - L\'URL ou le format de la requête est probablement incorrect.');
        console.error('[CinetPay Checkout] Vérifiez:');
        console.error('  1. Que l\'URL de l\'API CinetPay est correcte');
        console.error('  2. Que les identifiants API (Site ID, API Key) sont valides');
        console.error('  3. Que le compte CinetPay est actif');
        console.error('  4. Que vous utilisez le bon environnement (test/production)');
      }
      
      // Essayer de parser comme JSON même si le content-type n'est pas JSON
      // (certaines APIs retournent JSON avec un mauvais content-type)
      try {
        cinetpayData = JSON.parse(text);
        console.log('[CinetPay Checkout] Successfully parsed as JSON despite content-type');
      } catch (parseError) {
        // Si ce n'est vraiment pas du JSON, retourner l'erreur
        return NextResponse.json(
          {
            success: false,
            error: 'Réponse invalide de CinetPay (HTML reçu au lieu de JSON)',
            details: `Status: ${statusCode}, Content-Type: ${contentType}, Response preview: ${text.substring(0, 500)}`,
            suggestion: 'Vérifiez que les identifiants API (Site ID, API Key) sont corrects et que le compte CinetPay est actif.',
          },
          { status: 500 }
        );
      }
    }

    // Selon la documentation, le code de succès est "201"
    if (cinetpayData.code === '201') {
      // Succès - retourner l'URL de paiement
      const paymentUrl = cinetpayData.data?.payment_url;
      if (!paymentUrl) {
        throw new Error('URL de paiement non reçue de CinetPay');
      }
      
      return NextResponse.json({
        success: true,
        paymentUrl: paymentUrl,
        transactionId: transactionId,
        paymentToken: cinetpayData.data?.payment_token,
      });
    } else {
      // Erreur CinetPay - retourner le message d'erreur
      const errorMessage = cinetpayData.message || cinetpayData.description || 'Erreur lors de la création du paiement';
      const errorCode = cinetpayData.code;
      
      console.error('[CinetPay Checkout] Error response:', cinetpayData);
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          errorCode: errorCode,
          details: cinetpayData,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error creating CinetPay payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur serveur',
      },
      { status: 500 }
    );
  }
}

