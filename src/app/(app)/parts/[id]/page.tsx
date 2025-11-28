'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Share2, MessageSquare, BadgeCheck, ShoppingCart, Loader2, Heart, Check, Copy, Phone } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Part {
  id: string;
  title: string;
  name?: string;
  description: string;
  price: number;
  category: string;
  compatibility: string;
  condition: string;
  imageUrls?: string[];
  imageUrl?: string;
  userId: string;
  createdAt: any;
  status?: string;
}

interface SellerInfo {
  name: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  phoneNumber?: string;
  isVerified?: boolean;
}

export default function PartDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const partId = params.id as string;
  
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Fetch part from Firebase
  const partDoc = useMemoFirebase(() =>
    firestore && partId ? doc(firestore, 'parts', partId) : null,
    [firestore, partId]
  );
  const { data: part, isLoading, error } = useDoc<Part>(partDoc);

  // Fetch seller info
  useEffect(() => {
    const fetchSeller = async () => {
      if (!part?.userId || !firestore) {
        setSellerLoading(false);
        return;
      }

      try {
        const sellerDocRef = doc(firestore, 'users', part.userId);
        const sellerSnap = await getDoc(sellerDocRef);
        
        if (sellerSnap.exists()) {
          const data = sellerSnap.data();
          setSeller({
            name: data.firstName && data.lastName 
              ? `${data.firstName} ${data.lastName}`
              : data.displayName || data.name || 'Vendeur',
            firstName: data.firstName,
            lastName: data.lastName,
            photoURL: data.photoURL,
            phoneNumber: data.phoneNumber,
            isVerified: data.isVerified || false,
          });
        } else {
          setSeller({ name: 'Vendeur', isVerified: false });
        }
      } catch (err) {
        console.error('Error fetching seller:', err);
        setSeller({ name: 'Vendeur', isVerified: false });
      } finally {
        setSellerLoading(false);
      }
    };

    if (part) {
      fetchSeller();
    }
  }, [part, firestore]);

  // Check if part is in favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !partId || !firestore) return;

      try {
        const favDocRef = doc(firestore, 'favorites', user.uid);
        const favSnap = await getDoc(favDocRef);
        
        if (favSnap.exists()) {
          const favorites = favSnap.data().partIds || [];
          setIsFavorite(favorites.includes(partId));
        }
      } catch (err) {
        console.error('Error checking favorite:', err);
      }
    };

    checkFavorite();
  }, [user, partId, firestore]);

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
            partIds: arrayRemove(partId),
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
          // Ensure partIds array exists
          const currentPartIds = currentData.partIds || [];
          await updateDoc(favDocRef, {
            partIds: arrayUnion(partId),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(favDocRef, {
            userId: user.uid,
            partIds: [partId],
            vehicleIds: [],
            rentalIds: [],
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

  const handleContactSeller = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Connectez-vous pour contacter le vendeur',
      });
      router.push('/login');
      return;
    }

    if (part?.userId === user.uid) {
      toast({
        variant: 'destructive',
        title: 'Action impossible',
        description: 'Vous ne pouvez pas vous contacter vous-même',
      });
      return;
    }

    const message = encodeURIComponent(`Bonjour, je suis intéressé par votre pièce "${part?.title || part?.name}" à $${part?.price?.toLocaleString()}.`);
    router.push(`/messages?sellerId=${part?.userId}&partId=${partId}&message=${message}`);
  };

  const handleBuy = () => {
    setShowBuyDialog(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: part?.title || part?.name || 'Pièce détachée',
      text: `${part?.title || part?.name} - $${part?.price?.toLocaleString()} sur Zua-Car`,
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

  if (error || !part) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-muted">
        <p className="text-muted-foreground">Pièce non trouvée.</p>
        <Button onClick={() => router.back()} className="mt-4">Retour</Button>
      </div>
    );
  }

  const partImages = part.imageUrls || (part.imageUrl ? [part.imageUrl] : []);
  const placeholderImage = PlaceHolderImages.find(p => p.id === 'part-oil-filter');

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background/80 backdrop-blur-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold truncate flex-1 mx-4 text-center">
          {part.title || part.name}
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
            {partImages.length > 0 ? (
              partImages.map((imgUrl, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-[35vh]">
                    <Image
                      src={imgUrl}
                      alt={`${part.title || part.name} - Image ${index + 1}`}
                      fill
                      className="object-contain p-4"
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
                    alt={part.title || part.name || 'Pièce'}
                    fill
                    className="object-contain p-4"
                    data-ai-hint={placeholderImage.imageHint}
                  />
                </div>
              </CarouselItem>
            ) : null}
          </CarouselContent>
          {partImages.length > 1 && (
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
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-bold">{part.title || part.name}</CardTitle>
                {part.condition && (
                  <span className={cn(
                    "text-xs px-3 py-1 rounded-full font-medium",
                    part.condition === 'Neuf' 
                      ? "bg-green-100 text-green-700" 
                      : "bg-blue-100 text-blue-700"
                  )}>
                    {part.condition}
                  </span>
                )}
              </div>
              <p className="text-3xl font-extrabold text-primary">${part.price?.toLocaleString()}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Catégorie :</span> {part.category}
              </p>
              {part.compatibility && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Compatible avec :</span> {part.compatibility}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {part.description || 'Aucune description disponible.'}
              </p>
            </CardContent>
          </Card>

          {/* Seller Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Vendeur</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              {sellerLoading ? (
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
                    {seller?.photoURL && <AvatarImage src={seller.photoURL} alt={seller.name} />}
                    <AvatarFallback>{getInitials(seller?.name || 'V')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold flex items-center gap-2">
                      {seller?.name} 
                      {seller?.isVerified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                    </p>
                    <p className="text-xs text-muted-foreground">Vendeur</p>
                  </div>
                </div>
              )}
              <Button variant="outline" size="icon" onClick={handleContactSeller}>
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
            onClick={handleContactSeller}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Contacter
          </Button>
          <Button size="lg" className="flex-1" onClick={handleBuy}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Acheter
          </Button>
        </div>
      </footer>

      {/* Buy Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Acheter cette pièce
            </DialogTitle>
            <DialogDescription>
              Pour acheter <strong>{part.title || part.name}</strong> à <strong>${part.price?.toLocaleString()}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Pour finaliser votre achat, veuillez contacter directement le vendeur. 
              Vous pourrez discuter des modalités de paiement et de livraison.
            </p>
            
            {seller && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {seller.photoURL && <AvatarImage src={seller.photoURL} />}
                    <AvatarFallback>{getInitials(seller.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{seller.name}</p>
                    <p className="text-xs text-muted-foreground">Vendeur</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBuyDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              setShowBuyDialog(false);
              handleContactSeller();
            }}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Contacter le vendeur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager cette pièce</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-wrap gap-3 py-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                window.open(`https://wa.me/?text=${encodeURIComponent(`${part.title || part.name} - $${part.price} sur Zua-Car: ${window.location.href}`)}`, '_blank');
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
