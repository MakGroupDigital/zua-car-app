
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, Filter, Star, Calendar, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';

const rentalVehicles = [
  { id: 'rental-yaris', model: 'Toyota Yaris', price: '30/jour', rating: 4.8, seats: 5, imageId: 'car-tesla-model-3' },
  { id: 'rental-rav4', model: 'Toyota RAV4', price: '50/jour', rating: 4.9, seats: 5, imageId: 'car-cadillac-escalade' },
  { id: 'rental-hiace', model: 'Toyota Hiace', price: '70/jour', rating: 4.7, seats: 12, imageId: 'car-tesla-model-x' },
  { id: 'rental-corolla', model: 'Toyota Corolla', price: '35/jour', rating: 4.6, seats: 5, imageId: 'car-bmw-series-3' },
];

export default function VehicleRentalPage() {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredVehicles = useMemo(() => {
        if (!searchTerm) {
            return rentalVehicles;
        }
        return rentalVehicles.filter(vehicle =>
            vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background p-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <Link href="/home" passHref>
            <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
            </Button>
        </Link>
        <h1 className="text-xl font-bold">Véhicules de Location</h1>
      </header>
      
      <main className="p-4 space-y-4">
        {/* Search and Filter Bar */}
        <div className="sticky top-[73px] bg-muted z-10 py-2">
            <div className="flex items-center gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher un véhicule..." 
                  className="pl-12 rounded-full h-12 bg-card border-none focus-visible:ring-primary shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="icon" variant="outline" className="rounded-full h-12 w-12 bg-card shadow-sm">
                <Filter className="h-5 w-5" />
              </Button>
            </div>
        </div>

        {/* Vehicle List */}
        <div className="space-y-4 pb-4">
          {filteredVehicles.map((vehicle) => {
              const vehicleImage = PlaceHolderImages.find(p => p.id === vehicle.imageId);
              return (
                <Link key={vehicle.id} href={`/vehicleRentalListings/${vehicle.id}`} passHref>
                    <Card className="overflow-hidden shadow-md border-none group">
                      <CardContent className="p-3 flex gap-4 items-center">
                        <div className="relative w-1/3">
                          {vehicleImage && (
                            <Image
                              src={vehicleImage.imageUrl}
                              alt={vehicle.model}
                              width={120}
                              height={90}
                              className="rounded-lg w-full aspect-[4/3] object-cover"
                              data-ai-hint={vehicleImage.imageHint}
                            />
                          )}
                        </div>
                        <div className="flex-grow w-2/3">
                          <h3 className="font-bold text-lg truncate">{vehicle.model}</h3>
                          <div className="flex items-center gap-1 text-sm mt-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold">{vehicle.rating}</span>
                              <span className="text-muted-foreground">(15 avis)</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-2 text-muted-foreground">
                            <Users className="h-4 w-4"/>
                            <span>{vehicle.seats} places</span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                             <p className="font-extrabold text-lg text-primary">${vehicle.price}</p>
                             <Button size="sm" className="bg-primary/90">Louer</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                </Link>
              );
            })}
        </div>
        {filteredVehicles.length === 0 && (
            <div className="text-center py-16">
                <p className="text-muted-foreground">Aucun véhicule ne correspond à votre recherche.</p>
            </div>
        )}
      </main>
    </div>
  );
}
