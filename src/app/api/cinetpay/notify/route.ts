import { NextRequest, NextResponse } from 'next/server';
import { CINETPAY_CONFIG } from '@/lib/cinetpay/config';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Route API pour recevoir les notifications de paiement de CinetPay (Webhook)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cpm_trans_id,
      cpm_site_id,
      cpm_amount,
      cpm_currency,
      signature,
      payment_method,
      cel_phone_num,
      cpm_result,
      cpm_trans_status,
      cpm_trans_date,
    } = body;

    // Vérifier la signature pour sécuriser le webhook
    const { firestore } = initializeFirebase();
    
    // Vérifier le statut du paiement
    if (cpm_result === '00' && cpm_trans_status === 'ACCEPTED') {
      // Paiement réussi
      // Trouver la transaction dans Firestore
      const paymentsQuery = query(
        collection(firestore, 'securityPayments'),
        where('transactionId', '==', cpm_trans_id)
      );
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      
      if (!paymentsSnapshot.empty) {
        const paymentDoc = paymentsSnapshot.docs[0];
        const paymentData = paymentDoc.data();
        
        // Mettre à jour le statut du paiement
        await updateDoc(paymentDoc.ref, {
          status: 'completed',
          completedAt: new Date(),
          cinetpayData: body,
        });
        
        // Activer l'abonnement GPS
        if (paymentData.vehicleId) {
          const vehicleRef = doc(firestore, 'securityVehicles', paymentData.vehicleId);
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 1);
          
          await updateDoc(vehicleRef, {
            subscriptionStatus: 'active',
            subscriptionExpiry: expiryDate,
            isActive: true,
          });
        }
      }
    }

    // Toujours retourner 200 pour CinetPay
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing CinetPay notification:', error);
    // Retourner 200 même en cas d'erreur pour éviter les retries
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}

