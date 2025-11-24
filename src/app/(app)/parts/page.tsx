
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, Filter, ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';

const categories = ['Moteur', 'Freinage', 'Suspension', 'Éclairage', 'Filtres'];

const partsData = [
  { id: 'part-oil-filter', name: 'Filtre à huile', compatibility: 'Toyota, BMW', price: '15.99', rating: 4.5, imageId: 'part-oil-filter', category: 'Filtres' },
  { id: 'part-brake-pads', name: 'Plaquettes de frein', compatibility: 'Tous modèles', price: '45.50', rating: 4.8, imageId: 'part-brake-pads', category: 'Freinage' },
  { id: 'part-shock-absorber', name: 'Amortisseur avant', compatibility: 'SUV, 4x4', price: '120.00', rating: 4.7, imageId: 'part-shock-absorber', category: 'Suspension' },
  { id: 'part-led-bulb', name: 'Ampoule de phare LED', compatibility: 'H4, H7', price: '25.00', rating: 4.9, imageId: 'part-led-bulb', category: 'Éclairage' },
  { id: 'part-spark-plug', name: 'Bougie d\'allumage', compatibility: 'Moteurs essence', price: '8.50', rating: 4.6, imageId: 'part-oil-filter', category: 'Moteur' },
];

export default function PartsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const parts = useMemo(() => {
    let filteredParts = partsData;

    if (selectedCategory) {
      filteredParts = filteredParts.filter(part => part.category === selectedCategory);
    }

    if (searchTerm) {
      filteredParts = filteredParts.filter(part =>
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.compatibility.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredParts;
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background p-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <Link href="/home" passHref>
            <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
            </Button>
        </Link>
        <h1 className="text-xl font-bold">Pièces Détachées</h1>
      </header>
      
      <main className="p-4 space-y-4">
        {/* Search and Filter Bar */}
        <div className="sticky top-[73px] bg-muted z-10 py-2">
            <div className="flex items-center gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher une pièce..." 
                  className="pl-12 rounded-full h-12 bg-card border-none focus-visible:ring-primary shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="icon" variant="outline" className="rounded-full h-12 w-12 bg-card shadow-sm">
                <Filter className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex gap-2 overflow-x-auto mt-4 pb-2">
                <Button 
                  variant={!selectedCategory ? 'default' : 'outline'} 
                  size="sm" 
                  className="bg-card rounded-full whitespace-nowrap"
                  onClick={() => setSelectedCategory(null)}
                >
                  Tout
                </Button>
                {categories.map((category) => (
                    <Button 
                      key={category} 
                      variant={selectedCategory === category ? 'default' : 'outline'} 
                      size="sm" 
                      className="bg-card rounded-full whitespace-nowrap"
                      onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </Button>
                ))}
            </div>
        </div>

        {/* Parts Grid */}
        <div className="grid grid-cols-2 gap-4">
          {parts.map((part) => {
            const partImage = PlaceHolderImages.find(p => p.id === part.imageId);
            return (
              <Link key={part.id} href={`/parts/${part.id}`} passHref>
                <Card className="rounded-2xl overflow-hidden group shadow-md border-none h-full">
                  <CardContent className="p-3 flex flex-col h-full">
                    <div className="relative bg-muted rounded-lg aspect-[4/3]">
                      {partImage && (
                        <Image
                          src={partImage.imageUrl}
                          alt={part.name}
                          fill
                          className="object-contain p-2"
                          data-ai-hint={partImage.imageHint}
                        />
                      )}
                    </div>
                    <div className="pt-3 flex flex-col flex-grow">
                      <h3 className="font-bold text-sm truncate">{part.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{part.compatibility}</p>
                      <div className="flex-grow" />
                      <div className="flex items-center justify-between mt-2">
                         <p className="font-bold text-md text-primary">${part.price}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-sm">{part.rating}</span>
                        </div>
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
