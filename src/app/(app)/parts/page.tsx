'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, Filter, Star, Loader2, Plus, X, Wrench } from 'lucide-react';
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
import { User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categories = ['Moteur', 'Freinage', 'Suspension', 'Éclairage', 'Filtres', 'Carrosserie', 'Électrique'];

interface Part {
  id: string;
  title: string;
  name?: string;
  description: string;
  price: number;
  category: string;
  compatibility: string;
  condition: string;
  imageUrls?: string[];
  imageUrl?: string;
  userId: string;
  createdAt: any;
  status?: string;
}

export default function PartsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCondition, setSelectedCondition] = useState<string>('');

  // Fetch parts from Firebase
  const partsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'parts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }, [firestore]);

  const { data: partsData, isLoading, error } = useCollection<Part>(partsQuery);

  // Get unique user IDs for fetching seller names
  const userIds = useMemo(() => {
    return (partsData || []).map(part => part.userId).filter(Boolean) as string[];
  }, [partsData]);

  // Fetch seller names
  const { sellerNames } = useSellerNames(userIds);

  const parts = useMemo(() => {
    let filteredParts = partsData || [];

    // Filter by category
    if (selectedCategory) {
      filteredParts = filteredParts.filter(part => part.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filteredParts = filteredParts.filter(part =>
        (part.title || part.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.compatibility || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    filteredParts = filteredParts.filter(part => 
      part.price >= priceRange[0] && part.price <= priceRange[1]
    );

    // Filter by condition
    if (selectedCondition) {
      filteredParts = filteredParts.filter(part => part.condition === selectedCondition);
    }

    return filteredParts;
  }, [partsData, searchTerm, selectedCategory, priceRange, selectedCondition]);

  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 1000 || selectedCondition !== '';

  const resetFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedCondition('');
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
        <h1 className="text-xl font-bold">Pièces Détachées</h1>
        </div>
        <Link href="/parts/nouveau">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            {(() => {
              const logoImage = PlaceHolderImages.find(p => p.id === 'app-logo');
              if (logoImage) {
                return (
                  <>
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image 
                        src={logoImage.imageUrl} 
                        alt="Logo" 
                        fill 
                        className="object-cover"
                        data-ai-hint={logoImage.imageHint}
                      />
                    </div>
                    <Plus className="h-5 w-5 text-primary" />
                  </>
                );
              }
              return (
                <>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Z</span>
                  </div>
                  <Plus className="h-5 w-5 text-primary" />
                </>
              );
            })()}
          </div>
        </Link>
      </header>
      
      <main className="p-4 space-y-4">
        {/* Search and Filter Bar */}
        <div className="sticky top-[73px] bg-muted z-10 py-2">
            <div className="flex items-center gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher une pièce..." 
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
                  <DialogTitle>Filtrer les pièces</DialogTitle>
                  <DialogDescription>
                    Affinez votre recherche
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label>Prix: ${priceRange[0]} - ${priceRange[1]}</Label>
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
                  
                  {/* Condition */}
                  <div className="space-y-3">
                    <Label>État</Label>
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="">Tous les états</option>
                      <option value="Neuf">Neuf</option>
                      <option value="Occasion - Excellent">Occasion - Excellent</option>
                      <option value="Occasion - Bon">Occasion - Bon</option>
                      <option value="Occasion - Correct">Occasion - Correct</option>
                    </select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={resetFilters} disabled={!hasActiveFilters}>
                    Réinitialiser
                  </Button>
                  <Button onClick={() => setIsFilterDialogOpen(false)}>
                    Appliquer ({parts.length})
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto mt-4 pb-2 scrollbar-hide">
                <Button 
                  variant={!selectedCategory ? 'default' : 'outline'} 
                  size="sm" 
              className="rounded-full whitespace-nowrap"
                  onClick={() => setSelectedCategory(null)}
                >
                  Tout
                </Button>
                {categories.map((category) => (
                    <Button 
                      key={category} 
                      variant={selectedCategory === category ? 'default' : 'outline'} 
                      size="sm" 
                className="rounded-full whitespace-nowrap"
                      onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </Button>
                ))}
            </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Chargement des pièces...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 text-red-500">
            <p>Erreur lors du chargement des pièces.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && parts.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Aucune pièce disponible</p>
            <Link href="/parts/nouveau">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Vendre une pièce
              </Button>
            </Link>
          </div>
        )}

        {/* Parts List */}
        {!isLoading && !error && parts.length > 0 && (
        <div className="space-y-4">
          {parts.map((part) => {
              const partImageUrl = part.imageUrls?.[0] || part.imageUrl;
              const placeholderImage = PlaceHolderImages.find(p => p.id === 'part-oil-filter');
              
            return (
              <Link key={part.id} href={`/parts/${part.id}`} passHref>
                  <Card className="shadow-md cursor-pointer hover:shadow-lg transition-shadow border-none rounded-2xl">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="relative w-1/3 min-w-[120px]">
                        {partImageUrl ? (
                          <Image
                            src={partImageUrl}
                            alt={part.title || part.name || 'Pièce'}
                            width={120}
                            height={90}
                            className="rounded-lg w-full aspect-[4/3] object-cover"
                          />
                        ) : placeholderImage ? (
                        <Image
                            src={placeholderImage.imageUrl}
                            alt={part.title || part.name || 'Pièce'}
                            width={120}
                            height={90}
                            className="rounded-lg w-full aspect-[4/3] object-cover"
                            data-ai-hint={placeholderImage.imageHint}
                        />
                        ) : (
                          <div className="flex items-center justify-center w-full aspect-[4/3] bg-muted rounded-lg">
                            <Wrench className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-lg truncate">{part.title || part.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{part.compatibility}</p>
                      
                      {/* Seller name */}
                      {part.userId && sellerNames[part.userId] && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">
                            {sellerNames[part.userId].name}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                          <p className="text-primary font-semibold text-lg">${part.price?.toLocaleString()}</p>
                          <div className="flex items-center gap-2">
                            {part.condition && (
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full font-medium",
                                part.condition === 'Neuf' 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-blue-100 text-blue-800"
                              )}>
                                {part.condition === 'Neuf' ? 'Neuf' : 'Occasion'}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                              {part.category}
                            </span>
                          </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        )}
      </main>
    </div>
  );
}
