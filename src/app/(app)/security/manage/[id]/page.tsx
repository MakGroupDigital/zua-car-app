'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, RefreshCw, Loader2, Shield, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
// Google Maps integration - using iframe embed for simplicity

interface SecurityVehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  trackerNumber: string;
  licensePlate: string;
  isActive: boolean;
  subscriptionStatus: 'active' | 'expired' | 'pending';
  subscriptionExpiry?: {
    seconds: number;
    nanoseconds: number;
  };
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: {
      seconds: number;
      nanoseconds: number;
    };
  };
}

export default function SecurityManagePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -4.4419, lng: 15.2663 }); // Kinshasa default

  const vehicleDocRef = useMemoFirebase(() => {
    if (!vehicleId || !firestore) return null;
    return doc(firestore, 'securityVehicles', vehicleId);
  }, [firestore, vehicleId]);

  const { data: vehicle, isLoading: isVehicleLoading } = useDoc<SecurityVehicle>(vehicleDocRef);

  useEffect(() => {
    if (vehicle?.currentLocation) {
      setMapCenter({
        lat: vehicle.currentLocation.lat,
        lng: vehicle.currentLocation.lng,
      });
    }
  }, [vehicle]);

  const refreshLocation = async () => {
    if (!vehicle || !firestore) return;

    setIsRefreshing(true);
    try {
      // Simulate GPS location update
      // In a real app, this would come from the GPS tracker device
      const newLocation = {
        lat: mapCenter.lat + (Math.random() - 0.5) * 0.01, // Small random offset for demo
        lng: mapCenter.lng + (Math.random() - 0.5) * 0.01,
        timestamp: new Date(),
      };

      await updateDoc(doc(firestore, 'securityVehicles', vehicle.id), {
        currentLocation: {
          lat: newLocation.lat,
          lng: newLocation.lng,
          timestamp: newLocation.timestamp,
        },
      });

      setMapCenter({ lat: newLocation.lat, lng: newLocation.lng });

      toast({
        title: 'Position mise à jour',
        description: 'La position du véhicule a été actualisée.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour la position',
      });
    } finally {
      setIsRefreshing(false);
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
            <p className="text-muted-foreground mb-4">
              Le véhicule demandé n'existe pas ou vous n'avez pas l'autorisation de le voir.
            </p>
            <Button onClick={() => router.push('/security')} className="bg-gradient-to-r from-primary to-accent">
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (vehicle.subscriptionStatus !== 'active') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-2 border-primary/20">
          <CardContent className="p-6 text-center">
            <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Abonnement requis</h2>
            <p className="text-muted-foreground mb-4">
              Vous devez avoir un abonnement actif pour voir la position de votre véhicule.
            </p>
            <Button onClick={() => router.push('/security')} className="bg-gradient-to-r from-primary to-accent">
              Retour à la sécurité
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const vehicleLocation = vehicle.currentLocation || { lat: mapCenter.lat, lng: mapCenter.lng };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="bg-gradient-to-r from-primary/10 via-background/90 to-accent/10 backdrop-blur-xl border-b border-primary/20 p-4 flex items-center gap-4 shadow-lg">
        <Button variant="ghost" size="icon" onClick={() => router.push('/security')} className="hover:bg-primary/10">
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
          </div>
        </div>
        <Button
          onClick={refreshLocation}
          disabled={isRefreshing}
          className="bg-gradient-to-r from-primary to-accent"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Actualisation...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </>
          )}
        </Button>
      </header>

      <main className="p-4 space-y-4">
        {/* Vehicle Info Card */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Traceur GPS</p>
                <p className="font-semibold">{vehicle.trackerNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Statut</p>
                <p className="font-semibold text-green-600">Actif</p>
              </div>
            </div>
            {vehicle.currentLocation && (
              <div className="mt-3 pt-3 border-t border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Dernière mise à jour: {new Date(vehicle.currentLocation.timestamp.seconds * 1000).toLocaleString('fr-FR')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="shadow-lg border-2 border-primary/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Position actuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[500px] relative">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${vehicleLocation.lat},${vehicleLocation.lng}&zoom=15`}
              />
              <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{vehicle.make} {vehicle.model}</p>
                    <p className="text-xs text-muted-foreground">{vehicle.licensePlate}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

