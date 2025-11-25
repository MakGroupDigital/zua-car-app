
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
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Heart, Share2, Gauge, GitCommitHorizontal, Calendar, Palette, MessageSquare, BadgeCheck, Check, Copy, Link2, X, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Rating } from '@/components/ui/rating';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useParams, useRouter } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase/provider';
import { doc, getDoc, setDoc, deleteDoc, arrayUnion, arrayRemove, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

interface SellerInfo {
  name: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  isVerified?: boolean;
}

export default function VehicleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();
  const vehicleId = params.id as string;
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(true);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [isRatingLoading, setIsRatingLoading] = useState(true);

  const vehicleDoc = useMemoFirebase(() =>
        firestore && vehicleId ? doc(firestore, 'vehicles', vehicleId) : null,
    [firestore, vehicleId]
  );
  const { data: vehicle, isLoading, error } = useDoc<any>(vehicleDoc);

  // Check if vehicle is in user's favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !vehicleId || !firestore) {
        setIsFavoriteLoading(false);
        return;
      }

      try {
        const favDocRef = doc(firestore, 'favorites', user.uid);
        const favSnap = await getDoc(favDocRef);
        
        if (favSnap.exists()) {
          const favorites = favSnap.data().vehicleIds || [];
          setIsFavorite(favorites.includes(vehicleId));
        } else {
          setIsFavorite(false);
        }
      } catch (err) {
        console.error('Error checking favorite:', err);
        setIsFavorite(false);
      } finally {
        setIsFavoriteLoading(false);
      }
    };

    checkFavorite();
  }, [user, vehicleId, firestore]);

  // Fetch seller info when vehicle is loaded
  useEffect(() => {
    const fetchSeller = async () => {
      if (!vehicle?.userId || !firestore) {
        setSellerLoading(false);
        return;
      }

      try {
        const userDocRef = doc(firestore, 'users', vehicle.userId);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setSeller({
            name: userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}`
              : userData.displayName || userData.name || 'Vendeur',
            firstName: userData.firstName,
            lastName: userData.lastName,
            photoURL: userData.photoURL,
            isVerified: userData.isVerified || false,
          });
        } else {
          // User document doesn't exist, use default
          setSeller({
            name: 'Vendeur',
            isVerified: false,
          });
        }
      } catch (err) {
        console.error('Error fetching seller:', err);
        setSeller({
          name: 'Vendeur',
          isVerified: false,
        });
      } finally {
        setSellerLoading(false);
      }
    };

    if (vehicle) {
      fetchSeller();
    }
  }, [vehicle, firestore]);

  // Fetch ratings
  useEffect(() => {
    const fetchRatings = async () => {
      if (!vehicleId || !firestore) {
        setIsRatingLoading(false);
        return;
      }

      try {
        const ratingsRef = collection(firestore, 'ratings');
        const q = query(ratingsRef, where('vehicleId', '==', vehicleId));
        const querySnapshot = await getDocs(q);
        
        let totalRating = 0;
        let count = 0;
        let userRatingValue: number | null = null;

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          totalRating += data.rating;
          count++;
          
          if (user && data.userId === user.uid) {
            userRatingValue = data.rating;
          }
        });

        setUserRating(userRatingValue);
        setRatingCount(count);
        setAverageRating(count > 0 ? totalRating / count : 0);
      } catch (err) {
        console.error('Error fetching ratings:', err);
      } finally {
        setIsRatingLoading(false);
      }
    };

    fetchRatings();
  }, [vehicleId, firestore, user]);

  // Handle rating submission
  const handleRate = async (rating: number) => {
    if (!user || !vehicleId || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour noter cette offre',
      });
      return;
    }

    try {
      const ratingId = `${vehicleId}_${user.uid}`;
      const ratingRef = doc(firestore, 'ratings', ratingId);
      
      // Check if user already rated
      const existingRating = await getDoc(ratingRef);
      const wasUpdate = existingRating.exists();
      
      await setDoc(ratingRef, {
        vehicleId,
        userId: user.uid,
        rating,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setUserRating(rating);
      
      // Recalculate average rating
      const ratingsRef = collection(firestore, 'ratings');
      const q = query(ratingsRef, where('vehicleId', '==', vehicleId));
      const querySnapshot = await getDocs(q);
      
      let totalRating = 0;
      let count = 0;
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        totalRating += data.rating;
        count++;
      });

      setRatingCount(count);
      setAverageRating(count > 0 ? totalRating / count : 0);

      toast({
        title: wasUpdate ? 'Note mise à jour' : 'Note enregistrée',
        description: `Vous avez donné ${rating} étoile${rating > 1 ? 's' : ''} à cette offre`,
      });
    } catch (err) {
      console.error('Error submitting rating:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'enregistrer votre note',
      });
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement…</div>;
  }
  if (error || !vehicle) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-muted">
        <p>Véhicule non trouvé.</p>
        <Button onClick={() => router.back()} className="mt-4">Retour</Button>
      </div>
    );
  }
  const images = (Array.isArray(vehicle.imageUrls) && vehicle.imageUrls.length > 0)
    ? vehicle.imageUrls
    : (vehicle.imageUrl ? [vehicle.imageUrl] : []);
  
  const getSellerInitials = () => {
    if (seller?.firstName && seller?.lastName) {
      return `${seller.firstName.charAt(0)}${seller.lastName.charAt(0)}`;
    }
    if (seller?.name) {
      return seller.name.substring(0, 2).toUpperCase();
    }
    return 'VD';
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour ajouter aux favoris',
      });
      router.push('/login');
      return;
    }

    if (!vehicleId || !firestore) return;

    setIsFavoriteLoading(true);

    try {
      const favDocRef = doc(firestore, 'favorites', user.uid);
      const favSnap = await getDoc(favDocRef);

      if (isFavorite) {
        // Remove from favorites
        if (favSnap.exists()) {
          await updateDoc(favDocRef, {
            vehicleIds: arrayRemove(vehicleId),
            updatedAt: new Date(),
          });
        }
        setIsFavorite(false);
        toast({
          title: 'Retiré des favoris',
          description: 'Cette offre a été retirée de vos favoris',
        });
      } else {
        // Add to favorites
        if (favSnap.exists()) {
          await updateDoc(favDocRef, {
            vehicleIds: arrayUnion(vehicleId),
            updatedAt: new Date(),
          });
        } else {
          // Create favorites document
          await setDoc(favDocRef, {
            userId: user.uid,
            vehicleIds: [vehicleId],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        setIsFavorite(true);
        toast({
          title: 'Ajouté aux favoris ❤️',
          description: 'Cette offre a été ajoutée à vos favoris',
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

  const getShareData = () => {
    const shareUrl = window.location.href;
    const shareTitle = vehicle?.title || `${vehicle?.make} ${vehicle?.model} ${vehicle?.year}`;
    const shareDescription = vehicle?.description || `${vehicle?.make} ${vehicle?.model} ${vehicle?.year} - ${vehicle?.mileage || 'Kilométrage non spécifié'}`;
    const shareText = `🚗 ${shareTitle}\n\n💰 Prix: $${vehicle?.price?.toLocaleString()}\n📅 Année: ${vehicle?.year}\n\n${shareDescription}\n\n👉 Voir l'offre sur Zua-Car:`;
    
    return { shareUrl, shareTitle, shareText, shareDescription };
  };

  const handleShare = async () => {
    const { shareUrl, shareTitle, shareText } = getShareData();

    // Check if Web Share API is available (mainly for mobile)
    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: 'Partagé !',
          description: 'L\'offre a été partagée avec succès',
        });
      } catch (err: any) {
        // User cancelled - show dialog instead
        if (err.name === 'AbortError') {
          return;
        }
        // Error - show share dialog
        setShowShareDialog(true);
      } finally {
        setIsSharing(false);
      }
    } else {
      // Desktop: show share dialog
      setShowShareDialog(true);
    }
  };

  const shareOnWhatsApp = () => {
    const { shareUrl, shareTitle, shareText } = getShareData();
    const whatsappText = encodeURIComponent(`${shareText} ${shareUrl}`);
    window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
    setShowShareDialog(false);
    toast({
      title: 'Ouverture de WhatsApp',
      description: 'Partagez l\'offre avec vos contacts',
    });
  };

  const shareOnFacebook = () => {
    const { shareUrl } = getShareData();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    setShowShareDialog(false);
    toast({
      title: 'Ouverture de Facebook',
      description: 'Partagez l\'offre sur votre profil',
    });
  };

  const shareOnTwitter = () => {
    const { shareUrl, shareTitle } = getShareData();
    const twitterText = encodeURIComponent(`🚗 ${shareTitle} à $${vehicle?.price?.toLocaleString()} sur Zua-Car!`);
    window.open(`https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    setShowShareDialog(false);
    toast({
      title: 'Ouverture de Twitter',
      description: 'Partagez l\'offre sur Twitter',
    });
  };

  const shareOnTelegram = () => {
    const { shareUrl, shareText } = getShareData();
    const telegramText = encodeURIComponent(`${shareText} ${shareUrl}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${telegramText}`, '_blank');
    setShowShareDialog(false);
    toast({
      title: 'Ouverture de Telegram',
      description: 'Partagez l\'offre sur Telegram',
    });
  };

  const shareByEmail = () => {
    const { shareUrl, shareTitle, shareText } = getShareData();
    const subject = encodeURIComponent(`Offre Zua-Car: ${shareTitle}`);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareDialog(false);
  };

  const copyToClipboard = async () => {
    const { shareUrl } = getShareData();
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Lien copié !',
        description: 'Le lien de l\'offre a été copié dans le presse-papiers',
      });
      setShowShareDialog(false);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de copier le lien',
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted">
        <header className="bg-transparent p-4 flex items-center justify-between absolute top-0 left-0 w-full z-10">
            <Button variant="ghost" size="icon" className="bg-background/50 backdrop-blur-sm rounded-full" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex gap-2">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`bg-background/50 backdrop-blur-sm rounded-full transition-all ${isFavorite ? 'text-red-500' : ''}`}
                    onClick={toggleFavorite}
                    disabled={isFavoriteLoading}
                  >
                    <Heart className={`h-6 w-6 transition-all ${isFavorite ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                </Button>
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="bg-background/50 backdrop-blur-sm rounded-full"
                    onClick={handleShare}
                    disabled={isSharing}
                  >
                    <Share2 className="h-6 w-6" />
                </Button>
            </div>
        </header>

      <main className="pb-28">
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((img, index) => (
              img && (
                <CarouselItem key={index}>
                  <div className="relative w-full h-[40vh]">
                     <Image
                      src={img}
                      alt={`${vehicle.model} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      data-ai-hint={img}
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                </CarouselItem>
              )
            ))}
          </CarouselContent>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
             <CarouselPrevious className="static translate-y-0" />
             <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>

        <div className="p-4 space-y-6 -mt-8 relative">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{vehicle.model}</CardTitle>
                    <p className="text-2xl font-extrabold text-primary">${vehicle.price}</p>
                    {!isRatingLoading && (
                      <div className="flex items-center gap-4 mt-2">
                        <Rating
                          value={averageRating}
                          readonly={true}
                          showValue={true}
                          size="md"
                        />
                        {ratingCount > 0 && (
                          <span className="text-sm text-muted-foreground">
                            ({ratingCount} avis{ratingCount > 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                    )}
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground"><Gauge className="h-5 w-5 text-primary"/> <span>{vehicle.mileage}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><GitCommitHorizontal className="h-5 w-5 text-primary"/> <span>{vehicle.transmission}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-5 w-5 text-primary"/> <span>{vehicle.year}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Palette className="h-5 w-5 text-primary"/> <span>{vehicle.color}</span></div>
                </CardContent>
            </Card>

            {/* Rating Section */}
            {user && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Noter cette offre</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userRating ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Votre note: {userRating} étoile{userRating > 1 ? 's' : ''}
                        </p>
                        <Rating
                          value={userRating}
                          onRate={handleRate}
                          size="lg"
                          showValue={false}
                        />
                        <p className="text-xs text-muted-foreground">
                          Cliquez sur les étoiles pour modifier votre note
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Donnez votre avis sur cette offre
                        </p>
                        <Rating
                          value={0}
                          onRate={handleRate}
                          size="lg"
                          showValue={false}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Superbe {vehicle.model} de {vehicle.year} en excellent état. Parfait pour la ville et les longs trajets. Entretien régulier effectué. Contactez-nous pour un essai !
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Vendeur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                                 {seller?.photoURL && <AvatarImage src={seller.photoURL} alt={seller.name} />}
                                <AvatarFallback>{getSellerInitials()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold flex items-center gap-2">
                                  {sellerLoading ? 'Chargement...' : (seller?.name || 'Vendeur')} 
                                  {seller?.isVerified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                                </p>
                                <p className="text-xs text-muted-foreground">Vendeur</p>
                            </div>
                        </div>
                    </div>
                    {/* Contact Buttons */}
                    <div className="flex gap-2">
                        <Button 
                            variant="default" 
                            className="flex-1"
                            onClick={() => {
                                // Create conversation with seller about this vehicle
                                const message = encodeURIComponent(`Bonjour, je suis intéressé par votre ${vehicle?.title || `${vehicle?.make} ${vehicle?.model}`} à $${vehicle?.price?.toLocaleString()}.`);
                                router.push(`/messages?sellerId=${vehicle?.userId}&vehicleId=${vehicleId}&message=${message}`);
                            }}
                        >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Écrire un message
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => {
                                // Call seller (if phone available)
                                toast({
                                    title: 'Appel téléphonique',
                                    description: 'Le numéro du vendeur n\'est pas encore disponible',
                                });
                            }}
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 w-full bg-background border-t p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center gap-3">
             <Button 
                size="lg" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                    const message = encodeURIComponent(`Bonjour, je souhaite faire une offre pour votre ${vehicle?.title || `${vehicle?.make} ${vehicle?.model}`}.`);
                    router.push(`/messages?sellerId=${vehicle?.userId}&vehicleId=${vehicleId}&message=${message}`);
                }}
              >
                Faire une offre
              </Button>
            <Button 
                size="lg" 
                className="flex-1"
                onClick={() => {
                    const message = encodeURIComponent(`Bonjour, je suis intéressé par votre ${vehicle?.title || `${vehicle?.make} ${vehicle?.model}`} à $${vehicle?.price?.toLocaleString()}. Est-il toujours disponible ?`);
                    router.push(`/messages?sellerId=${vehicle?.userId}&vehicleId=${vehicleId}&message=${message}`);
                }}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Écrire un message
            </Button>
        </div>
      </footer>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partager cette offre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Vehicle Preview */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              {images[0] && (
                <Image
                  src={images[0]}
                  alt={vehicle?.title || 'Véhicule'}
                  width={60}
                  height={45}
                  className="rounded-md object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{vehicle?.title || `${vehicle?.make} ${vehicle?.model}`}</p>
                <p className="text-sm text-primary font-bold">${vehicle?.price?.toLocaleString()}</p>
              </div>
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-4 gap-4">
              {/* WhatsApp */}
              <button
                onClick={shareOnWhatsApp}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span className="text-xs">WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={shareOnFacebook}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-xs">Facebook</span>
              </button>

              {/* Twitter/X */}
              <button
                onClick={shareOnTwitter}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-xs">X</span>
              </button>

              {/* Telegram */}
              <button
                onClick={shareOnTelegram}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <span className="text-xs">Telegram</span>
              </button>
            </div>

            {/* Additional Options */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={shareByEmail}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 fill-current">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Email
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={copyToClipboard}
              >
                <Link2 className="w-4 h-4 mr-2" />
                Copier le lien
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
