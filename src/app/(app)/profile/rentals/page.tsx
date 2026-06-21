'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase';

interface RentalBooking {
  id: string;
  rentalId: string;
  vehicleTitle: string;
  ownerId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  pricePerDay: number;
  status: string;
}

export default function RentalHistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'rentalBookings'),
      where('renterId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: bookings, isLoading, error } = useCollection<RentalBooking>(bookingsQuery);

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Historique des locations</h1>
      </header>

      <main className="p-4 space-y-4">
        {!user && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Connectez-vous pour voir votre historique.</p>
              <Link href="/login">
                <Button>Se connecter</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="p-6 text-center text-destructive">
              Impossible de charger l’historique des locations.
            </CardContent>
          </Card>
        )}

        {user && !error && (!bookings || bookings.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">Aucune location pour le moment</p>
              <p className="text-sm text-muted-foreground mb-4">Vos demandes de réservation apparaîtront ici.</p>
              <Link href="/vehicleRentalListings">
                <Button>Voir les véhicules à louer</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {bookings?.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle className="text-base">{booking.vehicleTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">Dates :</span> {booking.startDate} → {booking.endDate}</p>
              <p><span className="font-medium">Prix :</span> ${booking.pricePerDay}/jour</p>
              <p><span className="font-medium">Statut :</span> {booking.status === 'pending_owner_validation' ? 'En attente validation propriétaire' : booking.status}</p>
              <Link href={`/vehicleRentalListings/${booking.rentalId}`}>
                <Button variant="outline" className="w-full mt-2">Voir l’offre</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
