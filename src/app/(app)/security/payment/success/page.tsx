'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, query, collection, where, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleId, setVehicleId] = useState<string | null>(null);

  useEffect(() => {
    const checkPayment = async () => {
      const transactionId = searchParams.get('transaction_id');
      const cpmTransId = searchParams.get('cpm_trans_id');
      const transId = transactionId || cpmTransId;

      if (!transId || !firestore) {
        setIsLoading(false);
        return;
      }

      try {
        // Trouver le paiement dans Firestore
        const paymentsQuery = query(
          collection(firestore, 'securityPayments'),
          where('transactionId', '==', transId)
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        
        if (!paymentsSnapshot.empty) {
          const paymentData = paymentsSnapshot.docs[0].data();
          setVehicleId(paymentData.vehicleId);
          
          // Vérifier si le paiement est complété
          if (paymentData.status === 'completed') {
            toast({
              title: 'Paiement réussi !',
              description: 'Votre abonnement GPS est maintenant actif.',
            });
          }
        }
      } catch (error: any) {
        console.error('Error checking payment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPayment();
  }, [searchParams, firestore, toast]);

  if (isLoading) {
    return (
      <div className={cn("flex h-screen flex-col items-center justify-center bg-background text-foreground")}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-2 border-primary/20">
        <CardContent className="p-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-green-500/20">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Paiement réussi !
            </h2>
            <p className="text-muted-foreground">
              Votre abonnement GPS a été activé avec succès.
            </p>
          </div>

          {vehicleId && (
            <div className="flex gap-3">
              <Button
                onClick={() => router.push(`/security/manage/${vehicleId}`)}
                className="flex-1 bg-gradient-to-r from-primary to-accent"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Voir sur la carte
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/security')}
                className="flex-1"
              >
                Retour
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className={cn("flex h-screen flex-col items-center justify-center bg-background text-foreground")}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

