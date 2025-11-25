'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, X, Loader2, ImagePlus, Car, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore, useStorage } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  title: string;
  make: string;
  model: string;
  description: string;
  pricePerDay: string;
  pricePerHour: string;
  pricePerWeek: string;
  seats: string;
  location: string;
}

export default function NewRentalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    make: '',
    model: '',
    description: '',
    pricePerDay: '',
    pricePerHour: '',
    pricePerWeek: '',
    seats: '',
    location: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour louer un véhicule',
      });
    }
  }, [user, isUserLoading, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.slice(0, 5 - selectedImages.length);
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== newFiles.length) {
      toast({
        variant: 'destructive',
        title: 'Fichiers invalides',
        description: 'Seules les images sont acceptées',
      });
    }

    setSelectedImages(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (rentalId: string): Promise<string[]> => {
    const imageUrls: string[] = [];
    if (!storage) throw new Error("Firebase Storage not initialized");

    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      setUploadProgress(`Upload image ${i + 1}/${selectedImages.length}...`);

      const timestamp = Date.now();
      const fileName = `rentals/${rentalId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        imageUrls.push(downloadUrl);
      } catch (uploadError) {
        console.error(`Error uploading ${fileName}:`, uploadError);
        throw uploadError;
      }
    }
    setUploadProgress('');
    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour continuer',
      });
      router.push('/login');
      return;
    }

    if (!formData.title || !formData.pricePerDay) {
      toast({
        variant: 'destructive',
        title: 'Champs requis',
        description: 'Veuillez remplir au moins le titre et le prix par jour',
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
      const rentalId = `${user.uid}_${Date.now()}`;
      const rentalRef = doc(firestore, 'rentals', rentalId);

      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        toast({
          title: 'Upload en cours...',
          description: 'Vos photos sont en cours de téléchargement',
        });
        imageUrls = await uploadImages(rentalId);
      }

      const rentalData: any = {
        userId: user.uid,
        title: formData.title || `${formData.make} ${formData.model}`,
        make: formData.make || null,
        model: formData.model || null,
        description: formData.description,
        pricePerDay: parseFloat(formData.pricePerDay),
        seats: formData.seats ? parseInt(formData.seats) : null,
        location: formData.location || null,
        imageUrls: imageUrls,
        createdAt: serverTimestamp(),
        status: 'active',
      };

      if (formData.pricePerHour) {
        rentalData.pricePerHour = parseFloat(formData.pricePerHour);
      }
      if (formData.pricePerWeek) {
        rentalData.pricePerWeek = parseFloat(formData.pricePerWeek);
      }

      await setDoc(rentalRef, rentalData);

      toast({
        title: 'Annonce publiée ! 🎉',
        description: 'Votre véhicule de location est maintenant en ligne',
      });

      router.push('/vehicleRentalListings');
    } catch (error: any) {
      console.error('Error creating rental:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de publier l\'annonce',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <Link href="/vehicleRentalListings" passHref>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Louer un véhicule</h1>
      </header>

      <main className="p-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              
              <div className="grid grid-cols-3 gap-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {selectedImages.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Ajouter</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Maximum 5 photos. Formats: JPG, PNG
              </p>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'annonce *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ex: Toyota Yaris à louer"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Marque</Label>
                  <Input
                    id="make"
                    name="make"
                    placeholder="Ex: Toyota"
                    value={formData.make}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Modèle</Label>
                  <Input
                    id="model"
                    name="model"
                    placeholder="Ex: Yaris"
                    value={formData.model}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localisation
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Ex: Kinshasa, Gombe"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerHour">Prix/heure ($)</Label>
                  <Input
                    id="pricePerHour"
                    name="pricePerHour"
                    type="number"
                    placeholder="0.00"
                    value={formData.pricePerHour}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerDay">Prix/jour ($) *</Label>
                  <Input
                    id="pricePerDay"
                    name="pricePerDay"
                    type="number"
                    placeholder="0.00"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerWeek">Prix/semaine ($)</Label>
                  <Input
                    id="pricePerWeek"
                    name="pricePerWeek"
                    type="number"
                    placeholder="0.00"
                    value={formData.pricePerWeek}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seats">Nombre de places</Label>
                <Input
                  id="seats"
                  name="seats"
                  type="number"
                  placeholder="Ex: 5"
                  value={formData.seats}
                  onChange={handleInputChange}
                  min="2"
                  max="20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Décrivez votre véhicule en détail..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 text-lg"
            disabled={isLoading || isUserLoading || !user}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {uploadProgress || 'Publication...'}
              </>
            ) : isUserLoading ? (
              'Chargement...'
            ) : !user ? (
              'Connectez-vous pour continuer'
            ) : (
              'Publier l\'annonce'
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}

