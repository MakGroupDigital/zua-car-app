
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Share2, Star, Clock, Sun, Calendar, MessageSquare, BadgeCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useParams, useRouter } from 'next/navigation';

const rentalData = {
    'rental-yaris': { id: 'rental-yaris', model: 'Toyota Yaris', imageIds: ['car-tesla-model-3', 'car-tesla-model-x', 'car-bmw-series-3'], rating: 4.8, reviews: 15, description: 'Petite et économique, parfaite pour la ville.', pricing: { hour: 5, day: 30, week: 180 } },
    'rental-rav4': { id: 'rental-rav4', model: 'Toyota RAV4', imageIds: ['car-cadillac-escalade', 'car-tesla-model-3', 'car-bmw-series-3'], rating: 4.9, reviews: 25, description: 'SUV confortable et spacieux, idéal pour les familles et les voyages.', pricing: { hour: 8, day: 50, week: 300 } },
    'rental-hiace': { id: 'rental-hiace', model: 'Toyota Hiace', imageIds: ['car-tesla-model-x', 'car-cadillac-escalade', 'car-bmw-series-3'], rating: 4.7, reviews: 18, description: 'Minibus parfait pour les groupes, les excursions et le transport de matériel.', pricing: { hour: 12, day: 70, week: 420 } },
    'rental-corolla': { id: 'rental-corolla', model: 'Toyota Corolla', imageIds: ['car-bmw-series-3', 'car-tesla-model-x', 'car-cadillac-escalade'], rating: 4.6, reviews: 22, description: 'Berline fiable et confortable, un excellent choix pour tous les jours.', pricing: { hour: 6, day: 35, week: 210 } },
};

const renter = {
    name: 'Zua-Location Express',
    avatarId: 'avatar-2',
    isVerified: true
}

export default function RentalDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const rentalId = params.id as keyof typeof rentalData;
    const rental = rentalData[rentalId];
    const renterAvatar = PlaceHolderImages.find(p => p.id === renter.avatarId);

    if (!rental) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-muted">
                <p>Offre de location non trouvée.</p>
                <Button onClick={() => router.back()} className="mt-4">Retour</Button>
            </div>
        )
    }

    const rentalImages = rental.imageIds.map(id => PlaceHolderImages.find(p => p.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-muted">
        <header className="bg-background/80 backdrop-blur-sm p-4 flex items-center justify-between sticky top-0 z-10">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold truncate">{rental.model}</h1>
             <Button variant="ghost" size="icon">
                <Share2 className="h-6 w-6" />
            </Button>
        </header>

      <main className="pb-28">
         <Carousel className="w-full bg-card">
          <CarouselContent>
            {rentalImages.map((img, index) => (
              img && (
                <CarouselItem key={index}>
                  <div className="relative w-full h-[35vh]">
                     <Image
                      src={img.imageUrl}
                      alt={`${rental.model} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      data-ai-hint={img.imageHint}
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              )
            ))}
          </CarouselContent>
            {rentalImages.length > 1 && (
                <>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                </>
            )}
        </Carousel>

        <div className="p-4 space-y-4">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{rental.model}</CardTitle>
                    <div className="flex items-center gap-1 text-md">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{rental.rating}</span>
                        <span className="text-sm text-muted-foreground">({rental.reviews} avis)</span>
                    </div>
                </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground">{rental.description}</p>
                </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Tarifs de Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                            <Clock className="h-6 w-6 text-primary"/>
                            <span className="font-medium">Par Heure</span>
                        </div>
                        <span className="font-bold text-lg">${rental.pricing.hour.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                            <Sun className="h-6 w-6 text-primary"/>
                            <span className="font-medium">Par Jour</span>
                        </div>
                        <span className="font-bold text-lg">${rental.pricing.day.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-6 w-6 text-primary"/>
                            <span className="font-medium">Par Semaine</span>
                        </div>
                        <span className="font-bold text-lg">${rental.pricing.week.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Loueur</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                             {renterAvatar && <AvatarImage src={renterAvatar.imageUrl} alt={renter.name} data-ai-hint={renterAvatar.imageHint} />}
                            <AvatarFallback>{renter.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold flex items-center gap-2">{renter.name} {renter.isVerified && <BadgeCheck className="h-5 w-5 text-blue-500" />}</p>
                            <p className="text-xs text-muted-foreground">Service de location professionnel</p>
                        </div>
                    </div>
                     <Link href="/messages" passHref>
                        <Button variant="outline" size="icon"><MessageSquare className="h-5 w-5"/></Button>
                     </Link>
                </CardContent>
            </Card>
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 w-full bg-background border-t p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center gap-3">
            <Button size="lg" variant="outline" className="flex-1">
                <Calendar className="mr-2 h-5 w-5" />
                Planifier
            </Button>
            <Button size="lg" className="flex-1">
                Réserver
            </Button>
        </div>
      </footer>
    </div>
  );
}
