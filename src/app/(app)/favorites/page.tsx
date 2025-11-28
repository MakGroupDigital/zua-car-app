'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Trash2, Loader2, Package, Car, KeyRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface FavoriteItem {
  id: string;
  type: 'vehicle' | 'part' | 'rental';
  title: string;
  price: number;
  imageUrls?: string[];
  imageUrl?: string;
  // Vehicle specific
  make?: string;
  model?: string;
  year?: number;
  // Part specific
  category?: string;
  condition?: string;
  // Rental specific
  location?: string;
  seats?: number;
}

export default function FavoritesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
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
        // Get user's favorite IDs
        const favDocRef = doc(firestore, 'favorites', user.uid);
        const favSnap = await getDoc(favDocRef);

        if (!favSnap.exists()) {
          console.log('No favorites document found for user:', user.uid);
          setFavorites([]);
          setIsLoading(false);
          return;
        }

        const favData = favSnap.data();
        console.log('Favorites data:', favData);
        const vehicleIds: string[] = favData.vehicleIds || [];
        const partIds: string[] = favData.partIds || [];
        const rentalIds: string[] = favData.rentalIds || [];
        
        console.log('Vehicle IDs:', vehicleIds);
        console.log('Part IDs:', partIds);
        console.log('Rental IDs:', rentalIds);

        const allFavorites: FavoriteItem[] = [];

        // Fetch vehicles
        const vehiclePromises = vehicleIds.map(async (vehicleId) => {
          try {
            const vehicleDocRef = doc(firestore, 'vehicles', vehicleId);
            const vehicleSnap = await getDoc(vehicleDocRef);
            
            if (vehicleSnap.exists()) {
              const data = vehicleSnap.data();
              return {
                id: vehicleSnap.id,
                type: 'vehicle' as const,
                title: data.title || `${data.make} ${data.model}`,
                price: data.price,
                imageUrls: data.imageUrls,
                imageUrl: data.imageUrl,
                make: data.make,
                model: data.model,
                year: data.year,
              } as FavoriteItem;
            }
            console.warn(`Vehicle ${vehicleId} does not exist`);
            return null;
          } catch (err: any) {
            console.error(`Error fetching vehicle ${vehicleId}:`, err);
            return null;
          }
        });

        // Fetch parts
        const partPromises = partIds.map(async (partId) => {
          try {
            const partDocRef = doc(firestore, 'parts', partId);
            const partSnap = await getDoc(partDocRef);
            
            if (partSnap.exists()) {
              const data = partSnap.data();
              return {
                id: partSnap.id,
                type: 'part' as const,
                title: data.title || data.name,
                price: data.price,
                imageUrls: data.imageUrls,
                imageUrl: data.imageUrl,
                category: data.category,
                condition: data.condition,
              } as FavoriteItem;
            }
            console.warn(`Part ${partId} does not exist`);
            return null;
          } catch (err: any) {
            console.error(`Error fetching part ${partId}:`, err);
            return null;
          }
        });

        // Fetch rentals
        const rentalPromises = rentalIds.map(async (rentalId) => {
          try {
            const rentalDocRef = doc(firestore, 'rentals', rentalId);
            const rentalSnap = await getDoc(rentalDocRef);
            
            if (rentalSnap.exists()) {
              const data = rentalSnap.data();
              return {
                id: rentalSnap.id,
                type: 'rental' as const,
                title: data.title || `${data.make} ${data.model}`,
                price: data.pricePerDay || data.pricePerHour || 0,
                imageUrls: data.imageUrls,
                imageUrl: data.imageUrl,
                make: data.make,
                model: data.model,
                location: data.location,
                seats: data.seats,
              } as FavoriteItem;
            }
            console.warn(`Rental ${rentalId} does not exist`);
            return null;
          } catch (err: any) {
            console.error(`Error fetching rental ${rentalId}:`, err);
            return null;
          }
        });

        const [vehicles, parts, rentals] = await Promise.all([
          Promise.all(vehiclePromises),
          Promise.all(partPromises),
          Promise.all(rentalPromises),
        ]);

        allFavorites.push(
          ...vehicles.filter((v): v is FavoriteItem => v !== null),
          ...parts.filter((p): p is FavoriteItem => p !== null),
          ...rentals.filter((r): r is FavoriteItem => r !== null)
        );

        console.log('All favorites fetched:', allFavorites);
        setFavorites(allFavorites);
      } catch (err: any) {
        console.error('Error fetching favorites:', err);
        console.error('Error details:', {
          code: err?.code,
          message: err?.message,
          stack: err?.stack
        });
        toast({
          variant: 'destructive',
          title: 'Erreur Firebase',
          description: err?.message || 'Impossible de charger vos favoris. Vérifiez la console pour plus de détails.',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!isUserLoading) {
      fetchFavorites();
    }
  }, [user, isUserLoading, firestore, toast]);

  const removeFavorite = async (item: FavoriteItem) => {
    if (!user || !firestore) return;

    setRemovingId(item.id);

    try {
      const favDocRef = doc(firestore, 'favorites', user.uid);
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (item.type === 'vehicle') {
        updateData.vehicleIds = arrayRemove(item.id);
      } else if (item.type === 'part') {
        updateData.partIds = arrayRemove(item.id);
      } else if (item.type === 'rental') {
        updateData.rentalIds = arrayRemove(item.id);
      }

      await updateDoc(favDocRef, updateData);

      // Remove from local state
      setFavorites(favorites.filter(f => f.id !== item.id));

      toast({
        title: 'Retiré des favoris',
        description: 'L\'offre a été retirée de vos favoris',
        duration: 2000,
      });
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de retirer des favoris',
        duration: 3000,
      });
    } finally {
      setRemovingId(null);
    }
  };

  const getItemUrl = (item: FavoriteItem) => {
    if (item.type === 'vehicle') {
      return `/vehicles/${item.id}`;
    } else if (item.type === 'part') {
      return `/parts/${item.id}`;
    } else if (item.type === 'rental') {
      return `/vehicleRentalListings/${item.id}`;
    }
    return '#';
  };

  const getItemIcon = (type: FavoriteItem['type']) => {
    switch (type) {
      case 'vehicle':
        return <Car className="h-4 w-4" />;
      case 'part':
        return <Package className="h-4 w-4" />;
      case 'rental':
        return <KeyRound className="h-4 w-4" />;
    }
  };

  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen bg-muted">
        <header className="bg-background p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
          <Link href="/home">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Mes Favoris</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted">
        <header className="bg-background p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
          <Link href="/home">
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
          <Link href="/login">
            <Button className="mt-4">Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <Link href="/home">
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
            <Link href="/vehicles">
              <Button className="mt-4">Parcourir les offres</Button>
            </Link>
             </div>
        ) : (
            <div className="space-y-4">
            {favorites.map((item) => {
              const itemImageUrl = item.imageUrls?.[0] || item.imageUrl;
              const placeholderImage = PlaceHolderImages.find(p => p.id === 'car-tesla-model-3');

                    return (
                <Card key={`${item.type}-${item.id}`} className="shadow-md">
                            <CardContent className="p-3 flex items-center gap-4">
                    <Link href={getItemUrl(item)} className="flex-shrink-0">
                      {itemImageUrl ? (
                        <Image
                          src={itemImageUrl}
                          alt={item.title}
                          width={100}
                          height={75}
                          className="rounded-lg object-cover aspect-[4/3]"
                        />
                      ) : placeholderImage ? (
                                    <Image
                          src={placeholderImage.imageUrl}
                          alt={item.title}
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
                      <div className="flex items-center gap-2 mb-1">
                        {getItemIcon(item.type)}
                        <Link href={getItemUrl(item)}>
                          <h3 className="font-bold hover:underline truncate">
                            {item.title}
                          </h3>
                                     </Link>
                                    </div>
                      {item.type === 'vehicle' && (
                        <p className="text-sm text-muted-foreground">
                          {item.make} {item.model} {item.year && `- ${item.year}`}
                        </p>
                      )}
                      {item.type === 'part' && (
                        <p className="text-sm text-muted-foreground">
                          {item.category} {item.condition && `- ${item.condition}`}
                        </p>
                      )}
                      {item.type === 'rental' && (
                        <p className="text-sm text-muted-foreground">
                          {item.location} {item.seats && `- ${item.seats} places`}
                        </p>
                      )}
                      <p className="text-primary font-semibold mt-1">
                        ${item.price?.toLocaleString()}
                        {item.type === 'rental' && <span className="text-xs">/jour</span>}
                      </p>
                                </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      onClick={() => removeFavorite(item)}
                      disabled={removingId === item.id}
                    >
                      {removingId === item.id ? (
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
