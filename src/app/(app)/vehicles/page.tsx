
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, Filter, Star, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection } from 'firebase/firestore'

const brands = [
    { name: 'Tesla', logoId: 'logo-tesla' },
    { name: 'BMW', logoId: 'logo-bmw' },
    { name: 'Cadillac', logoId: 'logo-cadillac' },
    { name: 'Mazda', logoId: 'logo-mazda' },
];


export default function VehiclesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    
    const firestore = useFirestore();
    const vehiclesCollectionRef = useMemoFirebase(
      () => firestore ? collection(firestore, 'vehicles') : null,
      [firestore]
    );
    const { data: rawVehicles, isLoading, error } = useCollection<any>(vehiclesCollectionRef);
    
    const vehicles = useMemo(() => {
        let filteredVehicles = rawVehicles ?? [];
        if (selectedBrand) {
            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.brand === selectedBrand);
        }
        if (searchTerm) {
            filteredVehicles = filteredVehicles.filter(vehicle =>
                vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filteredVehicles;
    }, [rawVehicles, searchTerm, selectedBrand]);


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
        <div className="sticky top-[73px] bg-muted z-10 py-2">
            <div className="flex items-center gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher une voiture..." 
                  className="pl-12 rounded-full h-12 bg-card border-none focus-visible:ring-primary shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="icon" variant="outline" className="rounded-full h-12 w-12 bg-card shadow-sm">
                <Filter className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex justify-between items-center mt-6">
                <h3 className="font-bold">Marques Populaires</h3>
                <Button variant={!selectedBrand ? 'default' : 'outline'} size="sm" className="rounded-full" onClick={() => setSelectedBrand(null)}>Tout</Button>
            </div>
             <div className="grid grid-cols-4 gap-4 mt-4 text-center">
                {brands.map(brand => {
                    const brandLogo = PlaceHolderImages.find(p => p.id === brand.logoId);
                    return (
                        <button key={brand.name} onClick={() => setSelectedBrand(brand.name)} className={`p-3 rounded-xl transition-all ${selectedBrand === brand.name ? 'bg-primary/20 ring-2 ring-primary' : 'bg-card'}`}>
                            {brandLogo && (
                                <Image 
                                    src={brandLogo.imageUrl}
                                    alt={`${brand.name} logo`}
                                    width={64}
                                    height={64}
                                    className="w-full h-10 object-contain"
                                    data-ai-hint={brandLogo.imageHint}
                                />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-2 gap-4 pb-4">
          {isLoading && (
            <div className="col-span-2 text-center py-10">Chargement…</div>
          )}
          {error && (
            <div className="col-span-2 text-center text-red-500 py-10">Erreur de chargement…</div>
          )}
          {vehicles.map((car) => {
              return (
                <Link key={car.id} href={`/vehicles/${car.id}`} passHref>
                    <Card className="rounded-2xl overflow-hidden group shadow-md border-none h-full">
                      <CardContent className="p-3 flex flex-col h-full">
                        <div className="relative">
                          <Button variant="ghost" size="icon" className="absolute top-2 left-2 h-7 w-7 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-red-500 z-10">
                            <Heart className="h-4 w-4" />
                          </Button>
                          {(() => {
                            let url = car.imageUrl;
                            if (!url && Array.isArray(car.imageUrls) && car.imageUrls.length > 0) url = car.imageUrls[0];
                            if (url) {
                              return (
                                <Image src={url} alt={car.model} width={300} height={200} className="rounded-lg w-full aspect-[4/3] object-cover" />
                              );
                            } else if (car.imageId) {
                              const carImage = PlaceHolderImages.find(p => p.id === car.imageId);
                              if (carImage) {
                                return (
                                  <Image src={carImage.imageUrl} alt={car.model} width={300} height={200} className="rounded-lg w-full aspect-[4/3] object-cover" data-ai-hint={carImage.imageHint} />
                                );
                              }
                            }
                            return (
                              <div className="flex items-center justify-center w-full h-[150px] bg-muted text-xs text-muted-foreground">Aucune image</div>
                            );
                          })()}
                        </div>
                        <div className="pt-3 flex flex-col flex-grow">
                          <h3 className="font-bold text-md truncate">{car.model}</h3>
                          <div className="flex-grow" />
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
                </Link>
              );
            })}
        </div>
        {vehicles.length === 0 && (
            <div className="text-center py-16">
                <p className="text-muted-foreground">Aucun véhicule ne correspond à votre recherche.</p>
            </div>
        )}
      </main>
    </div>
  );
}
