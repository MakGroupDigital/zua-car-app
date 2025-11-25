

'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Bell, Heart, Home, Search, Settings, SlidersHorizontal, Star, MessageCircle, HeartPulse, MapPin, ShoppingCart, Tag, Wrench, KeyRound, ShieldCheck, School, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, collection, query, orderBy, limit, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';


const services = [
  { name: 'Achat', icon: ShoppingCart, href: '/vehicles', color: 'bg-blue-100 dark:bg-blue-900/50', textColor: 'text-blue-600 dark:text-blue-300' },
  { name: 'Vente', icon: Tag, href: '/dashboard/vente', color: 'bg-green-100 dark:bg-green-900/50', textColor: 'text-green-600 dark:text-green-300' },
  { name: 'Pièces', icon: Wrench, href: '/parts', color: 'bg-yellow-100 dark:bg-yellow-900/50', textColor: 'text-yellow-600 dark:text-yellow-300' },
  { name: 'Location', icon: KeyRound, href: '/vehicleRentalListings', color: 'bg-purple-100 dark:bg-purple-900/50', textColor: 'text-purple-600 dark:text-purple-300' },
  { name: 'Assurance', icon: ShieldCheck, href: '/insuranceProviders', color: 'bg-red-100 dark:bg-red-900/50', textColor: 'text-red-600 dark:text-red-300' },
  { name: 'Auto-école', icon: School, href: '/drivingSchools', color: 'bg-indigo-100 dark:bg-indigo-900/50', textColor: 'text-indigo-600 dark:text-indigo-300' },
];

interface Vehicle {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  imageUrls?: string[];
  imageUrl?: string;
  status?: string;
}


