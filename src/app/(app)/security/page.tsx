'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase, useStorage } from '@/firebase';
import { collection, addDoc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield, MapPin, CreditCard, Loader2, CheckCircle2, Camera, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SecurityVehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  trackerNumber: string;
  licensePlate: string;
  vehicleImageUrl?: string;
  isActive: boolean;
  subscriptionStatus: 'active' | 'expired' | 'pending';
  subscriptionExpiry?: Date;
  createdAt: Date;
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
}

export default function SecurityPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<SecurityVehicle | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    trackerNumber: '',
    licensePlate: '',
  });

  // Fetch user's security vehicles
  const vehiclesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // Note: orderBy requires an index. If error occurs, remove orderBy or create index in Firebase Console
    return query(
      collection(firestore, 'securityVehicles'),
      where('userId', '==', user.uid)
      // Temporarily removed orderBy to avoid index requirement
      // orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: vehicles, isLoading: isVehiclesLoading } = useCollection<SecurityVehicle>(vehiclesQuery);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Fichier invalide',
        description: 'Veuillez sélectionner une image (JPG, PNG, etc.)',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Fichier trop volumineux',
        description: 'La taille maximale est de 5 Mo',
      });
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadVehicleImage = async (vehicleId: string): Promise<string | null> => {
    if (!selectedImage || !storage) return null;

    setIsUploadingImage(true);
    try {
      const timestamp = Date.now();
      const safeName = selectedImage.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `securityVehicles/${vehicleId}/${timestamp}_${safeName}`;
      const storageRef = ref(storage, fileName);

      const snapshot = await uploadBytes(storageRef, selectedImage);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur upload',
        description: 'Impossible de télécharger l\'image',
      });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Vous devez être connecté pour enregistrer un véhicule',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create vehicle document first
      const vehicleRef = await addDoc(collection(firestore, 'securityVehicles'), {
        userId: user.uid,
        make: formData.make,
        model: formData.model,
        trackerNumber: formData.trackerNumber,
        licensePlate: formData.licensePlate,
        isActive: false,
        subscriptionStatus: 'pending',
        createdAt: new Date(),
      });

      // Upload image if selected
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadVehicleImage(vehicleRef.id);
        if (imageUrl) {
          // Update vehicle with image URL
          const { updateDoc, doc: docRef } = await import('firebase/firestore');
          await updateDoc(docRef(firestore, 'securityVehicles', vehicleRef.id), {
            vehicleImageUrl: imageUrl,
          });
        }
      }

      toast({
        title: 'Véhicule enregistré !',
        description: 'Redirection vers le paiement...',
      });

      // Redirect to payment page
      router.push(`/security/payment/${vehicleRef.id}`);
    } catch (error: any) {
      console.error('Error registering vehicle:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible d\'enregistrer le véhicule',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubscribe = (vehicle: SecurityVehicle) => {
    setSelectedVehicle(vehicle);
    setIsPaymentDialogOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedVehicle || !user) return;

    // Simulate payment processing
    setIsSubmitting(true);
    
    // In a real app, you would integrate with Stripe or another payment provider
    setTimeout(async () => {
      try {
        // Update vehicle subscription status
        const { doc, updateDoc } = await import('firebase/firestore');
        const vehicleRef = doc(firestore!, 'securityVehicles', selectedVehicle.id);
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now

        await updateDoc(vehicleRef, {
          subscriptionStatus: 'active',
          subscriptionExpiry: expiryDate,
          isActive: true,
        });

        toast({
          title: 'Abonnement activé !',
          description: 'Votre abonnement GPS est maintenant actif pour 1 mois.',
        });

        setIsPaymentDialogOpen(false);
        setSelectedVehicle(null);
        router.push(`/security/manage/${selectedVehicle.id}`);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible d\'activer l\'abonnement',
        });
      } finally {
        setIsSubmitting(false);
      }
    }, 2000);
  };

  if (isUserLoading) {
    return (
      <div className={cn("flex h-screen flex-col items-center justify-center bg-background text-foreground")}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-2 border-primary/20">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Connexion requise</h2>
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour accéder à la sécurité automobile.
            </p>
            <Button onClick={() => router.push('/login')} className="bg-gradient-to-r from-primary to-accent">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="bg-gradient-to-r from-primary/10 via-background/90 to-accent/10 backdrop-blur-xl border-b border-primary/20 p-4 flex items-center gap-4 shadow-lg">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-primary/10">
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sécurité Automobile
          </h1>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Info Card */}
        <Card className="shadow-lg border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-primary to-accent">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Traceur GPS pour votre véhicule
                </h2>
                <p className="text-muted-foreground mb-2">
                  Protégez votre véhicule avec notre système de suivi GPS. Surveillez la position de votre voiture en temps réel.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">12 USD / mois</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Enregistrer un véhicule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make" className="text-primary font-medium">
                    Marque du véhicule
                  </Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="border-primary/20 focus:border-primary focus:ring-primary/30"
                    placeholder="Ex: Toyota"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model" className="text-primary font-medium">
                    Modèle
                  </Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="border-primary/20 focus:border-primary focus:ring-primary/30"
                    placeholder="Ex: Prado"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trackerNumber" className="text-primary font-medium">
                    Numéro du traceur / Carte SIM
                  </Label>
                  <Input
                    id="trackerNumber"
                    type="tel"
                    value={formData.trackerNumber}
                    onChange={(e) => setFormData({ ...formData, trackerNumber: e.target.value })}
                    className="border-primary/20 focus:border-primary focus:ring-primary/30"
                    placeholder="Ex: GPS-123456 ou +243 900 123 456"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepte les numéros de traceur ou les numéros de carte SIM (format international)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licensePlate" className="text-primary font-medium">
                    Numéro matricule
                  </Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    className="border-primary/20 focus:border-primary focus:ring-primary/30"
                    placeholder="Ex: ABC-123-CD"
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-primary font-medium">
                  Photo du véhicule
                </Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
                      <Image
                        src={imagePreview}
                        alt="Aperçu"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-32 h-32 border-2 border-dashed border-primary/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      <Camera className="h-8 w-8 text-primary/50" />
                      <span className="text-xs text-muted-foreground">Ajouter photo</span>
                    </button>
                  )}
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-primary/20 hover:bg-primary/10"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {imagePreview ? 'Changer la photo' : 'Sélectionner une photo'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Format: JPG, PNG (max 5 Mo)
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg"
              >
                {isSubmitting || isUploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isUploadingImage ? 'Upload de l\'image...' : 'Enregistrement...'}
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Enregistrer et payer
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Registered Vehicles */}
        {isVehiclesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : vehicles && vehicles.length > 0 ? (
          <Card className="shadow-lg border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
              <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mes véhicules sécurisés
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="p-4 border border-primary/20 rounded-lg bg-gradient-to-br from-card to-primary/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {vehicle.vehicleImageUrl && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-primary/20 flex-shrink-0">
                          <Image
                            src={vehicle.vehicleImageUrl}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          {vehicle.subscriptionStatus === 'active' ? (
                            <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Actif
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-600 text-xs font-medium">
                              En attente
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Matricule: <span className="font-medium text-foreground">{vehicle.licensePlate}</span></p>
                          <p>Traceur: <span className="font-medium text-foreground">{vehicle.trackerNumber}</span></p>
                          {vehicle.subscriptionStatus === 'active' && vehicle.subscriptionExpiry && (
                            <p>Expire le: <span className="font-medium text-foreground">
                              {new Date(vehicle.subscriptionExpiry.seconds * 1000).toLocaleDateString('fr-FR')}
                            </span></p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {vehicle.subscriptionStatus === 'active' ? (
                          <Button
                            onClick={() => router.push(`/security/manage/${vehicle.id}`)}
                            className="bg-gradient-to-r from-primary to-accent"
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Voir sur la carte
                          </Button>
                        ) : (
                          <Button
                            onClick={() => router.push(`/security/payment/${vehicle.id}`)}
                            className="bg-gradient-to-r from-primary to-accent"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Payer (12 USD/mois)
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-2 border-dashed border-primary/30">
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 text-primary/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun véhicule enregistré. Enregistrez votre premier véhicule ci-dessus.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Abonnement GPS
            </DialogTitle>
            <DialogDescription>
              Souscrivez à l'abonnement mensuel pour activer le suivi GPS de votre véhicule.
            </DialogDescription>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Véhicule</p>
                <p className="font-semibold">{selectedVehicle.make} {selectedVehicle.model}</p>
                <p className="text-sm text-muted-foreground">{selectedVehicle.licensePlate}</p>
              </div>
              
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Prix mensuel</span>
                  <span className="text-2xl font-bold text-primary">12 USD</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Renouvellement automatique chaque mois
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-primary font-medium">
                  Numéro de carte
                </Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  className="border-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-primary font-medium">
                    Expiration
                  </Label>
                  <Input
                    id="expiry"
                    placeholder="MM/AA"
                    className="border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-primary font-medium">
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    className="border-primary/20"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-accent"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payer 12 USD
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

