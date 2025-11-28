'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, Filter, Star, Calendar, Users, Loader2, Plus, X, Car, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useSellerNames } from '@/hooks/use-seller-names';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

export default function VehicleRentalPage() {
  const { user } = useUser();
  const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [seatsFilter, setSeatsFilter] = useState<number>(0);

  // Fetch rentals from Firebase
  const rentalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'rentals'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }, [firestore]);

  const { data: rentalsData, isLoading, error } = useCollection<Rental>(rentalsQuery);

  // Get unique user IDs for fetching seller names
  const userIds = useMemo(() => {
    return (rentalsData || []).map(rental => rental.userId).filter(Boolean) as string[];
  }, [rentalsData]);

  // Fetch seller names
  const { sellerNames } = useSellerNames(userIds);
    
    const filteredVehicles = useMemo(() => {
    let filtered = rentalsData || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(rental =>
        (rental.title || `${rental.make} ${rental.model}` || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rental.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rental.location || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Filter by price range
    filtered = filtered.filter(rental => 
      rental.pricePerDay >= priceRange[0] && rental.pricePerDay <= priceRange[1]
    );

    // Filter by seats
    if (seatsFilter > 0) {
      filtered = filtered.filter(rental => rental.seats && rental.seats >= seatsFilter);
    }

    return filtered;
  }, [rentalsData, searchTerm, priceRange, seatsFilter]);

  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 200 || seatsFilter > 0;

  const resetFilters = () => {
    setPriceRange([0, 200]);
    setSeatsFilter(0);
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background p-4 flex items-center justify-between gap-4 shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
        <Link href="/home" passHref>
            <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
            </Button>
        </Link>
        <h1 className="text-xl font-bold">Véhicules de Location</h1>
        </div>
        <Link href="/vehicleRentalListings/nouveau">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Louer
          </Button>
        </Link>
      </header>
      
      <main className="p-4 space-y-4">
        {/* Search and Filter Bar */}
        <div className="sticky top-[73px] bg-muted z-10 py-2">
            <div className="flex items-center gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher un véhicule..." 
                className="pl-12 pr-10 rounded-full h-12 bg-card border-none focus-visible:ring-primary shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
              </Button>
              )}
            </div>
            
            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className={cn(
                    "rounded-full h-12 w-12 shadow-sm",
                    hasActiveFilters && "bg-green-100 border-green-500 text-green-700"
                  )}
                >
                  <Filter className="h-5 w-5" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                      !
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filtrer les véhicules</DialogTitle>
                  <DialogDescription>
                    Affinez votre recherche
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label>Prix par jour: ${priceRange[0]} - ${priceRange[1]}</Label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Min</Label>
                        <Input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          min={0}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Max</Label>
                        <Input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Seats */}
                  <div className="space-y-3">
                    <Label>Nombre de places minimum</Label>
                    <select
                      value={seatsFilter}
                      onChange={(e) => setSeatsFilter(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="0">Tous</option>
                      <option value="2">2 places</option>
                      <option value="4">4 places</option>
                      <option value="5">5 places</option>
                      <option value="7">7 places</option>
                      <option value="9">9+ places</option>
                    </select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={resetFilters} disabled={!hasActiveFilters}>
                    Réinitialiser
                  </Button>
                  <Button onClick={() => setIsFilterDialogOpen(false)}>
                    Appliquer ({filteredVehicles.length})
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Chargement des véhicules...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 text-red-500">
            <p>Erreur lors du chargement des véhicules.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Aucun véhicule disponible</p>
            <Link href="/vehicleRentalListings/nouveau">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Louer un véhicule
              </Button>
            </Link>
          </div>
        )}

        {/* Vehicle List - Style Instagram */}
        {!isLoading && !error && filteredVehicles.length > 0 && (
        <div className="flex flex-col gap-6 pb-4">
            {filteredVehicles.map((rental) => {
              const rentalImages = rental.imageUrls || (rental.imageUrl ? [rental.imageUrl] : []);
              const placeholderImage = PlaceHolderImages.find(p => p.id === 'car-tesla-model-3');
              const displayTitle = rental.title || `${rental.make} ${rental.model}`;
              
              return (
                <Card key={rental.id} className="overflow-hidden shadow-lg border-2 border-primary/10 rounded-2xl bg-card">
                  {/* Header avec vendeur */}
                  <div className="p-4 flex items-center gap-3 border-b border-primary/10">
                    {rental.userId && sellerNames[rental.userId] && (
                      <>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                          {sellerNames[rental.userId].name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{sellerNames[rental.userId].name}</p>
                          {rental.location && (
                            <p className="text-xs text-muted-foreground">📍 {rental.location}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Carousel d'images - Scroll horizontal */}
                  <div className="relative">
                    {rentalImages.length > 0 ? (
                      <Carousel className="w-full">
                        <CarouselContent>
                          {rentalImages.map((imageUrl, index) => (
                            <CarouselItem key={index}>
                              <div className="relative w-full h-[400px] bg-muted">
                                <Image
                                  src={imageUrl}
                                  alt={`${displayTitle} - Image ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {rentalImages.length > 1 && (
                          <>
                            <CarouselPrevious className="left-2" />
                            <CarouselNext className="right-2" />
                          </>
                        )}
                      </Carousel>
                    ) : placeholderImage ? (
                      <div className="relative w-full h-[400px] bg-muted">
                        <Image
                          src={placeholderImage.imageUrl}
                          alt={displayTitle}
                          fill
                          className="object-cover"
                          data-ai-hint={placeholderImage.imageHint}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-[400px] bg-muted flex items-center justify-center">
                        <Car className="h-16 w-16 text-muted-foreground opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Contenu - Scroll vertical */}
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xl">{displayTitle}</h3>
                      <p className="font-extrabold text-xl text-primary">
                        ${rental.pricePerDay?.toLocaleString()}/jour
                      </p>
                    </div>
                    
                    {rental.seats && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4"/>
                        <span>{rental.seats} places</span>
                      </div>
                    )}

                    {rental.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {rental.description}
                      </p>
                    )}

                    <Link href={`/vehicleRentalListings/${rental.id}`}>
                      <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                        Voir les détails
                      </Button>
                    </Link>
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
