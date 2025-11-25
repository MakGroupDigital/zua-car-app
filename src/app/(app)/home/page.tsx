'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Bell, Heart, Home, Search, Settings, SlidersHorizontal, Star, MessageCircle, HeartPulse, MapPin, ShoppingCart, Tag, Wrench, KeyRound, ShieldCheck, School, Loader2, X, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, collection, query, orderBy, limit, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove, where, onSnapshot } from 'firebase/firestore';
import { useVehicleRatings } from '@/hooks/use-vehicle-ratings';
import { useLocation } from '@/hooks/use-location';
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
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';


const services = [
  { name: 'Achat', icon: ShoppingCart, href: '/vehicles', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-100 dark:bg-blue-900/50', textColor: 'text-blue-600 dark:text-blue-300' },
  { name: 'Vente', icon: Tag, href: '/dashboard/vente', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-100 dark:bg-green-900/50', textColor: 'text-green-600 dark:text-green-300' },
  { name: 'Pièces', icon: Wrench, href: '/parts', color: 'from-yellow-500 to-amber-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50', textColor: 'text-yellow-600 dark:text-yellow-300' },
  { name: 'Location', icon: KeyRound, href: '/vehicleRentalListings', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-100 dark:bg-purple-900/50', textColor: 'text-purple-600 dark:text-purple-300' },
  { name: 'Assurance', icon: ShieldCheck, href: '/insuranceProviders', color: 'from-red-500 to-rose-500', bgColor: 'bg-red-100 dark:bg-red-900/50', textColor: 'text-red-600 dark:text-red-300' },
  { name: 'Auto-école', icon: School, href: '/drivingSchools', color: 'from-indigo-500 to-violet-500', bgColor: 'bg-indigo-100 dark:bg-indigo-900/50', textColor: 'text-indigo-600 dark:text-indigo-300' },
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
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const logoImage = PlaceHolderImages.find(p => p.id === 'app-logo');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { toast } = useToast();
  const { location, currentTime, isLoading: isLocationLoading, error: locationError, permissionStatus, requestLocation } = useLocation();
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2010, 2024]);
  const [selectedMake, setSelectedMake] = useState<string>('');

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
  
  // Get vehicle IDs for ratings
  const vehicleIds = useMemo(() => {
    return (vehicles || []).map(v => v.id);
  }, [vehicles]);
  
  // Fetch ratings for all vehicles
  const { ratings: vehicleRatings } = useVehicleRatings(firestore, vehicleIds);

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

  // Listen to unread notifications count
  useEffect(() => {
    if (!user || !firestore) return;

    const notificationsRef = collection(firestore, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadNotifications(snapshot.size);
    }, (error) => {
      console.error('Error fetching unread notifications:', error);
    });

    return () => unsubscribe();
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
    let vehicleList = vehicles || [];
    
    // Filter by search term
    if (searchTerm) {
      vehicleList = vehicleList.filter(vehicle =>
        vehicle.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by price range
    vehicleList = vehicleList.filter(vehicle => 
      vehicle.price >= priceRange[0] && vehicle.price <= priceRange[1]
    );
    
    // Filter by year range
    vehicleList = vehicleList.filter(vehicle => 
      vehicle.year >= yearRange[0] && vehicle.year <= yearRange[1]
    );
    
    // Filter by make
    if (selectedMake) {
      vehicleList = vehicleList.filter(vehicle =>
        vehicle.make?.toLowerCase() === selectedMake.toLowerCase()
      );
    }
    
    return vehicleList;
  }, [vehicles, searchTerm, priceRange, yearRange, selectedMake]);
  
  // Get unique makes from vehicles
  const availableMakes = useMemo(() => {
    const makes = new Set<string>();
    (vehicles || []).forEach(v => {
      if (v.make) makes.add(v.make);
    });
    return Array.from(makes).sort();
  }, [vehicles]);
  
  // Check if any filter is active
  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 100000 || 
    yearRange[0] > 2010 || yearRange[1] < 2024 || selectedMake !== '';
  
  // Reset all filters
  const resetFilters = () => {
    setPriceRange([0, 100000]);
    setYearRange([2010, 2024]);
    setSelectedMake('');
    toast({
      title: 'Filtres réinitialisés',
      description: 'Tous les filtres ont été supprimés',
    });
  };


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
        "flex h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 text-foreground",
      )}>
        <div className="flex flex-col items-center gap-8">
          {logoImage && (
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl animate-pulse">
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
  
  // Get user photo URL from Firestore profile or Firebase Auth
  const userPhotoURL = userProfile?.photoURL || user?.photoURL;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background font-body text-foreground relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      {/* Top User Info Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/40 shadow-sm">
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (permissionStatus === 'denied' || permissionStatus === 'prompt') {
                  if (permissionStatus === 'denied') {
                    toast({
                      variant: 'destructive',
                      title: 'Localisation refusée',
                      description: 'Veuillez autoriser l\'accès à votre localisation dans les paramètres de votre navigateur',
                    });
                  } else {
                    toast({
                      title: 'Demande de localisation',
                      description: 'Veuillez autoriser l\'accès à votre localisation',
                    });
                  }
                  requestLocation();
                }
              }}
              className={cn(
                "flex items-center gap-2 group transition-all duration-300",
                (permissionStatus === 'denied' || permissionStatus === 'prompt') && "cursor-pointer hover:opacity-80",
                isLocationLoading && "opacity-70 cursor-wait"
              )}
              disabled={isLocationLoading}
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                {isLocationLoading ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                ) : (
                  <MapPin className={cn(
                    "h-4 w-4",
                    permissionStatus === 'granted' && location 
                      ? "text-primary animate-pulse" 
                      : "text-muted-foreground"
                  )} style={{ animationDuration: '2s' }} />
                )}
              </div>
              <div className="flex flex-col items-start min-w-0">
                {permissionStatus === 'granted' && location ? (
                  <>
                    <span className="font-medium text-sm bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate max-w-[150px]">
                      {location.city}, {location.country}
                    </span>
                    {currentTime && (
                      <span className="text-xs text-muted-foreground">
                        {currentTime}
                      </span>
                    )}
                  </>
                ) : permissionStatus === 'denied' ? (
                  <span className="font-medium text-sm text-muted-foreground">
                    Partager votre localisation
                  </span>
                ) : (
                  <span className="font-medium text-sm text-muted-foreground">
                    {isLocationLoading ? 'Chargement...' : 'Partager votre localisation'}
                  </span>
                )}
              </div>
            </button>
            <div className="flex items-center gap-3">
              <Link href="/notifications" className="relative group">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-gradient-to-br from-card to-card/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-border/50"
                >
                  <Bell className="h-5 w-5 group-hover:animate-bounce" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Button>
              </Link>
              
              <Link href="/profile" className="group">
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-primary/50 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 ring-2 ring-primary/20 group-hover:ring-primary/40">
                    {userPhotoURL && <AvatarImage src={userPhotoURL} alt="Photo de profil" />}
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6 pb-20">
        {/* Search Bar */}
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="relative flex-grow group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300 z-10" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-12 pr-4 rounded-full h-12 bg-card border border-border/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Shopping Cart Button */}
          <Link href="/vehicles">
            <Button 
              size="icon" 
              className="rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Categories Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-lg font-bold relative">
              Catégories
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isActive = index === 0; // First category is active by default
              return (
                <Link 
                  href={service.href} 
                  key={service.name}
                  className="flex-shrink-0"
                >
                  <div className={cn(
                    "flex flex-col items-center gap-2 w-20",
                    "transition-all duration-300"
                  )}>
                    <div className={cn(
                      "flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 border-2",
                      isActive 
                        ? "bg-primary border-primary/50 shadow-md" 
                        : "bg-muted border-border"
                    )}>
                      <Icon className={cn(
                        "h-7 w-7 transition-colors duration-300",
                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                      )} />
                    </div>
                    <span className={cn(
                      "text-xs font-medium text-center transition-colors duration-300",
                      isActive ? "text-primary font-semibold" : "text-muted-foreground"
                    )}>
                      {service.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Popular Cars Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Voitures Populaires</h2>
            <Link 
              href="/vehicles" 
              className="text-sm font-medium text-primary hover:underline"
            >
              Voir tout
            </Link>
          </div>
          
          {isVehiclesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-muted-foreground">Chargement des véhicules...</span>
              </div>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-12 bg-card/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-border">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-2">Aucun véhicule disponible pour le moment.</p>
              <Link href="/dashboard/vente/nouveau" className="text-primary hover:underline font-medium inline-flex items-center gap-1 group">
                Soyez le premier à publier une annonce !
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {filteredCars.map((vehicle, index) => {
                const vehicleImageUrl = vehicle.imageUrls?.[0] || vehicle.imageUrl;
                const placeholderImage = PlaceHolderImages.find(p => p.id === 'car-tesla-model-3');
                const isFavorite = favoriteIds.includes(vehicle.id);
                const isToggling = togglingFavorite === vehicle.id;
                const vehicleRating = vehicleRatings[vehicle.id] || { average: 0, count: 0 };
                const rating = vehicleRating.average || 0;
                
                return (
                  <Link 
                    href={`/vehicles/${vehicle.id}`} 
                    key={vehicle.id}
                    className="flex-shrink-0 w-[280px] group"
                  >
                    <Card className="rounded-2xl overflow-hidden shadow-md border border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card">
                      <CardContent className="p-0">
                        <div className="relative">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "absolute top-3 right-3 h-8 w-8 rounded-full z-20 transition-all duration-300",
                              isFavorite 
                                ? "bg-red-500/90 text-white hover:bg-red-600" 
                                : "bg-white/80 backdrop-blur-sm text-muted-foreground hover:bg-white hover:text-red-500"
                            )}
                            onClick={(e) => toggleFavorite(vehicle.id, e)}
                            disabled={isToggling}
                          >
                            {isToggling ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Heart className={cn(
                                "h-4 w-4 transition-all duration-300",
                                isFavorite && "fill-current"
                              )} />
                            )}
                          </Button>
                          
                          {vehicleImageUrl ? (
                            <div className="relative w-full h-[180px] overflow-hidden bg-muted">
                              <Image
                                src={vehicleImageUrl}
                                alt={vehicle.title || `${vehicle.make} ${vehicle.model}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : placeholderImage ? (
                            <div className="relative w-full h-[180px] overflow-hidden bg-muted">
                              <Image
                                src={placeholderImage.imageUrl}
                                alt={vehicle.title || `${vehicle.make} ${vehicle.model}`}
                                fill
                                className="object-cover"
                                data-ai-hint={placeholderImage.imageHint}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-[180px] bg-muted flex items-center justify-center">
                              <ShoppingCart className="h-12 w-12 text-muted-foreground opacity-50" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-lg text-primary mb-1">
                                ${vehicle.price?.toLocaleString()}
                              </p>
                              <h3 className="font-semibold text-base truncate">
                                {vehicle.title || `${vehicle.make} ${vehicle.model}`}
                              </h3>
                            </div>
                          </div>
                          {vehicleRating.count > 0 && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-4 w-4",
                                    i < Math.floor(rating)
                                      ? "fill-primary text-primary"
                                      : i < rating
                                      ? "fill-primary/50 text-primary/50"
                                      : "fill-none text-muted-foreground"
                                  )}
                                />
                              ))}
                              <span className="text-sm text-muted-foreground ml-1">
                                {rating.toFixed(1)}
                              </span>
                            </div>
                          )}
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
