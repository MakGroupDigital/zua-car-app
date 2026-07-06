'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Loader2, MapPin, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, collection, query, orderBy, limit, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useVehicleRatings } from '@/hooks/use-vehicle-ratings';
import { useSellerNames } from '@/hooks/use-seller-names';
import { cn } from '@/lib/utils';
import { getListingPrimaryImage } from '@/lib/listing-images';
import { RDC_CITIES, normalizeCity } from '@/lib/rdc-cities';
import { VEHICLE_TYPES, getVehicleTypeFromListing, normalizeVehicleType } from '@/lib/vehicle-types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const services = [
  { name: 'Louer', kind: 'rent', href: '/vehicleRentalListings' },
  { name: 'Acheter', kind: 'buy', href: '/vehicles' },
  { name: 'Vendre', kind: 'sell', href: '/dashboard/vente/nouveau' },
  { name: 'Assurance', kind: 'insurance', href: '/insuranceProviders' },
] as const;

interface Vehicle {
  id: string;
  title?: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  pricePerDay?: number;
  pricePerHour?: number;
  imageUrls?: string[];
  imageUrl?: string;
  status?: string;
  userId?: string;
  location?: string;
  vehicleType?: string;
  type?: string;
  category?: string;
  bodyType?: string;
  listingType?: 'sale' | 'rental';
}

