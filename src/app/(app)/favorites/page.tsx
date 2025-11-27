
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Star, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface FavoriteVehicle {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  imageUrls?: string[];
  imageUrl?: string;
}

export default function FavoritesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !firestore) {
        setIsLoading(false);
        return;
      }

      try {
        // Get user's favorite vehicle IDs
        const favDocRef = doc(firestore, 'favorites', user.uid);
        const favSnap = await getDoc(favDocRef);

        if (!favSnap.exists()) {
          setFavorites([]);
          setIsLoading(false);
          return;
        }

        const vehicleIds: string[] = favSnap.data().vehicleIds || [];

        if (vehicleIds.length === 0) {
          setFavorites([]);
          setIsLoading(false);
          return;
        }

        // Fetch each vehicle's details
        const vehiclePromises = vehicleIds.map(async (vehicleId) => {
          const vehicleDocRef = doc(firestore, 'vehicles', vehicleId);
          const vehicleSnap = await getDoc(vehicleDocRef);
          
          if (vehicleSnap.exists()) {
            return {
              id: vehicleSnap.id,
              ...vehicleSnap.data(),
            } as FavoriteVehicle;
          }
          return null;
        });

        const vehicles = await Promise.all(vehiclePromises);
        setFavorites(vehicles.filter((v): v is FavoriteVehicle => v !== null));
      } catch (err) {
        console.error('Error fetching favorites:', err);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger vos favoris',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!isUserLoading) {
      fetchFavorites();
    }
  }, [user, isUserLoading, firestore, toast]);

  const removeFavorite = async (vehicleId: string) => {
    if (!user || !firestore) return;

    setRemovingId(vehicleId);

    try {
      const favDocRef = doc(firestore, 'favorites', user.uid);
      await updateDoc(favDocRef, {
        vehicleIds: arrayRemove(vehicleId),
        updatedAt: new Date(),
      });

      // Remove from local state
      setFavorites(favorites.filter(f => f.id !== vehicleId));

      toast({
        title: 'Retiré des favoris',
        description: 'L\'offre a été retirée de vos favoris',
      });
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de retirer des favoris',
      });
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen bg-muted">
        <header className="bg-background p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
          <Link href="/home" passHref>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Mes Favoris</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground mt-4">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted">
        <header className="bg-background p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
          <Link href="/home" passHref>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Mes Favoris</h1>
        </header>
        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Connexion requise</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Vous devez être connecté pour voir vos favoris.
          </p>
          <Link href="/login" passHref>
            <Button className="mt-4">Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <Link href="/home" passHref>
            <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
            </Button>
        </Link>
        <h1 className="text-xl font-bold">Mes Favoris</h1>
        {favorites.length > 0 && (
          <span className="ml-auto text-sm text-muted-foreground">
            {favorites.length} favori{favorites.length > 1 ? 's' : ''}
          </span>
        )}
      </header>
      <main className="p-4 space-y-4">
        {favorites.length === 0 ? (
             <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Votre liste de favoris est vide</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Cliquez sur l'icône en forme de cœur sur une offre pour l'ajouter ici.
            </p>
            <Link href="/vehicles" passHref>
              <Button className="mt-4">Parcourir les véhicules</Button>
            </Link>
             </div>
        ) : (
            <div className="space-y-4">
            {favorites.map((vehicle) => {
              const vehicleImageUrl = vehicle.imageUrls?.[0] || vehicle.imageUrl;
              const placeholderImage = PlaceHolderImages.find(p => p.id === 'car-tesla-model-3');

                    return (
                <Card key={vehicle.id} className="shadow-md">
                            <CardContent className="p-3 flex items-center gap-4">
                    <Link href={`/vehicles/${vehicle.id}`} className="flex-shrink-0">
                      {vehicleImageUrl ? (
                        <Image
                          src={vehicleImageUrl}
                          alt={vehicle.title || `${vehicle.make} ${vehicle.model}`}
                          width={100}
                          height={75}
                          className="rounded-lg object-cover aspect-[4/3]"
                        />
                      ) : placeholderImage ? (
                                    <Image
                          src={placeholderImage.imageUrl}
                          alt={vehicle.title || `${vehicle.make} ${vehicle.model}`}
                                        width={100}
                                        height={75}
                                        className="rounded-lg object-cover aspect-[4/3]"
                          data-ai-hint={placeholderImage.imageHint}
                                    />
                      ) : (
                        <div className="w-[100px] h-[75px] bg-muted rounded-lg flex items-center justify-center">
                          <Heart className="h-6 w-6 text-muted-foreground" />
                        </div>
                                )}
                                </Link>
                    <div className="flex-grow min-w-0">
                      <Link href={`/vehicles/${vehicle.id}`}>
                        <h3 className="font-bold hover:underline truncate">
                          {vehicle.title || `${vehicle.make} ${vehicle.model}`}
                        </h3>
                                     </Link>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.make} {vehicle.model} - {vehicle.year}
                      </p>
                      <p className="text-primary font-semibold mt-1">
                        ${vehicle.price?.toLocaleString()}
                      </p>
                                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      onClick={() => removeFavorite(vehicle.id)}
                      disabled={removingId === vehicle.id}
                    >
                      {removingId === vehicle.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                                    <Trash2 className="h-5 w-5" />
                      )}
                                    <span className="sr-only">Supprimer des favoris</span>
                                </Button>
                            </CardContent>
                        </Card>
              );
                })}
            </div>
        )}
      </main>
    </div>
  );
}
