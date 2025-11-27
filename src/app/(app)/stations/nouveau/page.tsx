'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Loader2, Fuel, Phone, Mail, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/hooks/use-location';

export default function NewStationPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();
  const { location: userLocationData, requestLocation } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phoneNumber: '',
    email: '',
    latitude: '',
    longitude: '',
    rating: '',
    reviewCount: '',
    openingHours: '',
    fuelTypes: '',
  });

  // Auto-fill location if user grants permission
  useEffect(() => {
    if (userLocationData && !formData.latitude && !formData.longitude) {
      // Get user's location from browser
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFormData(prev => ({
              ...prev,
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString(),
            }));
          },
          (error) => {
            console.log('Location not available:', error);
          }
        );
      }
    }
  }, [userLocationData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'La géolocalisation n\'est pas supportée par votre navigateur',
      });
      return;
    }

    const permission = await requestLocation();
    if (permission === 'granted') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          toast({
            title: 'Localisation obtenue',
            description: 'Votre position a été enregistrée',
          });
        },
        (error) => {
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Impossible d\'obtenir votre position',
          });
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour ajouter une station',
      });
      router.push('/login');
      return;
    }

    if (!formData.name || !formData.address || !formData.city || !formData.phoneNumber) {
      toast({
        variant: 'destructive',
        title: 'Champs requis',
        description: 'Veuillez remplir au moins le nom, l\'adresse, la ville et le téléphone',
      });
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast({
        variant: 'destructive',
        title: 'Localisation requise',
        description: 'Veuillez fournir les coordonnées GPS du garage',
      });
      return;
    }

    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Service non disponible',
      });
      return;
    }

    setIsLoading(true);

    try {
      const stationId = `station_${user.uid}_${Date.now()}`;
      const stationRef = doc(firestore, 'stations', stationId);

      const stationData: any = {
        userId: user.uid,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        phoneNumber: formData.phoneNumber,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        createdAt: serverTimestamp(),
        isOpen: true,
      };

      if (formData.email) {
        garageData.email = formData.email;
      }
      if (formData.rating) {
        garageData.rating = parseFloat(formData.rating);
      }
      if (formData.reviewCount) {
        garageData.reviewCount = parseInt(formData.reviewCount);
      }
      if (formData.openingHours) {
        garageData.openingHours = formData.openingHours;
      }
      if (formData.fuelTypes) {
        stationData.fuelTypes = formData.fuelTypes.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }

      await setDoc(stationRef, stationData);

      toast({
        title: 'Station ajoutée ! 🎉',
        description: 'Votre station-service est maintenant visible sur la carte',
      });

      router.push('/stations');
    } catch (error: any) {
      console.error('Error creating garage:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible d\'ajouter la station',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 via-background/90 to-accent/10 backdrop-blur-xl border-b border-primary/20 p-4 flex items-center gap-4 shadow-lg">
        <Button variant="ghost" size="icon" onClick={() => router.push('/stations')} className="hover:bg-primary/10">
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <Fuel className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ajouter une station
          </h1>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto p-4 pt-6">
        <Card className="shadow-2xl border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Informations de la station
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom du garage */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-primary font-semibold">
                  Nom de la station <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Station Total Express"
                  required
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-primary font-semibold">
                  Adresse <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Ex: Avenue de la République"
                  required
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              {/* Ville */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-primary font-semibold">
                  Ville <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Ex: Kinshasa"
                  required
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-primary font-semibold">
                  Téléphone <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+243 900 123 456"
                    required
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary font-semibold">
                  Email (optionnel)
                </Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@garage.com"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Localisation GPS */}
              <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <Label className="text-primary font-semibold">
                    Coordonnées GPS <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    className="text-xs"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Ma position
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-sm">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="Ex: -4.3276"
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-sm">Longitude</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="Ex: 15.3136"
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Note et avis */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="rating" className="text-primary font-semibold">
                    Note (optionnel)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={handleInputChange}
                      placeholder="Ex: 4.5"
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewCount" className="text-primary font-semibold">
                    Nombre d'avis (optionnel)
                  </Label>
                  <Input
                    id="reviewCount"
                    name="reviewCount"
                    type="number"
                    min="0"
                    value={formData.reviewCount}
                    onChange={handleInputChange}
                    placeholder="Ex: 25"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Horaires */}
              <div className="space-y-2">
                <Label htmlFor="openingHours" className="text-primary font-semibold">
                  Horaires d'ouverture (optionnel)
                </Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="openingHours"
                    name="openingHours"
                    value={formData.openingHours}
                    onChange={handleInputChange}
                    placeholder="Ex: Lun-Ven: 8h-18h, Sam: 8h-13h"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Types de carburant */}
              <div className="space-y-2">
                <Label htmlFor="fuelTypes" className="text-primary font-semibold">
                  Types de carburant (optionnel)
                </Label>
                <Textarea
                  id="fuelTypes"
                  name="fuelTypes"
                  value={formData.fuelTypes}
                  onChange={handleInputChange}
                  placeholder="Ex: Essence, Diesel, GPL, Super (séparés par des virgules)"
                  className="border-primary/20 focus:border-primary min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  Séparez les types de carburant par des virgules
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/stations')}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Fuel className="h-4 w-4 mr-2" />
                      Ajouter la station
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

