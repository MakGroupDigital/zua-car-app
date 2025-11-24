
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Share2, MessageSquare, BadgeCheck, Star, ShoppingCart } from 'lucide-react';
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

const partsData = [
  { id: 'part-oil-filter', name: 'Filtre à huile', compatibility: 'Toyota, BMW', price: '15.99', rating: 4.5, imageIds: ['part-oil-filter', 'part-brake-pads', 'part-shock-absorber'], category: 'Filtres', description: 'Filtre à huile de haute qualité pour une performance optimale du moteur. Compatible avec une large gamme de véhicules Toyota et BMW.' },
  { id: 'part-brake-pads', name: 'Plaquettes de frein', compatibility: 'Tous modèles', price: '45.50', rating: 4.8, imageIds: ['part-brake-pads', 'part-oil-filter', 'part-shock-absorber'], category: 'Freinage', description: 'Jeu de plaquettes de frein avant pour une sécurité maximale. Matériau en céramique pour une durabilité accrue et moins de poussière.' },
  { id: 'part-shock-absorber', name: 'Amortisseur avant', compatibility: 'SUV, 4x4', price: '120.00', rating: 4.7, imageIds: ['part-shock-absorber', 'part-led-bulb', 'part-oil-filter'], category: 'Suspension', description: 'Amortisseur robuste conçu pour les véhicules SUV et 4x4. Offre un confort de conduite supérieur et une meilleure tenue de route.' },
  { id: 'part-led-bulb', name: 'Ampoule de phare LED', compatibility: 'H4, H7', price: '25.00', rating: 4.9, imageIds: ['part-led-bulb', 'part-brake-pads', 'part-shock-absorber'], category: 'Éclairage', description: 'Ampoule de phare LED ultra-brillante pour une visibilité nocturne améliorée. Facile à installer et économe en énergie.' },
  { id: 'part-spark-plug', name: 'Bougie d\'allumage', compatibility: 'Moteurs essence', price: '8.50', rating: 4.6, imageIds: ['part-oil-filter', 'part-brake-pads', 'part-led-bulb'], category: 'Moteur', description: 'Bougie d\'allumage Iridium pour une combustion efficace et une meilleure performance du moteur. Longue durée de vie.' },
];

const seller = {
    name: 'Zua-Pièces Pro',
    avatarId: 'avatar-2',
    isVerified: true
}

export default function PartDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const partId = params.id as string;
    const part = partsData.find(p => p.id === partId);
    const sellerAvatar = PlaceHolderImages.find(p => p.id === seller.avatarId);

    if (!part) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-muted">
                <p>Pièce non trouvée.</p>
                <Button onClick={() => router.back()} className="mt-4">Retour</Button>
            </div>
        )
    }

    const partImages = part.imageIds.map(id => PlaceHolderImages.find(p => p.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-muted">
        <header className="bg-background/80 backdrop-blur-sm p-4 flex items-center justify-between sticky top-0 z-10">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold truncate">{part.name}</h1>
             <Button variant="ghost" size="icon">
                <Share2 className="h-6 w-6" />
            </Button>
        </header>

      <main className="pb-28">
         <Carousel className="w-full bg-card">
          <CarouselContent>
            {partImages.map((img, index) => (
              img && (
                <CarouselItem key={index}>
                  <div className="relative w-full h-[35vh]">
                     <Image
                      src={img.imageUrl}
                      alt={`${part.name} - Image ${index + 1}`}
                      fill
                      className="object-contain p-4"
                      data-ai-hint={img.imageHint}
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              )
            ))}
          </CarouselContent>
            {partImages.length > 1 && (
                <>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                </>
            )}
        </Carousel>

        <div className="p-4 space-y-4">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{part.name}</CardTitle>
                    <div className="flex items-center justify-between">
                         <p className="text-2xl font-extrabold text-primary">${part.price}</p>
                         <div className="flex items-center gap-1 text-md">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{part.rating}</span>
                          <span className="text-sm text-muted-foreground">(24 avis)</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground font-medium">Compatible avec : <span className="font-semibold text-foreground">{part.compatibility}</span></p>
                </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                       {part.description}
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
                     <Link href="/messages" passHref>
                        <Button variant="outline" size="icon"><MessageSquare className="h-5 w-5"/></Button>
                     </Link>
                </CardContent>
            </Card>
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 w-full bg-background border-t p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center gap-3">
            <Button size="lg" className="flex-1">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ajouter au panier
            </Button>
        </div>
      </footer>
    </div>
  );
}
