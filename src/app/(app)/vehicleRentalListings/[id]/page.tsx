'use client';

import { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Share2, Star, Clock, Sun, Calendar, MessageSquare, BadgeCheck, Loader2, Heart, Copy, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useParams, useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Rental {
  id: string;
  title: string;
  make?: string;
  model?: string;
  description: string;
  pricePerDay: number;
  pricePerHour?: number;
  pricePerWeek?: number;
  seats?: number;
  imageUrls?: string[];
  imageUrl?: string;
  userId: string;
  createdAt: any;
  status?: string;
  location?: string;
}

interface RenterInfo {
  name: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  phoneNumber?: string;
  isVerified?: boolean;
}

export default function RentalDetailsPage() {
    const router = useRouter();
    const params = useParams();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const rentalId = params.id as string;
  
  const [renter, setRenter] = useState<RenterInfo | null>(null);
  const [renterLoading, setRenterLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showReserveDialog, setShowReserveDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Fetch rental from Firebase
  const rentalDoc = useMemoFirebase(() =>
    firestore && rentalId ? doc(firestore, 'rentals', rentalId) : null,
    [firestore, rentalId]
  );
  const { data: rental, isLoading, error } = useDoc<Rental>(rentalDoc);

  // Fetch renter info
  useEffect(() => {
    const fetchRenter = async () => {
      if (!rental?.userId || !firestore) {
        setRenterLoading(false);
        return;
      }

      try {
        const renterDocRef = doc(firestore, 'users', rental.userId);
        const renterSnap = await getDoc(renterDocRef);
        
        if (renterSnap.exists()) {
          const data = renterSnap.data();
          setRenter({
            name: data.firstName && data.lastName 
              ? `${data.firstName} ${data.lastName}`
              : data.displayName || data.name || 'Loueur',
            firstName: data.firstName,
            lastName: data.lastName,
            photoURL: data.photoURL,
            phoneNumber: data.phoneNumber,
            isVerified: data.isVerified || false,
          });
        } else {
          setRenter({ name: 'Loueur', isVerified: false });
        }
      } catch (err) {
        console.error('Error fetching renter:', err);
        setRenter({ name: 'Loueur', isVerified: false });
      } finally {
        setRenterLoading(false);
      }
    };

    if (rental) {
      fetchRenter();
    }
  }, [rental, firestore]);

  // Check if rental is in favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !rentalId || !firestore) return;

      try {
        const favDocRef = doc(firestore, 'favorites', user.uid);
        const favSnap = await getDoc(favDocRef);
        
        if (favSnap.exists()) {
          const favorites = favSnap.data().rentalIds || [];
          setIsFavorite(favorites.includes(rentalId));
        }
      } catch (err) {
        console.error('Error checking favorite:', err);
      }
    };

    checkFavorite();
  }, [user, rentalId, firestore]);

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Connectez-vous pour ajouter aux favoris',
      });
      return;
    }

    if (!firestore) return;

    setIsFavoriteLoading(true);

    try {
      const favDocRef = doc(firestore, 'favorites', user.uid);
      const favSnap = await getDoc(favDocRef);

      if (isFavorite) {
        if (favSnap.exists()) {
          await updateDoc(favDocRef, {
            rentalIds: arrayRemove(rentalId),
            updatedAt: new Date(),
          });
        }
        setIsFavorite(false);
        toast({ title: 'Retiré des favoris' });
      } else {
        if (favSnap.exists()) {
          await updateDoc(favDocRef, {
            rentalIds: arrayUnion(rentalId),
            updatedAt: new Date(),
          });
        } else {
          await setDoc(favDocRef, {
            userId: user.uid,
            rentalIds: [rentalId],
            vehicleIds: [],
            partIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        setIsFavorite(true);
        toast({ title: 'Ajouté aux favoris ❤️' });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de modifier les favoris',
      });
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleContactRenter = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Connectez-vous pour contacter le loueur',
      });
      router.push('/login');
      return;
    }

    if (rental?.userId === user.uid) {
      toast({
        variant: 'destructive',
        title: 'Action impossible',
        description: 'Vous ne pouvez pas vous contacter vous-même',
      });
      return;
    }

    const message = encodeURIComponent(`Bonjour, je suis intéressé par la location de votre "${rental?.title || `${rental?.make} ${rental?.model}`}" à $${rental?.pricePerDay}/jour.`);
    router.push(`/messages?sellerId=${rental?.userId}&rentalId=${rentalId}&message=${message}`);
  };

  const handleReserve = () => {
    setShowReserveDialog(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: rental?.title || `${rental?.make} ${rental?.model}` || 'Véhicule de location',
      text: `${rental?.title || `${rental?.make} ${rental?.model}`} - $${rental?.pricePerDay}/jour sur Zua-Car`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setShowShareDialog(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Lien copié !' });
      setShowShareDialog(false);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur lors de la copie' });
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (error || !rental) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-muted">
        <p className="text-muted-foreground">Offre de location non trouvée.</p>
                <Button onClick={() => router.back()} className="mt-4">Retour</Button>
            </div>
    );
    }

  const rentalImages = rental.imageUrls || (rental.imageUrl ? [rental.imageUrl] : []);
  const placeholderImage = PlaceHolderImages.find(p => p.id === 'car-tesla-model-3');
  const displayTitle = rental.title || `${rental.make} ${rental.model}`;

  return (
    <div className="min-h-screen bg-muted">
        <header className="bg-background/80 backdrop-blur-sm p-4 flex items-center justify-between sticky top-0 z-10">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
        <h1 className="text-xl font-bold truncate flex-1 mx-4 text-center">
          {displayTitle}
        </h1>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleFavorite}
            disabled={isFavoriteLoading}
            className={cn(isFavorite && "text-red-500")}
          >
            {isFavoriteLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Heart className={cn("h-6 w-6", isFavorite && "fill-current")} />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-6 w-6" />
            </Button>
        </div>
        </header>

      <main className="pb-28">
        {/* Image Carousel */}
         <Carousel className="w-full bg-card">
          <CarouselContent>
            {rentalImages.length > 0 ? (
              rentalImages.map((imgUrl, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-[35vh]">
                     <Image
                      src={imgUrl}
                      alt={`${displayTitle} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              ))
            ) : placeholderImage ? (
              <CarouselItem>
                <div className="relative w-full h-[35vh]">
                  <Image
                    src={placeholderImage.imageUrl}
                    alt={displayTitle}
                    fill
                    className="object-cover"
                    data-ai-hint={placeholderImage.imageHint}
                  />
                </div>
              </CarouselItem>
            ) : null}
          </CarouselContent>
            {rentalImages.length > 1 && (
                <>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                </>
            )}
        </Carousel>

        <div className="p-4 space-y-4">
          {/* Main Info Card */}
            <Card className="shadow-lg">
                <CardHeader>
              <CardTitle className="text-2xl font-bold">{displayTitle}</CardTitle>
              {rental.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4" />
                  <span>{rental.location}</span>
                    </div>
              )}
                </CardHeader>
                 <CardContent>
              <p className="text-muted-foreground">{rental.description || 'Aucune description disponible.'}</p>
                </CardContent>
            </Card>

          {/* Pricing Card */}
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Tarifs de Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
              {rental.pricePerHour && (
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                            <Clock className="h-6 w-6 text-primary"/>
                            <span className="font-medium">Par Heure</span>
                        </div>
                  <span className="font-bold text-lg">${rental.pricePerHour.toFixed(2)}</span>
                    </div>
              )}
                     <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                            <Sun className="h-6 w-6 text-primary"/>
                            <span className="font-medium">Par Jour</span>
                        </div>
                <span className="font-bold text-lg">${rental.pricePerDay?.toFixed(2)}</span>
                    </div>
              {rental.pricePerWeek && (
                     <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-6 w-6 text-primary"/>
                            <span className="font-medium">Par Semaine</span>
                        </div>
                  <span className="font-bold text-lg">${rental.pricePerWeek.toFixed(2)}</span>
                </div>
              )}
              {rental.seats && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <span className="font-medium">Places :</span>
                  <span>{rental.seats} places</span>
                    </div>
              )}
                </CardContent>
            </Card>

          {/* Renter Card */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Loueur</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
              {renterLoading ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-muted animate-pulse rounded" />
                    <div className="w-16 h-3 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ) : (
                    <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                    {renter?.photoURL && <AvatarImage src={renter.photoURL} alt={renter.name} />}
                    <AvatarFallback>{getInitials(renter?.name || 'L')}</AvatarFallback>
                        </Avatar>
                        <div>
                    <p className="font-bold flex items-center gap-2">
                      {renter?.name} 
                      {renter?.isVerified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                    </p>
                    <p className="text-xs text-muted-foreground">Loueur</p>
                        </div>
                    </div>
              )}
              <Button variant="outline" size="icon" onClick={handleContactRenter}>
                <MessageSquare className="h-5 w-5" />
              </Button>
                </CardContent>
            </Card>
        </div>
      </main>

      {/* Fixed Bottom Bar */}
      <footer className="fixed bottom-0 left-0 w-full bg-background border-t p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1"
            onClick={handleContactRenter}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Contacter
          </Button>
          <Button size="lg" className="flex-1" onClick={handleReserve}>
                <Calendar className="mr-2 h-5 w-5" />
                Réserver
            </Button>
        </div>
      </footer>

      {/* Reserve Dialog */}
      <Dialog open={showReserveDialog} onOpenChange={setShowReserveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Réserver ce véhicule
            </DialogTitle>
            <DialogDescription>
              Pour réserver <strong>{displayTitle}</strong> à <strong>${rental.pricePerDay}/jour</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Pour finaliser votre réservation, veuillez contacter directement le loueur. 
              Vous pourrez discuter des dates, modalités de paiement et de récupération du véhicule.
            </p>
            
            {renter && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {renter.photoURL && <AvatarImage src={renter.photoURL} />}
                    <AvatarFallback>{getInitials(renter.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{renter.name}</p>
                    <p className="text-xs text-muted-foreground">Loueur</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowReserveDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              setShowReserveDialog(false);
              handleContactRenter();
            }}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Contacter le loueur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager cette location</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-wrap gap-3 py-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                window.open(`https://wa.me/?text=${encodeURIComponent(`${displayTitle} - $${rental.pricePerDay}/jour sur Zua-Car: ${window.location.href}`)}`, '_blank');
              }}
            >
              WhatsApp
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
              }}
            >
              Facebook
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={copyToClipboard}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