const fallbackOffers: Vehicle[] = [
  { id: 'demo-corolla', title: 'Toyota Corolla', make: 'Toyota', model: 'Corolla', year: 2020, price: 15000, imageUrl: PlaceHolderImages.find((p) => p.id === 'car-tesla-model-3')?.imageUrl, location: 'Kinshasa', vehicleType: 'Berline', listingType: 'sale' },
  { id: 'demo-rav4', title: 'Toyota RAV4', make: 'Toyota', model: 'RAV4', year: 2021, price: 22000, imageUrl: PlaceHolderImages.find((p) => p.id === 'car-cadillac-escalade')?.imageUrl, location: 'Gombe', vehicleType: 'SUV', listingType: 'sale' },
  { id: 'demo-bmw', title: 'BMW Series 3', make: 'BMW', model: 'Series 3', year: 2020, price: 32500, imageUrl: PlaceHolderImages.find((p) => p.id === 'car-bmw-series-3')?.imageUrl, location: 'Kinshasa', vehicleType: 'Luxe', listingType: 'sale' },
  { id: 'demo-escalade', title: 'Cadillac Escalade', make: 'Cadillac', model: 'Escalade', year: 2023, price: 55000, imageUrl: PlaceHolderImages.find((p) => p.id === 'car-cadillac-escalade')?.imageUrl, location: 'Lubumbashi', vehicleType: 'SUV', listingType: 'sale' },
];

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const logoImage = PlaceHolderImages.find((p) => p.id === 'app-logo');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<{ vehicleIds: string[]; rentalIds: string[] }>({ vehicleIds: [], rentalIds: [] });
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const { toast } = useToast();

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2010, 2026]);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('');
  const [selectedListingType, setSelectedListingType] = useState<'all' | 'sale' | 'rental'>('all');

  const vehiclesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'vehicles'), orderBy('createdAt', 'desc'), limit(30));
  }, [firestore]);

  const rentalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'rentals'), orderBy('createdAt', 'desc'), limit(30));
  }, [firestore]);

  const { data: vehicles, isLoading: isVehiclesLoading } = useCollection<Vehicle>(vehiclesQuery);
  const { data: rentals, isLoading: isRentalsLoading } = useCollection<Vehicle>(rentalsQuery);
  const saleOffers = useMemo(() => (vehicles || []).map((vehicle) => ({ ...vehicle, listingType: 'sale' as const })), [vehicles]);
  const rentalOffers = useMemo(() => (rentals || []).map((rental) => ({ ...rental, listingType: 'rental' as const, price: rental.pricePerDay || rental.price })), [rentals]);
  const vehicleSource = saleOffers.length > 0 || rentalOffers.length > 0
    ? [...saleOffers, ...rentalOffers]
    : fallbackOffers;

  const vehicleIds = useMemo(() => vehicleSource.map((vehicle) => vehicle.id), [vehicleSource]);
  const { ratings: vehicleRatings } = useVehicleRatings(firestore, vehicleIds);
  const sellerIds = useMemo(() => vehicleSource.map((vehicle) => vehicle.userId).filter(Boolean) as string[], [vehicleSource]);
  const { sellerNames } = useSellerNames(sellerIds);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !firestore) return;
      try {
        const favDocRef = doc(firestore, 'favorites', user.uid);
        const favSnap = await getDoc(favDocRef);
        if (favSnap.exists()) {
          setFavoriteIds({
            vehicleIds: favSnap.data().vehicleIds || [],
            rentalIds: favSnap.data().rentalIds || [],
          });
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };
    fetchFavorites();
  }, [user, firestore]);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<any>(userDocRef);

  const filteredCars = useMemo(() => {
    return vehicleSource.filter((vehicle) => {
      const vehicleType = getVehicleTypeFromListing(vehicle);
      const listingType = vehicle.listingType || 'sale';
      const searchText = `${vehicle.title || ''} ${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.location || ''} ${vehicleType}`.toLowerCase();
      const price = Number(vehicle.price || vehicle.pricePerDay || 0);
      const year = Number(vehicle.year || 2020);
      const matchesSearch = !searchTerm || searchText.includes(searchTerm.toLowerCase());
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const matchesYear = year >= yearRange[0] && year <= yearRange[1];
      const matchesMake = !selectedMake || `${vehicle.make || ''}`.toLowerCase() === selectedMake.toLowerCase();
      const matchesModel = !selectedModel || `${vehicle.model || ''}`.toLowerCase() === selectedModel.toLowerCase();
      const matchesCity = !selectedCity || normalizeCity(vehicle.location).includes(normalizeCity(selectedCity));
      const matchesVehicleType = !selectedVehicleType || normalizeVehicleType(vehicleType).includes(normalizeVehicleType(selectedVehicleType));
      const matchesListingType = selectedListingType === 'all' || listingType === selectedListingType;
      return matchesSearch && matchesPrice && matchesYear && matchesMake && matchesModel && matchesCity && matchesVehicleType && matchesListingType;
    });
  }, [vehicleSource, searchTerm, priceRange, yearRange, selectedMake, selectedModel, selectedCity, selectedVehicleType, selectedListingType]);

  const availableMakes = useMemo(() => {
    const makes = new Set<string>();
    vehicleSource.forEach((vehicle) => {
      if (vehicle.make) makes.add(vehicle.make);
    });
    return Array.from(makes).sort();
  }, [vehicleSource]);

  const availableModels = useMemo(() => {
    const models = new Set<string>();
    vehicleSource.forEach((vehicle) => {
      if (selectedMake && `${vehicle.make || ''}`.toLowerCase() !== selectedMake.toLowerCase()) return;
      if (vehicle.model) models.add(vehicle.model);
    });
    return Array.from(models).sort();
  }, [vehicleSource, selectedMake]);

  const resetFilters = () => {
    setPriceRange([0, 100000]);
    setYearRange([2010, 2026]);
    setSelectedMake('');
    setSelectedModel('');
    setSelectedCity('');
    setSelectedVehicleType('');
    setSelectedListingType('all');
    toast({ title: 'Filtres réinitialisés', description: 'Tous les filtres ont été supprimés' });
  };

  const toggleFavorite = async (offer: Vehicle, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast({ variant: 'destructive', title: 'Connexion requise', description: 'Vous devez être connecté pour ajouter aux favoris' });
      return;
    }
    if (!firestore) return;

    const favoriteField = offer.listingType === 'rental' ? 'rentalIds' : 'vehicleIds';
    const currentIds = favoriteField === 'rentalIds' ? favoriteIds.rentalIds : favoriteIds.vehicleIds;
    const isFavorite = currentIds.includes(offer.id);

    setTogglingFavorite(`${offer.listingType}:${offer.id}`);

    try {
      const favDocRef = doc(firestore, 'favorites', user.uid);
      const favSnap = await getDoc(favDocRef);
      if (isFavorite) {
        if (favSnap.exists()) {
          await updateDoc(favDocRef, { [favoriteField]: arrayRemove(offer.id), updatedAt: new Date() });
        }
        setFavoriteIds((prev) => ({ ...prev, [favoriteField]: currentIds.filter((id) => id !== offer.id) }));
      } else {
        if (favSnap.exists()) {
          await updateDoc(favDocRef, { [favoriteField]: arrayUnion(offer.id), updatedAt: new Date() });
        } else {
          await setDoc(favDocRef, {
            userId: user.uid,
            vehicleIds: favoriteField === 'vehicleIds' ? [offer.id] : [],
            rentalIds: favoriteField === 'rentalIds' ? [offer.id] : [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        setFavoriteIds((prev) => ({ ...prev, [favoriteField]: [...currentIds, offer.id] }));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de modifier les favoris' });
    } finally {
      setTogglingFavorite(null);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 text-foreground">
        <div className="flex flex-col items-center gap-8">
          {logoImage && (
            <div className="relative h-36 w-36 animate-pulse overflow-hidden rounded-full border-4 border-primary/20 shadow-2xl">
              <Image src={logoImage.imageUrl} alt={logoImage.description} fill className="object-cover" priority data-ai-hint={logoImage.imageHint} />
            </div>
          )}
          <div className="flex items-center gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-lg font-semibold">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  const forYou = filteredCars.slice(0, 6);
  const nearYou = [...filteredCars].reverse().slice(0, 6);
  const basedOnSearch = searchTerm ? filteredCars.slice(0, 6) : filteredCars.slice(1, 7);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 font-body text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 animate-pulse rounded-full bg-accent/10 blur-3xl" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      <main className="space-y-6 p-4 pb-20">
        <section className="rounded-[2rem] border border-white/50 bg-card/75 p-3 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="group relative flex-1">
              <Search className="absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-primary/60 transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Rechercher une voiture..."
                className="h-12 rounded-full border-2 border-primary/20 bg-gradient-to-r from-card to-primary/5 pl-12 pr-10 shadow-md transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              {searchTerm && (
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full hover:bg-primary/10" onClick={() => setSearchTerm('')}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 transition hover:scale-105"
              onClick={() => setIsFilterDialogOpen(true)}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-black text-transparent">
              Que voulez-vous faire ?
            </h2>
          </div>
          <div className="flex items-start justify-between gap-2 rounded-[1.5rem] border border-white/50 bg-card/70 px-3 py-3 shadow-xl shadow-primary/5 backdrop-blur-xl">
            {services.map((service) => {
              return (
                <Link
                  key={service.name}
                  href={service.href}
                  className="group flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 transition duration-300 group-hover:-translate-y-1">
                    <ActionIcon kind={service.kind} />
                  </div>
                  <span className="truncate text-center text-[11px] font-black text-primary">{service.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <OfferRail title="Pour toi" offers={forYou} favoriteIds={favoriteIds} togglingFavorite={togglingFavorite} toggleFavorite={toggleFavorite} ratings={vehicleRatings} sellerNames={sellerNames} loading={isVehiclesLoading || isRentalsLoading} />
        <OfferRail title="Offres proches de chez vous" offers={nearYou} favoriteIds={favoriteIds} togglingFavorite={togglingFavorite} toggleFavorite={toggleFavorite} ratings={vehicleRatings} sellerNames={sellerNames} loading={isVehiclesLoading || isRentalsLoading} />
        <OfferRail title="Sur base de vos recherches" offers={basedOnSearch} favoriteIds={favoriteIds} togglingFavorite={togglingFavorite} toggleFavorite={toggleFavorite} ratings={vehicleRatings} sellerNames={sellerNames} loading={isVehiclesLoading || isRentalsLoading} />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-black text-transparent">Véhicules populaires</h2>
            <Link href="/vehicles" className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
              Voir tout
            </Link>
          </div>
          <div className="flex snap-x gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filteredCars.map((vehicle) => (
              <VehicleCard
                key={`popular-${vehicle.id}`}
                vehicle={vehicle}
                favoriteIds={favoriteIds}
                togglingFavorite={togglingFavorite}
                toggleFavorite={toggleFavorite}
                ratings={vehicleRatings}
                sellerNames={sellerNames}
                className="w-[72vw] max-w-[280px] shrink-0 snap-start"
              />
            ))}
          </div>
        </section>
      </main>

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="rounded-[2rem] border-white/50 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Filtrer les offres</DialogTitle>
            <DialogDescription>Affinez par vente, location, ville, type, marque, modèle, budget et année.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto py-4 pr-1">
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'all', label: 'Tout' },
                { value: 'sale', label: 'Vente' },
                { value: 'rental', label: 'Location' },
              ].map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={selectedListingType === option.value ? 'default' : 'outline'}
                  className="rounded-full"
                  onClick={() => setSelectedListingType(option.value as 'all' | 'sale' | 'rental')}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Ville</Label>
                <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)} className="h-11 w-full rounded-xl border bg-background px-3">
                  <option value="">Toutes les villes</option>
                  {RDC_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Type de véhicule</Label>
                <select value={selectedVehicleType} onChange={(event) => setSelectedVehicleType(event.target.value)} className="h-11 w-full rounded-xl border bg-background px-3">
                  <option value="">Tous les types</option>
                  {VEHICLE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Marque</Label>
                <select
                  value={selectedMake}
                  onChange={(event) => {
                    setSelectedMake(event.target.value);
                    setSelectedModel('');
                  }}
                  className="h-11 w-full rounded-xl border bg-background px-3"
                >
                  <option value="">Toutes les marques</option>
                  {availableMakes.map((make) => <option key={make} value={make}>{make}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Modèle</Label>
                <select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)} className="h-11 w-full rounded-xl border bg-background px-3">
                  <option value="">Tous les modèles</option>
                  {availableModels.map((model) => <option key={model} value={model}>{model}</option>)}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Prix minimum</Label>
                <Input type="number" min={0} value={priceRange[0]} onChange={(event) => setPriceRange([Number(event.target.value), priceRange[1]])} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Prix maximum</Label>
                <Input type="number" min={priceRange[0]} value={priceRange[1]} onChange={(event) => setPriceRange([priceRange[0], Number(event.target.value)])} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Année minimum</Label>
                <Input type="number" min={1980} value={yearRange[0]} onChange={(event) => setYearRange([Number(event.target.value), yearRange[1]])} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Année maximum</Label>
                <Input type="number" min={yearRange[0]} value={yearRange[1]} onChange={(event) => setYearRange([yearRange[0], Number(event.target.value)])} className="h-11 rounded-xl" />
              </div>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-3 text-sm font-semibold text-primary">
              {filteredCars.length} offre{filteredCars.length > 1 ? 's' : ''} trouvée{filteredCars.length > 1 ? 's' : ''}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={resetFilters}>Réinitialiser</Button>
            <Button onClick={() => setIsFilterDialogOpen(false)}>Appliquer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OfferRail({
  title,
  offers,
  favoriteIds,
  togglingFavorite,
  toggleFavorite,
  ratings,
  sellerNames,
  loading,
}: {
  title: string;
  offers: Vehicle[];
  favoriteIds: { vehicleIds: string[]; rentalIds: string[] };
  togglingFavorite: string | null;
  toggleFavorite: (offer: Vehicle, event: React.MouseEvent) => void;
  ratings: Record<string, { average: number; count: number }>;
  sellerNames: Record<string, { name: string; photoURL?: string }>;
  loading?: boolean;
}) {
  return (
    <section>
      <h2 className="mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-black text-transparent">{title}</h2>
      <div className="flex snap-x gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading && offers.length === 0 ? (
          <div className="flex h-48 w-full items-center justify-center rounded-[1.5rem] bg-card/75 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Chargement...
          </div>
        ) : (
          offers.map((vehicle) => (
            <VehicleCard
              key={`${title}-${vehicle.id}`}
              vehicle={vehicle}
              favoriteIds={favoriteIds}
              togglingFavorite={togglingFavorite}
              toggleFavorite={toggleFavorite}
              ratings={ratings}
              sellerNames={sellerNames}
              className="w-[68vw] max-w-[260px] shrink-0 snap-start"
            />
          ))
        )}
      </div>
    </section>
  );
}

function VehicleCard({
  vehicle,
  favoriteIds,
  togglingFavorite,
  toggleFavorite,
  ratings,
  sellerNames,
  className,
}: {
  vehicle: Vehicle;
  favoriteIds: { vehicleIds: string[]; rentalIds: string[] };
  togglingFavorite: string | null;
  toggleFavorite: (offer: Vehicle, event: React.MouseEvent) => void;
  ratings: Record<string, { average: number; count: number }>;
  sellerNames: Record<string, { name: string; photoURL?: string }>;
  className?: string;
}) {
  const title = vehicle.title || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Véhicule';
  const imageUrl = getListingPrimaryImage(vehicle);
  const rating = ratings[vehicle.id];
  const listingType = vehicle.listingType || 'sale';
  const isFavorite = listingType === 'rental'
    ? favoriteIds.rentalIds.includes(vehicle.id)
    : favoriteIds.vehicleIds.includes(vehicle.id);
  const favoriteKey = `${listingType}:${vehicle.id}`;
  const sellerName = vehicle.userId ? sellerNames[vehicle.userId]?.name : null;
  const href = vehicle.id.startsWith('demo-')
    ? '/vehicles'
    : listingType === 'rental'
      ? `/vehicleRentalListings/${vehicle.id}`
      : `/vehicles/${vehicle.id}`;
  const price = Number(vehicle.price || vehicle.pricePerDay || 0);

  return (
    <Link href={href} className={className}>
      <Card className="h-full overflow-hidden rounded-[1.5rem] border-white/50 bg-card/85 shadow-xl shadow-primary/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1">
        <CardContent className="p-3">
          <div className="relative">
            <span className="absolute right-2 top-2 z-10 rounded-full bg-background/85 px-2 py-1 text-[10px] font-black text-primary backdrop-blur">
              {listingType === 'rental' ? 'Location' : 'Vente'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-2 z-10 h-8 w-8 rounded-full bg-background/85 text-primary backdrop-blur hover:bg-primary hover:text-primary-foreground"
              onClick={(event) => toggleFavorite(vehicle, event)}
              disabled={togglingFavorite === favoriteKey}
            >
              {togglingFavorite === favoriteKey ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
              )}
            </Button>
            {imageUrl && (
              <Image src={imageUrl} alt={title} width={320} height={220} className="aspect-[4/3] w-full rounded-[1.1rem] object-cover" />
            )}
          </div>
          <div className="pt-3">
            <h3 className="truncate text-base font-black">{title}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-accent" />
              <span className="truncate">{vehicle.location || sellerName || 'RDC'}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-black text-primary">
                ${price.toLocaleString()}{listingType === 'rental' && <span className="text-[10px] text-muted-foreground">/jour</span>}
              </p>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-bold">{rating?.average ? rating.average.toFixed(1) : '4.8'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ActionIcon({ kind }: { kind: (typeof services)[number]['kind'] }) {
  if (kind === 'rent') {
    return (
      <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" aria-hidden="true">
        <path d="M14 26h20l-3-8H17l-3 8Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M12 26h24v9H12v-9Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M17 35v3M31 35v3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M18 30h.1M30 30h.1" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M24 8v7M20.5 11.5 24 8l3.5 3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === 'buy') {
    return (
      <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" aria-hidden="true">
        <path d="M11 25h26l-4-9H15l-4 9Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M10 25h28v9H10v-9Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M16 34v3M32 34v3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M17 29h.1M31 29h.1" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M33 8h6v6M38 9 29 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === 'sell') {
    return (
      <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" aria-hidden="true">
        <path d="M9 14h16l14 14-11 11L14 25V14Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M18 20h.1" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path d="M27 28h8M31 24v8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" aria-hidden="true">
      <path d="M24 7 38 13v10c0 9-5.8 15.5-14 18-8.2-2.5-14-9-14-18V13l14-6Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M18 24 22 28l8-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
