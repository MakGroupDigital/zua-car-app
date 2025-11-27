'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Loader2, Shield, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SecurityVehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  trackerNumber: string;
  licensePlate: string;
  vehicleImageUrl?: string;
  isActive: boolean;
  subscriptionStatus: 'active' | 'expired' | 'pending';
}

import { CINETPAY_CONFIG } from '@/lib/cinetpay/config';

export default function SecurityPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('mobile');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount] = useState(CINETPAY_CONFIG.subscriptionAmount);
  
  // Champs supplémentaires pour le paiement par carte
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('Kinshasa');
  const [customerZipCode, setCustomerZipCode] = useState('');

  const vehicleDocRef = useMemoFirebase(() => {
    if (!vehicleId || !firestore) return null;
    return doc(firestore, 'securityVehicles', vehicleId);
  }, [firestore, vehicleId]);

  const { data: vehicle, isLoading: isVehicleLoading } = useDoc<SecurityVehicle>(vehicleDocRef);

  useEffect(() => {
    if (vehicle && vehicle.subscriptionStatus === 'active') {
      router.push(`/security/manage/${vehicle.id}`);
    }
  }, [vehicle, router]);

  const handlePayment = async () => {
    if (!vehicle || !user || !firestore) return;

    if (paymentMethod === 'mobile' && !phoneNumber) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez entrer votre numéro de téléphone',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Generate transaction ID
      const transactionId = `SEC_${Date.now()}_${vehicle.id}`;

      // Prepare CinetPay payment data
      const paymentData = {
        amount: amount,
        currency: 'USD',
        transaction_id: transactionId,
        description: `Abonnement GPS - ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
        customer_name: user.email?.split('@')[0] || 'Client',
        customer_surname: 'Client',
        customer_email: user.email || '',
        customer_phone_number: paymentMethod === 'mobile' ? phoneNumber : (phoneNumber || '+243000000000'),
        customer_address: paymentMethod === 'card' ? (customerAddress || 'Non spécifiée') : '',
        customer_city: paymentMethod === 'card' ? (customerCity || 'Kinshasa') : '',
        customer_country: 'CD',
        customer_state: 'CD',
        customer_zip_code: paymentMethod === 'card' ? (customerZipCode || '00000') : '',
        notify_url: CINETPAY_CONFIG.notifyUrl,
        return_url: CINETPAY_CONFIG.returnUrl,
        cancel_url: CINETPAY_CONFIG.cancelUrl,
        channel: paymentMethod === 'mobile' ? 'MOBILE_MONEY' : 'CREDIT_CARD',
      };

      // Save payment transaction to Firestore
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(firestore, 'securityPayments'), {
        vehicleId: vehicle.id,
        userId: user.uid,
        transactionId,
        amount,
        currency: 'USD',
        status: 'pending',
        paymentMethod,
        createdAt: new Date(),
        paymentData,
      });

      // Initialize CinetPay payment via API route (secure)
      // Ajouter un timeout pour éviter que la requête reste bloquée
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout
      
      let checkoutResponse: Response;
      try {
        checkoutResponse = await fetch('/api/cinetpay/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({
          transactionId,
          amount,
          currency: 'USD',
          description: paymentData.description,
          customerName: paymentData.customer_name,
          customerSurname: paymentData.customer_surname,
          customerEmail: paymentData.customer_email,
          customerPhoneNumber: paymentData.customer_phone_number,
          customerAddress: paymentData.customer_address,
          customerCity: paymentData.customer_city,
          customerZipCode: paymentData.customer_zip_code,
          paymentMethod,
        }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('La requête a pris trop de temps. Veuillez réessayer.');
        }
        throw fetchError;
      }

      // Check if response is JSON
      const contentType = checkoutResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await checkoutResponse.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('La réponse du serveur n\'est pas au format JSON. Vérifiez que la route API existe.');
      }

      const checkoutData = await checkoutResponse.json();

      if (checkoutData.success && checkoutData.paymentUrl) {
        // Rediriger vers la page de paiement CinetPay
        window.location.href = checkoutData.paymentUrl;
      } else {
        const errorMessage = checkoutData.error || 'Impossible de créer le paiement';
        const errorDetails = checkoutData.details ? `\n\nDétails: ${JSON.stringify(checkoutData.details).substring(0, 200)}` : '';
        const errorSuggestion = checkoutData.suggestion ? `\n\n${checkoutData.suggestion}` : '';
        throw new Error(`${errorMessage}${errorDetails}${errorSuggestion}`);
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      
      // Toujours réinitialiser l'état de traitement
      setIsProcessing(false);
      
      const errorMessage = error.message || 'Impossible de traiter le paiement';
      
      // Message d'erreur plus détaillé
      let userMessage = errorMessage;
      if (errorMessage.includes('timeout') || errorMessage.includes('trop de temps') || errorMessage.includes('AbortError')) {
        userMessage = 'La connexion à CinetPay prend trop de temps. Vérifiez votre connexion internet et réessayez.';
      } else if (errorMessage.includes('HTML') || errorMessage.includes('Réponse invalide')) {
        userMessage = 'Erreur de communication avec CinetPay. Vérifiez que vos identifiants API sont corrects dans la console CinetPay.';
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        userMessage = 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Erreur de paiement',
        description: userMessage,
        duration: 5000,
      });
    }
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    if (!vehicle || !firestore) return;

    try {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now

      await updateDoc(doc(firestore, 'securityVehicles', vehicle.id), {
        subscriptionStatus: 'active',
        subscriptionExpiry: expiryDate,
        isActive: true,
      });

      // Update payment status
      const { collection, query, where, getDocs, updateDoc: updatePayment } = await import('firebase/firestore');
      const paymentsQuery = query(
        collection(firestore, 'securityPayments'),
        where('transactionId', '==', transactionId)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      if (!paymentsSnapshot.empty) {
        await updatePayment(paymentsSnapshot.docs[0].ref, {
          status: 'completed',
          completedAt: new Date(),
        });
      }

      toast({
        title: 'Paiement réussi !',
        description: 'Votre abonnement GPS est maintenant actif.',
      });

      router.push(`/security/manage/${vehicle.id}`);
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'activer l\'abonnement',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isUserLoading || isVehicleLoading) {
    return (
      <div className={cn("flex h-screen flex-col items-center justify-center bg-background text-foreground")}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-2 border-primary/20">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Véhicule non trouvé</h2>
            <Button onClick={() => router.push('/security')} className="bg-gradient-to-r from-primary to-accent mt-4">
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="bg-gradient-to-r from-primary/10 via-background/90 to-accent/10 backdrop-blur-xl border-b border-primary/20 p-4 flex items-center gap-4 shadow-lg">
        <Button variant="ghost" size="icon" onClick={() => router.push('/security')} className="hover:bg-primary/10">
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Button>
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Paiement Abonnement GPS
          </h1>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Vehicle Info */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Informations du véhicule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {vehicle.vehicleImageUrl && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-primary/20 flex-shrink-0">
                  <Image
                    src={vehicle.vehicleImageUrl}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg">{vehicle.make} {vehicle.model}</h3>
                <p className="text-sm text-muted-foreground">Matricule: {vehicle.licensePlate}</p>
                <p className="text-sm text-muted-foreground">Traceur: {vehicle.trackerNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Détails du paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Abonnement mensuel GPS</span>
                <span className="text-2xl font-bold text-primary">{amount} USD</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Renouvellement automatique chaque mois
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <Label className="text-primary font-medium">Méthode de paiement</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile')}
                  className={cn(
                    "p-4 border-2 rounded-lg transition-all",
                    paymentMethod === 'mobile'
                      ? "border-primary bg-primary/10"
                      : "border-primary/20 hover:border-primary/40"
                  )}
                >
                  <div className="text-center">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <span className="font-medium">Mobile Money</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={cn(
                    "p-4 border-2 rounded-lg transition-all",
                    paymentMethod === 'card'
                      ? "border-primary bg-primary/10"
                      : "border-primary/20 hover:border-primary/40"
                  )}
                >
                  <div className="text-center">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <span className="font-medium">Carte bancaire</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Phone Number for Mobile Money */}
            {paymentMethod === 'mobile' && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-primary font-medium">
                  Numéro de téléphone
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+243 XXX XXX XXX"
                  className="border-primary/20 focus:border-primary focus:ring-primary/30"
                  required
                />
              </div>
            )}

            {/* Additional fields for Credit Card payment */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumberCard" className="text-primary font-medium">
                    Numéro de téléphone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumberCard"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+243 XXX XXX XXX"
                    className="border-primary/20 focus:border-primary focus:ring-primary/30"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerAddress" className="text-primary font-medium">
                    Adresse <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerAddress"
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Votre adresse"
                    className="border-primary/20 focus:border-primary focus:ring-primary/30"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerCity" className="text-primary font-medium">
                      Ville <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerCity"
                      type="text"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      placeholder="Kinshasa"
                      className="border-primary/20 focus:border-primary focus:ring-primary/30"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerZipCode" className="text-primary font-medium">
                      Code postal <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerZipCode"
                      type="text"
                      value={customerZipCode}
                      onChange={(e) => setCustomerZipCode(e.target.value)}
                      placeholder="00000"
                      className="border-primary/20 focus:border-primary focus:ring-primary/30"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement du paiement...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payer {amount} USD
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Paiement sécurisé par CinetPay</span>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* CinetPay Script */}
      <script
        src="https://secure.cinetpay.com/seamless-sdk/cinetpay.min.js"
        async
      />
    </div>
  );
}

