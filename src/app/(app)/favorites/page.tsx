
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const favoriteItems = [
  { id: 'tesla-model-x', type: 'vehicle', name: 'Tesla Model X', price: '28,180', rating: 4.8, imageId: 'car-tesla-model-x' },
  { id: 'part-brake-pads', type: 'part', name: 'Plaquettes de frein', price: '45.50', rating: 4.8, imageId: 'part-brake-pads' },
  { id: 'cadillac-escalade', type: 'vehicle', name: 'Cadillac Escalade', price: '55,000', rating: 4.9, imageId: 'car-cadillac-escalade' },
];

export default function FavoritesPage() {
  const getLink = (item: typeof favoriteItems[0]) => {
    return item.type === 'vehicle' ? `/vehicles/${item.id}` : `/parts/${item.id}`;
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <Link href="/home" passHref>
            <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
            </Button>
        </Link>
        <h1 className="text-xl font-bold">Mes Favoris</h1>
      </header>
      <main className="p-4 space-y-4">
         {favoriteItems.length === 0 ? (
             <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
                <Heart className="h-12 w-12 text-muted-foreground mb-4"/>
                <h3 className="text-lg font-semibold">Votre liste de favoris est vide</h3>
                <p className="text-muted-foreground mt-2 max-w-md">Cliquez sur l'icône en forme de cœur sur un article pour l'ajouter ici.</p>
             </div>
        ) : (
            <div className="space-y-4">
                {favoriteItems.map((item) => {
                    const itemImage = PlaceHolderImages.find(p => p.id === item.imageId);
                    return (
                        <Card key={item.id} className="shadow-md">
                            <CardContent className="p-3 flex items-center gap-4">
                               <Link href={getLink(item)} className="flex-shrink-0">
                                {itemImage && (
                                    <Image
                                        src={itemImage.imageUrl}
                                        alt={item.name}
                                        width={100}
                                        height={75}
                                        className="rounded-lg object-cover aspect-[4/3]"
                                        data-ai-hint={itemImage.imageHint}
                                    />
                                )}
                                </Link>
                                <div className="flex-grow">
                                     <Link href={getLink(item)}>
                                        <h3 className="font-bold hover:underline">{item.name}</h3>
                                     </Link>
                                    <p className="text-primary font-semibold">${item.price}</p>
                                    <div className="flex items-center gap-1 text-sm mt-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-bold">{item.rating}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-5 w-5" />
                                    <span className="sr-only">Supprimer des favoris</span>
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        )}
      </main>
    </div>
  );
}
