'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, Filter, Star, X, Loader2, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase/provider';
import { collection, query, orderBy } from 'firebase/firestore';
import { useVehicleRatings } from '@/hooks/use-vehicle-ratings';
import { useSellerNames } from '@/hooks/use-seller-names';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  title?: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  imageUrl?: string;
  imageUrls?: string[];
  imageId?: string;
  brand?: string;
  userId?: string;
}

export default function VehiclesPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
    const [yearRange, setYearRange] = useState<[number, number]>([1990, new Date().getFullYear() + 1]);
    
    const firestore = useFirestore();
    const vehiclesQuery = useMemoFirebase(
      () => firestore ? query(collection(firestore, 'vehicles'), orderBy('createdAt', 'desc')) : null,
      [firestore]
    );
    const { data: rawVehicles, isLoading, error } = useCollection<Vehicle>(vehiclesQuery);
    
    // Get unique brands from vehicles
    const availableBrands = useMemo(() => {
      const brands = new Set<string>();
      (rawVehicles || []).forEach(v => {
        const brand = v.make || v.brand;
        if (brand) brands.add(brand);
      });
      return Array.from(brands).sort();
    }, [rawVehicles]);

    // Get vehicle IDs for ratings
    const vehicleIds = useMemo(() => {
      return (rawVehicles || []).map(v => v.id);
    }, [rawVehicles]);
    
    // Get unique user IDs for fetching seller names
    const userIds = useMemo(() => {
      return (rawVehicles || []).map(v => v.userId).filter(Boolean) as string[];
    }, [rawVehicles]);
    
    // Fetch ratings for all vehicles
    const { ratings: vehicleRatings } = useVehicleRatings(firestore, vehicleIds);
    
    // Fetch seller names
    const { sellerNames } = useSellerNames(userIds);
    
    const vehicles = useMemo(() => {
        let filteredVehicles = rawVehicles ?? [];
        
        // Filter by brand
        if (selectedBrand) {
            filteredVehicles = filteredVehicles.filter(vehicle => {
              const brand = vehicle.make || vehicle.brand;
              return brand?.toLowerCase() === selectedBrand.toLowerCase();
            });
        }
        
        // Filter by search term
        if (searchTerm) {
            filteredVehicles = filteredVehicles.filter(vehicle =>
                vehicle.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filter by price range
        filteredVehicles = filteredVehicles.filter(vehicle => {
          if (!vehicle.price) return false;
          return vehicle.price >= priceRange[0] && vehicle.price <= priceRange[1];
        });
        
        // Filter by year range
        filteredVehicles = filteredVehicles.filter(vehicle => {
          if (!vehicle.year) return true;
          return vehicle.year >= yearRange[0] && vehicle.year <= yearRange[1];
        });
        
        return filteredVehicles;
    }, [rawVehicles, searchTerm, selectedBrand, priceRange, yearRange]);

    const hasActiveFilters = selectedBrand !== null || 
      priceRange[0] > 0 || priceRange[1] < 100000 || 
      yearRange[0] > 1990 || yearRange[1] < (new Date().getFullYear() + 1);

    const resetFilters = () => {
      setSelectedBrand(null);
      setPriceRange([0, 100000]);
      setYearRange([1990, new Date().getFullYear() + 1]);
      toast({
        title: 'Filtres réinitialisés',
        description: 'Tous les filtres ont été supprimés',
      });
    };

    const getBrandLogo = (brandName: string) => {
      const brandLower = brandName.toLowerCase();
      const logoMap: { [key: string]: string } = {
        'tesla': 'logo-tesla',
        'bmw': 'logo-bmw',
        'cadillac': 'logo-cadillac',
        'mazda': 'logo-mazda',
        'mercedes': 'logo-mercedes',
        'audi': 'logo-audi',
        'toyota': 'logo-toyota',
        'honda': 'logo-honda',
        'ford': 'logo-ford',
        'chevrolet': 'logo-chevrolet',
      };
      return logoMap[brandLower] || null;
    };

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background p-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <Link href="/home" passHref>
            <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
            </Button>
        </Link>
        <h1 className="text-xl font-bold">Véhicules à Vendre</h1>
      </header>
      
      <main className="p-4 space-y-4">
        {/* Search and Filter Bar */}
        <div className="sticky top-[73px] bg-muted z-10 py-2 -mx-4 px-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher une voiture..." 
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
                      "rounded-full h-12 w-12 bg-card shadow-sm relative",
                      hasActiveFilters && "border-primary"
                    )}
                  >
                <Filter className="h-5 w-5" />
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-background" />
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Filtrer les véhicules</DialogTitle>
                    <DialogDescription>
                      Affinez votre recherche en utilisant les filtres ci-dessous.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    {/* Price Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Prix: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                      </Label>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Min</Label>
                          <Input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="mt-1"
                            min={0}
                            max={priceRange[1]}
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Max</Label>
                          <Input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="mt-1"
                            min={priceRange[0]}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Year Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Année: {yearRange[0]} - {yearRange[1]}
                      </Label>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">De</Label>
                          <Input
                            type="number"
                            value={yearRange[0]}
                            onChange={(e) => setYearRange([Number(e.target.value), yearRange[1]])}
                            className="mt-1"
                            min={1990}
                            max={yearRange[1]}
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">À</Label>
                          <Input
                            type="number"
                            value={yearRange[1]}
                            onChange={(e) => setYearRange([yearRange[0], Number(e.target.value)])}
                            className="mt-1"
                            min={yearRange[0]}
                            max={new Date().getFullYear() + 1}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetFilters}
                      disabled={!hasActiveFilters}
                    >
                      Réinitialiser
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setIsFilterDialogOpen(false)}
                    >
                      Appliquer ({vehicles.length} résultat{vehicles.length > 1 ? 's' : ''})
              </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Active filters */}
            {(selectedBrand || searchTerm || hasActiveFilters) && (
              <div className="flex flex-wrap gap-2 items-center mt-3">
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-xs font-medium">
                    {selectedBrand}
                    <button onClick={() => setSelectedBrand(null)} className="hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-xs font-medium">
                    Recherche: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-xs font-medium">
                    ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                  </span>
                )}
                {(yearRange[0] > 1990 || yearRange[1] < (new Date().getFullYear() + 1)) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-xs font-medium">
                    {yearRange[0]} - {yearRange[1]}
                  </span>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-6">
                <h3 className="font-bold">Marques Populaires</h3>
                <Button 
                  variant={!selectedBrand ? 'default' : 'outline'} 
                  size="sm" 
                  className="rounded-full" 
                  onClick={() => setSelectedBrand(null)}
                >
                  Tout
                </Button>
            </div>
             <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 mt-4">
                {availableBrands.map(brand => {
                    const logoId = getBrandLogo(brand);
                    const brandLogo = logoId ? PlaceHolderImages.find(p => p.id === logoId) : null;
                    const isSelected = selectedBrand === brand;
                    
                    return (
                        <button 
                          key={brand} 
                          onClick={() => setSelectedBrand(isSelected ? null : brand)} 
                          className={cn(
                            "flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-w-[80px]",
                            isSelected 
                              ? 'bg-primary text-primary-foreground ring-2 ring-primary shadow-md' 
                              : 'bg-card hover:bg-card/80'
                          )}
                        >
                            {brandLogo ? (
                                <Image 
                                    src={brandLogo.imageUrl}
                                alt={`${brand} logo`}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-contain"
                                    data-ai-hint={brandLogo.imageHint}
                                />
                            ) : (
                              <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm",
                                isSelected ? "bg-primary-foreground/20" : "bg-muted"
                              )}>
                                {brand.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className={cn(
                              "text-xs font-medium text-center",
                              isSelected && "text-primary-foreground"
                            )}>
                              {brand}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Vehicle List */}
        <div className="space-y-4 pb-4">
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Chargement…</span>
            </div>
          )}
          {error && (
            <div className="text-center text-red-500 py-10">Erreur de chargement…</div>
          )}
          {!isLoading && !error && vehicles.length === 0 && (
            <div className="text-center py-16">
                <p className="text-muted-foreground mb-2">Aucun véhicule ne correspond à votre recherche.</p>
                <Button variant="outline" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
            </div>
          )}
          {vehicles.map((car) => {
              const vehicleRating = vehicleRatings[car.id] || { average: 0, count: 0 };
              const rating = vehicleRating.average || 0;
              
              return (
                <Link key={car.id} href={`/vehicles/${car.id}`} passHref>
                    <Card className="shadow-md cursor-pointer hover:shadow-lg transition-shadow border-none rounded-2xl">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="relative w-1/3 min-w-[120px]">
                          {(() => {
                            let url = car.imageUrl;
                            if (!url && Array.isArray(car.imageUrls) && car.imageUrls.length > 0) url = car.imageUrls[0];
                            if (url) {
                              return (
                                <Image src={url} alt={car.model || car.title || 'Véhicule'} width={120} height={90} className="rounded-lg w-full aspect-[4/3] object-cover" />
                              );
                            } else if (car.imageId) {
                              const carImage = PlaceHolderImages.find(p => p.id === car.imageId);
                              if (carImage) {
                                return (
                                  <Image src={carImage.imageUrl} alt={car.model || car.title || 'Véhicule'} width={120} height={90} className="rounded-lg w-full aspect-[4/3] object-cover" data-ai-hint={carImage.imageHint} />
                                );
                              }
                            }
                            const placeholderImage = PlaceHolderImages.find(p => p.id === 'car-tesla-model-3');
                            return placeholderImage ? (
                              <Image src={placeholderImage.imageUrl} alt={car.model || car.title || 'Véhicule'} width={120} height={90} className="rounded-lg w-full aspect-[4/3] object-cover" data-ai-hint={placeholderImage.imageHint} />
                            ) : (
                              <div className="flex items-center justify-center w-full aspect-[4/3] bg-muted rounded-lg text-xs text-muted-foreground">Aucune image</div>
                            );
                          })()}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-bold text-lg truncate">{car.title || car.model || 'Véhicule'}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {car.make || car.brand} {car.model} {car.year && `- ${car.year}`}
                          </p>
                          
                          {/* Seller name */}
                          {car.userId && sellerNames[car.userId] && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground truncate">
                                {sellerNames[car.userId].name}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-primary font-semibold text-lg">${car.price?.toLocaleString() || '0'}</p>
                            {vehicleRating.count > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="text-xs font-medium text-muted-foreground">{rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                </Link>
              );
            })}
        </div>
      </main>
    </div>
  );
}
