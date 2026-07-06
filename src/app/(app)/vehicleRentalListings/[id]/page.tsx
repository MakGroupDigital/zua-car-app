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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { addDoc, collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getListingImageUrls } from '@/lib/listing-images';
import { createNotification } from '@/lib/notifications/create-notification';

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
  const [rentalDate, setRentalDate] = useState('');
  const [rentalTime, setRentalTime] = useState('');
  const [durationType, setDurationType] = useState<'days' | 'hours'>('days');
  const [durationQuantity, setDurationQuantity] = useState(1);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

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
        toast({ 
          title: 'Retiré des favoris',
          duration: 2000,
        });
      } else {
        if (favSnap.exists()) {
          const currentData = favSnap.data();
          // Ensure rentalIds array exists
          const currentRentalIds = currentData.rentalIds || [];
          await updateDoc(favDocRef, {
            rentalIds: arrayUnion(rentalId),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(favDocRef, {
            userId: user.uid,
            rentalIds: [rentalId],
            vehicleIds: [],
            partIds: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        setIsFavorite(true);
        toast({ 
          title: 'Ajouté aux favoris ❤️',
          duration: 2000,
        });
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
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Connectez-vous pour louer ce véhicule',
      });
      router.push('/login');
      return;
    }

    if (rental?.userId === user.uid) {
      toast({
        variant: 'destructive',
        title: 'Action impossible',
        description: 'Vous ne pouvez pas louer votre propre véhicule',
      });
      return;
    }

    setShowReserveDialog(true);
  };

  const unitPrice = durationType === 'hours'
    ? (rental?.pricePerHour || Math.ceil((rental?.pricePerDay || 0) / 24))
    : (rental?.pricePerDay || 0);
  const safeDurationQuantity = Math.max(1, Number(durationQuantity) || 1);
  const estimatedTotal = unitPrice * safeDurationQuantity;

  const submitBookingRequest = async () => {
    if (!user || !firestore || !rental) return;

    if (!rentalDate || !rentalTime) {
      toast({
        variant: 'destructive',
        title: 'Date et heure requises',
        description: 'Choisissez la date et l’heure de début de location.',
      });
      return;
    }

    if (safeDurationQuantity < 1) {
      toast({
        variant: 'destructive',
        title: 'Durée invalide',
        description: 'La durée doit être au moins égale à 1.',
      });
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const startDateTime = new Date(`${rentalDate}T${rentalTime}`);
      const endDateTime = new Date(startDateTime);
      if (durationType === 'hours') {
        endDateTime.setHours(endDateTime.getHours() + safeDurationQuantity);
      } else {
        endDateTime.setDate(endDateTime.getDate() + safeDurationQuantity);
      }

      const bookingRef = await addDoc(collection(firestore, 'rentalBookings'), {
        rentalId,
        rentalTitle: displayTitle,
        ownerId: rental.userId,
        renterId: user.uid,
        renterName: user.displayName || user.email || 'Client AUTONEX',
        startDate: rentalDate,
        startTime: rentalTime,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        durationType,
        durationQuantity: safeDurationQuantity,
        unitPrice,
        estimatedTotal,
        currency: 'USD',
        status: 'pending_owner_validation',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await createNotification(firestore, {
        userId: rental.userId,
        type: 'rental_booked',
        title: 'Nouvelle demande de location',
        body: `${user.displayName || user.email || 'Un client'} veut louer ${displayTitle} le ${rentalDate} à ${rentalTime} pour ${safeDurationQuantity} ${durationType === 'hours' ? 'heure(s)' : 'jour(s)'}. Total estimé : $${estimatedTotal.toFixed(2)}.`,
        data: {
          rentalId,
          bookingId: bookingRef.id,
          renterId: user.uid,
        },
        imageUrl: rentalImages[0],
      });

      toast({
        title: 'Demande envoyée',
        description: 'Le propriétaire peut accepter, rejeter ou vous contacter par chat.',
      });
      setShowReserveDialog(false);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible d’envoyer la demande de location.',
      });
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: rental?.title || `${rental?.make} ${rental?.model}` || 'Véhicule de location',
      text: `${rental?.title || `${rental?.make} ${rental?.model}`} - $${rental?.pricePerDay}/jour sur AUTONEX`,
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

  const rentalImages = getListingImageUrls(rental);
  const placeholderImage = PlaceHolderImages.find(p => p.id === 'car-tesla-model-3');
  const displayTitle = rental.title || `${rental.make} ${rental.model}`;

  return (
    <div className="min-h-screen bg-muted">
      <main className="pb-28">
        <div className="px-4 pb-3">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-full bg-background/70 backdrop-blur">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>

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
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-2xl font-bold">{displayTitle}</CardTitle>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFavorite}
                    disabled={isFavoriteLoading}
                    className={cn("rounded-full", isFavorite && "text-primary")}
                  >
                    {isFavoriteLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                    )}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare} className="rounded-full">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
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

      <footer className="fixed inset-x-4 bottom-[104px] z-50 rounded-[1.5rem] border border-primary/10 bg-background/90 p-2 shadow-2xl shadow-primary/15 backdrop-blur-xl">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1 rounded-full"
            onClick={handleContactRenter}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Contacter
          </Button>
          <Button size="lg" className="flex-[1.35] rounded-full" onClick={handleReserve}>
                <Calendar className="mr-2 h-5 w-5" />
                Louer maintenant
            </Button>
        </div>
      </footer>

      {/* Reserve Dialog */}
      <Dialog open={showReserveDialog} onOpenChange={setShowReserveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Louer ce véhicule
            </DialogTitle>
            <DialogDescription>
              Choisissez le début, la durée et confirmez votre demande. Le propriétaire pourra accepter, rejeter ou vous contacter.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="rentalDate">Date</Label>
                <Input id="rentalDate" type="date" value={rentalDate} onChange={(e) => setRentalDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalTime">Heure</Label>
                <Input id="rentalTime" type="time" value={rentalTime} onChange={(e) => setRentalTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="durationType">Type de durée</Label>
                <select
                  id="durationType"
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value as 'days' | 'hours')}
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                >
                  <option value="days">Jour(s)</option>
                  <option value="hours">Heure(s)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationQuantity">Nombre</Label>
                <Input
                  id="durationQuantity"
                  type="number"
                  min={1}
                  value={durationQuantity}
                  onChange={(e) => setDurationQuantity(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Prix unitaire</span>
                <span className="font-bold">${unitPrice.toFixed(2)} / {durationType === 'hours' ? 'heure' : 'jour'}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-semibold">Total estimé</span>
                <span className="text-2xl font-black text-primary">${estimatedTotal.toFixed(2)}</span>
              </div>
            </div>
            
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
            <Button onClick={submitBookingRequest} disabled={isSubmittingBooking}>
              {isSubmittingBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
              Confirmer la demande
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
                window.open(`https://wa.me/?text=${encodeURIComponent(`${displayTitle} - $${rental.pricePerDay}/jour sur AUTONEX: ${window.location.href}`)}`, '_blank');
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
