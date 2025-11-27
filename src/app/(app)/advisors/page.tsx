'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, MapPin, MessageCircle, Search, Loader2, Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

interface Advisor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  photoURL?: string;
  specialization: string;
  experience: number; // années d'expérience
  rating: number; // note moyenne (1-5)
  reviewCount: number;
  location: string;
  city: string;
  isTopAdvisor?: boolean;
  bio?: string;
  languages?: string[];
  createdAt: any;
}

export default function AdvisorsPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all advisors
  const advisorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'advisors'),
      orderBy('rating', 'desc')
    );
  }, [firestore]);

  const { data: advisors, isLoading } = useCollection<Advisor>(advisorsQuery);

  // Filter advisors based on search
  const filteredAdvisors = useMemo(() => {
    if (!advisors) return [];
    if (!searchTerm.trim()) return advisors;

    const search = searchTerm.toLowerCase();
    return advisors.filter(advisor => 
      advisor.firstName?.toLowerCase().includes(search) ||
      advisor.lastName?.toLowerCase().includes(search) ||
      advisor.specialization?.toLowerCase().includes(search) ||
      advisor.city?.toLowerCase().includes(search) ||
      advisor.location?.toLowerCase().includes(search)
    );
  }, [advisors, searchTerm]);

  // Top advisors (top 3 by rating)
  const topAdvisors = useMemo(() => {
    if (!advisors) return [];
    return [...advisors]
      .filter(a => a.rating >= 4.5)
      .sort((a, b) => {
        // Sort by rating first, then by review count
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, 3);
  }, [advisors]);

  // Regular advisors (all except top 3)
  const regularAdvisors = useMemo(() => {
    if (!advisors) return [];
    const topIds = new Set(topAdvisors.map(a => a.id));
    return filteredAdvisors.filter(a => !topIds.has(a.id));
  }, [filteredAdvisors, topAdvisors]);

  const handleContact = (advisor: Advisor) => {
    if (!user) {
      router.push('/login?redirect=/advisors');
      return;
    }

    // Redirect to messages with advisor info
    router.push(`/messages?sellerId=${advisor.id}&message=${encodeURIComponent(`Bonjour ${advisor.firstName}, je souhaite obtenir des conseils automobiles.`)}`);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "fill-yellow-400/50 text-yellow-400"
                : "fill-gray-300 text-gray-300"
            )}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary/10 via-background/90 to-accent/10 backdrop-blur-xl border-b border-primary/20 p-4 flex items-center gap-4 shadow-lg sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.push('/home')} className="hover:bg-primary/10">
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Conseillers Automobiles
          </h1>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto space-y-6 pb-24">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un conseiller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-primary/20 focus:border-primary focus:ring-primary/30"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Top Advisors Section */}
        {topAdvisors.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Top Conseillers
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topAdvisors.map((advisor) => (
                <Card key={advisor.id} className="shadow-lg border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-yellow-500">
                          <AvatarImage src={advisor.photoURL} alt={`${advisor.firstName} ${advisor.lastName}`} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl">
                            {advisor.firstName?.[0]}{advisor.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white">
                          <Award className="h-3 w-3 mr-1" />
                          Top
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg">{advisor.firstName} {advisor.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{advisor.specialization}</p>
                        {renderStars(advisor.rating || 0)}
                        <p className="text-xs text-muted-foreground">{advisor.reviewCount || 0} avis</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{advisor.city || advisor.location}</span>
                      </div>

                      <Button
                        onClick={() => handleContact(advisor)}
                        className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contacter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Advisors Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tous les Conseillers
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : regularAdvisors.length === 0 ? (
            <Card className="shadow-lg border-2 border-primary/20">
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">Aucun conseiller trouvé</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Aucun conseiller ne correspond à votre recherche.' : 'Aucun conseiller disponible pour le moment.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularAdvisors.map((advisor) => (
                <Card key={advisor.id} className="shadow-lg border-2 border-primary/20 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={advisor.photoURL} alt={`${advisor.firstName} ${advisor.lastName}`} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {advisor.firstName?.[0]}{advisor.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-bold text-lg">{advisor.firstName} {advisor.lastName}</h3>
                          <p className="text-sm text-muted-foreground">{advisor.specialization}</p>
                        </div>
                        
                        {renderStars(advisor.rating || 0)}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{advisor.city || advisor.location}</span>
                        </div>

                        {advisor.experience && (
                          <p className="text-xs text-muted-foreground">
                            {advisor.experience} ans d'expérience
                          </p>
                        )}

                        <Button
                          onClick={() => handleContact(advisor)}
                          className="w-full mt-4 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                          size="sm"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contacter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

