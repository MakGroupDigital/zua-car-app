

'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Bell, Heart, Home, Search, Settings, SlidersHorizontal, Star, MessageCircle, HeartPulse, MapPin, ShoppingCart, Tag, Wrench, KeyRound, ShieldCheck, School, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
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

const popularCars = [
  { model: 'Tesla Model 3', price: '25,180', rating: 4.5, imageId: 'car-tesla-model-3' },
  { model: 'Tesla Model X', price: '28,180', rating: 4.8, imageId: 'car-tesla-model-x' },
  { model: 'BMW Series 3', price: '32,500', rating: 4.7, imageId: 'car-bmw-series-3' },
  { model: 'Cadillac Escalade', price: '55,000', rating: 4.9, imageId: 'car-cadillac-escalade' },
];


export default function HomePage() {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'avatar-1');
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const logoImage = PlaceHolderImages.find(p => p.id === 'app-logo');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredCars = useMemo(() => {
    if (!searchTerm) {
      return popularCars;
    }
    return popularCars.filter(car =>
      car.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);


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
          <div className="grid grid-cols-2 gap-4">
            {filteredCars.map((car) => {
              const carImage = PlaceHolderImages.find(p => p.id === car.imageId);
              return (
                <Card key={car.model} className="rounded-2xl overflow-hidden group shadow-md border-none">
                  <CardContent className="p-3">
                    <div className="relative">
                      <Button variant="ghost" size="icon" className="absolute top-2 left-2 h-7 w-7 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-red-500">
                        <Heart className="h-4 w-4" />
                      </Button>
                      {carImage && (
                        <Image
                          src={carImage.imageUrl}
                          alt={car.model}
                          width={300}
                          height={200}
                          className="rounded-lg w-full aspect-[4/3] object-cover"
                          data-ai-hint={carImage.imageHint}
                        />
                      )}
                    </div>
                    <div className="pt-3">
                      <h3 className="font-bold text-md truncate">{car.model}</h3>
                      <div className="flex items-center justify-between mt-2">
                         <p className="font-bold text-sm text-primary">${car.price}</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{car.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
