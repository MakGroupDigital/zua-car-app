
'use client';

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
import { ArrowLeft, Heart, Share2, Gauge, GitCommitHorizontal, Calendar, Palette, MessageSquare, BadgeCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useParams, useRouter } from 'next/navigation';


const vehiclesData = [
  { id: 'tesla-model-3', model: 'Tesla Model 3', price: '25,180', rating: 4.5, imageIds: ['car-tesla-model-3', 'car-tesla-model-x', 'car-bmw-series-3'], brand: 'Tesla', year: 2021, mileage: '25,000 km', transmission: 'Automatique', color: 'Blanc Perle' },
  { id: 'tesla-model-x', model: 'Tesla Model X', price: '28,180', rating: 4.8, imageIds: ['car-tesla-model-x', 'car-tesla-model-3', 'car-cadillac-escalade'], brand: 'Tesla', year: 2022, mileage: '15,000 km', transmission: 'Automatique', color: 'Noir Solide' },
  { id: 'bmw-series-3', model: 'BMW Series 3', price: '32,500', rating: 4.7, imageIds: ['car-bmw-series-3', 'car-tesla-model-x', 'car-cadillac-escalade'], brand: 'BMW', year: 2020, mileage: '45,000 km', transmission: 'Automatique', color: 'Bleu Portimao' },
  { id: 'cadillac-escalade', model: 'Cadillac Escalade', price: '55,000', rating: 4.9, imageIds: ['car-cadillac-escalade', 'car-tesla-model-3', 'car-bmw-series-3'], brand: 'Cadillac', year: 2023, mileage: '5,000 km', transmission: 'Automatique', color: 'Noir Onyx' },
  { id: 'toyota-prado', model: 'Toyota Prado', price: '45,000', rating: 4.6, imageIds: ['car-bmw-series-3', 'car-tesla-model-x', 'car-cadillac-escalade'], brand: 'Toyota', year: 2019, mileage: '60,000 km', transmission: 'Automatique', color: 'Gris Argent' },
  { id: 'mazda-cx-5', model: 'Mazda CX-5', price: '29,000', rating: 4.7, imageIds: ['car-tesla-model-x', 'car-bmw-series-3', 'car-cadillac-escalade'], brand: 'Mazda', year: 2021, mileage: '30,000 km', transmission: 'Automatique', color: 'Rouge Cristal' },
];

const seller = {
    name: 'Zua-Car Vendeur Pro',
    avatarId: 'avatar-1',
    isVerified: true
}

export default function VehicleDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const vehicleId = params.id as string;
    const vehicle = vehiclesData.find(v => v.id === vehicleId);
    const sellerAvatar = PlaceHolderImages.find(p => p.id === seller.avatarId);

    if (!vehicle) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-muted">
                <p>Véhicule non trouvé.</p>
                <Button onClick={() => router.back()} className="mt-4">Retour</Button>
            </div>
        )
    }

    const vehicleImages = vehicle.imageIds.map(id => PlaceHolderImages.find(p => p.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-muted">
        <header className="bg-transparent p-4 flex items-center justify-between absolute top-0 left-0 w-full z-10">
            <Button variant="ghost" size="icon" className="bg-background/50 backdrop-blur-sm rounded-full" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex gap-2">
                 <Button variant="ghost" size="icon" className="bg-background/50 backdrop-blur-sm rounded-full">
                    <Heart className="h-6 w-6" />
                </Button>
                 <Button variant="ghost" size="icon" className="bg-background/50 backdrop-blur-sm rounded-full">
                    <Share2 className="h-6 w-6" />
                </Button>
            </div>
        </header>

      <main className="pb-28">
        <Carousel className="w-full">
          <CarouselContent>
            {vehicleImages.map((img, index) => (
              img && (
                <CarouselItem key={index}>
                  <div className="relative w-full h-[40vh]">
                     <Image
                      src={img.imageUrl}
                      alt={`${vehicle.model} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      data-ai-hint={img.imageHint}
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
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground"><Gauge className="h-5 w-5 text-primary"/> <span>{vehicle.mileage}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><GitCommitHorizontal className="h-5 w-5 text-primary"/> <span>{vehicle.transmission}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-5 w-5 text-primary"/> <span>{vehicle.year}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Palette className="h-5 w-5 text-primary"/> <span>{vehicle.color}</span></div>
                </CardContent>
            </Card>

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
                <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                             {sellerAvatar && <AvatarImage src={sellerAvatar.imageUrl} alt={seller.name} data-ai-hint={sellerAvatar.imageHint} />}
                            <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold flex items-center gap-2">{seller.name} {seller.isVerified && <BadgeCheck className="h-5 w-5 text-blue-500" />}</p>
                            <p className="text-xs text-muted-foreground">Vendeur Professionnel</p>
                        </div>
                    </div>
                     <Button variant="outline" size="sm">Voir le profil</Button>
                </CardContent>
            </Card>
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 w-full bg-background border-t p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center gap-3">
             <Button size="lg" variant="outline" className="flex-1">Faire une offre</Button>
            <Link href="/messages" passHref className="flex-1">
                <Button size="lg" className="w-full">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Écrire un message
                </Button>
            </Link>
        </div>
      </footer>
    </div>
  );
}