export default function HomePage() {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'avatar-1');
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const logoImage = PlaceHolderImages.find(p => p.id === 'app-logo');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch popular vehicles from Firebase
  const vehiclesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'vehicles'),
      orderBy('createdAt', 'desc'),
      limit(6)
    );
  }, [firestore]);

  const { data: vehicles, isLoading: isVehiclesLoading } = useCollection<Vehicle>(vehiclesQuery);

  // Fetch user's favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !firestore) return;

      try {
        const favDocRef = doc(firestore, 'favorites', user.uid);
        const favSnap = await getDoc(favDocRef);
        
        if (favSnap.exists()) {
          setFavoriteIds(favSnap.data().vehicleIds || []);
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };

    fetchFavorites();
  }, [user, firestore]);

  // Toggle favorite
  const toggleFavorite = async (vehicleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour ajouter aux favoris',
      });
      return;
    }

    if (!firestore) return;

    setTogglingFavorite(vehicleId);
    const isFavorite = favoriteIds.includes(vehicleId);

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
        setFavoriteIds(prev => prev.filter(id => id !== vehicleId));
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
          await setDoc(favDocRef, {
            userId: user.uid,
            vehicleIds: [vehicleId],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        setFavoriteIds(prev => [...prev, vehicleId]);
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
      setTogglingFavorite(null);
    }
  };

  const filteredCars = useMemo(() => {
    const vehicleList = vehicles || [];
    if (!searchTerm) {
      return vehicleList;
    }
    return vehicleList.filter(vehicle =>
      vehicle.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);


  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    }
    if (firstName) {
        return firstName.substring(0, 2);
    }
    return 'ZU';
  };
  
  if (isUserLoading || isProfileLoading) {
    return (
      <div className={cn(
        "flex h-screen flex-col items-center justify-center bg-background text-foreground",
      )}>
        <div className="flex flex-col items-center gap-8">
          {logoImage && (
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg animate-pulse">
              <Image
                src={logoImage.imageUrl}
                alt={logoImage.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={logoImage.imageHint}
              />
            </div>
          )}
          <div className="flex items-center gap-4 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-lg font-semibold">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  const userDisplayName = userProfile?.firstName ? `${userProfile.firstName}` : 'Utilisateur';
  const userInitials = getInitials(userProfile?.firstName, userProfile?.lastName);

  const handleActivateNotifications = () => {
    console.log("Activation des notifications...");
    // Ici, vous ajouteriez la logique pour demander la permission de notification au navigateur
    toast({
      title: "Notifications activées !",
      description: "Vous recevrez désormais des alertes importantes.",
    });
    setIsNotificationDialogOpen(false);
  };

  return (
    <div className="bg-muted min-h-screen font-body text-foreground">
      {/* Top User Info Bar */}
      <header className="p-4 pb-0">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
                 <MapPin className="h-5 w-5 text-muted-foreground" />
                 <span className="font-medium text-sm">Kinshasa, RDC</span>
           </div>
           <div className="flex items-center gap-3">
            <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-card shadow">
                  <Bell className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Activer les notifications</DialogTitle>
                  <DialogDescription>
                    Recevez des alertes sur les nouveaux messages, les offres et les mises à jour importantes de votre compte.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setIsNotificationDialogOpen(false)}>Plus tard</Button>
                  <Button type="button" onClick={handleActivateNotifications}>Activer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
              <Link href="/profile">
                <Avatar className="h-10 w-10 border-2 border-primary/50">
                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint}/>}
                    <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Link>
            
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
         {/* Welcome Header */}
        <div>
            <p className="text-muted-foreground">Bienvenue 👋</p>
            <p className="font-bold text-2xl tracking-tight">Salut, {userDisplayName}!</p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Rechercher une voiture..." 
              className="pl-12 rounded-full h-14 bg-card border-none focus-visible:ring-primary shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button size="icon" className="rounded-full h-14 w-14 bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <SlidersHorizontal className="h-6 w-6" />
          </Button>
        </div>

        {/* Services */}
        <div>
            <h2 className="text-xl font-bold font-headline mb-4">Nos Services</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <Link href={service.href} key={service.name} className="flex flex-col items-center gap-2">
                    <div className={`flex items-center justify-center w-20 h-20 rounded-2xl ${service.color}`}>
                       <Icon className={`h-9 w-9 ${service.textColor}`} />
                    </div>
                    <span className="text-xs font-medium pt-1">{service.name}</span>
                  </Link>
                );
              })}
            </div>
        </div>


        {/* Popular Cars */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold font-headline">Voitures Populaires</h2>
            <Link href="/vehicles" className="text-sm font-medium text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          
          {isVehiclesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Chargement des véhicules...</span>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucun véhicule disponible pour le moment.</p>
              <Link href="/dashboard/vente/nouveau" className="text-primary hover:underline mt-2 inline-block">
                Soyez le premier à publier une annonce !
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredCars.map((vehicle) => {
                const vehicleImageUrl = vehicle.imageUrls?.[0] || vehicle.imageUrl;
                const placeholderImage = PlaceHolderImages.find(p => p.id === 'car-tesla-model-3');
                const isFavorite = favoriteIds.includes(vehicle.id);
                const isToggling = togglingFavorite === vehicle.id;
                
                return (
                  <Link href={`/vehicles/${vehicle.id}`} key={vehicle.id}>
                    <Card className="rounded-2xl overflow-hidden group shadow-md border-none hover:shadow-lg transition-shadow">
                      <CardContent className="p-3">
                        <div className="relative">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "absolute top-2 left-2 h-7 w-7 rounded-full z-10 transition-all",
                              isFavorite 
                                ? "bg-red-500/80 text-white hover:bg-red-600" 
                                : "bg-black/30 text-white hover:bg-black/50 hover:text-red-500"
                            )}
                            onClick={(e) => toggleFavorite(vehicle.id, e)}
                            disabled={isToggling}
                          >
                            {isToggling ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Heart className={cn(
                                "h-4 w-4 transition-all",
                                isFavorite && "fill-white"
                              )} />
                            )}
                          </Button>
                          {vehicleImageUrl ? (
                            <Image
                              src={vehicleImageUrl}
                              alt={vehicle.title || `${vehicle.make} ${vehicle.model}`}
                              width={300}
                              height={200}
                              className="rounded-lg w-full aspect-[4/3] object-cover"
                            />
                          ) : placeholderImage ? (
                            <Image
                              src={placeholderImage.imageUrl}
                              alt={vehicle.title || `${vehicle.make} ${vehicle.model}`}
                              width={300}
                              height={200}
                              className="rounded-lg w-full aspect-[4/3] object-cover"
                              data-ai-hint={placeholderImage.imageHint}
                            />
                          ) : (
                            <div className="w-full aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="pt-3">
                          <h3 className="font-bold text-md truncate">
                            {vehicle.title || `${vehicle.make} ${vehicle.model}`}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {vehicle.make} {vehicle.model} - {vehicle.year}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="font-bold text-sm text-primary">
                              ${vehicle.price?.toLocaleString()}
                            </p>
                            {vehicle.status === 'active' && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                Disponible
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
