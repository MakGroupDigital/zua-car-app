'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Camera, X } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useStorage } from '@/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

export default function AddVehiclePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const storage = useStorage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        price: '',
        description: '',
    });
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Debug: Log user state
    useEffect(() => {
        console.log('User state:', { user, isUserLoading, uid: user?.uid });
    }, [user, isUserLoading]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isUserLoading && !user) {
            toast({
                variant: 'destructive',
                title: 'Non connecté',
                description: 'Vous devez être connecté pour ajouter un véhicule',
            });
        }
    }, [user, isUserLoading, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileSelect = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset to allow selecting same file again
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Limit to 5 images
        const newFiles = [...selectedImages, ...files].slice(0, 5);
        setSelectedImages(newFiles);

        // Create previews
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(newPreviews);

        toast({
            title: 'Photos ajoutées',
            description: `${newFiles.length} photo(s) sélectionnée(s)`,
        });
    };

    const handleRemoveImage = (index: number) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);

        // Revoke the URL to free memory
        URL.revokeObjectURL(imagePreviews[index]);

        setSelectedImages(newImages);
        setImagePreviews(newPreviews);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );

        if (files.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Veuillez déposer uniquement des fichiers image',
            });
            return;
        }

        // Limit to 5 images
        const newFiles = [...selectedImages, ...files].slice(0, 5);
        setSelectedImages(newFiles);

        // Create previews
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(newPreviews);

        toast({
            title: 'Photos ajoutées',
            description: `${newFiles.length} photo(s) sélectionnée(s)`,
        });
    };

    const [uploadProgress, setUploadProgress] = useState<string>('');

    const uploadImages = async (vehicleId: string): Promise<string[]> => {
        const imageUrls: string[] = [];
        
        for (let i = 0; i < selectedImages.length; i++) {
            const file = selectedImages[i];
            setUploadProgress(`Upload image ${i + 1}/${selectedImages.length}...`);
            
            try {
                // Create a unique filename - remove special characters from filename
                const timestamp = Date.now();
                const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const fileName = `vehicles/${vehicleId}/${timestamp}_${safeName}`;
                
                console.log('Uploading file:', fileName, 'Size:', file.size);
                
                const storageRef = ref(storage, fileName);
                
                // Upload the file
                console.log('Starting upload...');
                const snapshot = await uploadBytes(storageRef, file);
                console.log('Upload complete:', snapshot.metadata.fullPath);
                
                // Get the download URL
                const downloadUrl = await getDownloadURL(storageRef);
                console.log('Download URL:', downloadUrl);
                
                imageUrls.push(downloadUrl);
            } catch (uploadError: any) {
                console.error('Error uploading image:', uploadError);
                toast({
                    variant: 'destructive',
                    title: 'Erreur upload',
                    description: `Erreur lors de l'upload de l'image ${i + 1}: ${uploadError.message || uploadError.code || 'Erreur inconnue'}`,
                });
                throw uploadError;
            }
        }
        
        setUploadProgress('');
        return imageUrls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('handleSubmit called - User state:', { user, uid: user?.uid, isUserLoading });

        // Validation
        if (!formData.make || !formData.model || !formData.year || !formData.price) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Veuillez remplir tous les champs obligatoires',
            });
            return;
        }

        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Vous devez être connecté pour ajouter un véhicule',
            });
            return;
        }

        setIsLoading(true);

        try {
            const vehicleId = `${user.uid}_${Date.now()}`;
            const vehicleRef = doc(firestore, 'vehicles', vehicleId);

            // Upload images to Firebase Storage
            let imageUrls: string[] = [];
            if (selectedImages.length > 0) {
                toast({
                    title: 'Upload en cours...',
                    description: 'Vos photos sont en cours de téléchargement',
                });
                imageUrls = await uploadImages(vehicleId);
            }

            // Save vehicle data with image URLs
            await setDoc(vehicleRef, {
                userId: user.uid,
                make: formData.make,
                model: formData.model,
                year: parseInt(formData.year),
                price: parseFloat(formData.price),
                description: formData.description,
                title: `${formData.make} ${formData.model} ${formData.year}`,
                imageUrls: imageUrls,
                createdAt: serverTimestamp(),
                status: 'active',
            }, { merge: true });

            toast({
                title: 'Véhicule ajouté !',
                description: `Votre véhicule a été mis en vente avec ${imageUrls.length} photo(s)`,
            });

            // Clean up image previews
            imagePreviews.forEach(url => URL.revokeObjectURL(url));

            // Redirect to vehicles list
            router.push('/dashboard/vente');
        } catch (error) {
            console.error('Error adding vehicle:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible d\'ajouter le véhicule. Veuillez réessayer.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted">
            <header className="bg-background p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
                <Link href="/dashboard/vente" passHref>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">Ajouter un véhicule</h1>
            </header>
            <main className="p-4">
                <form onSubmit={handleSubmit}>
                    <Card className="max-w-2xl mx-auto shadow-md">
                        <CardHeader>
                            <CardTitle>Détails du véhicule</CardTitle>
                            <CardDescription>
                                Remplissez les informations ci-dessous pour mettre votre véhicule en vente.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="make">Marque *</Label>
                                <Input
                                    id="make"
                                    placeholder="Ex: Toyota"
                                    value={formData.make}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Modèle *</Label>
                                <Input
                                    id="model"
                                    placeholder="Ex: Prado"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="year">Année *</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        placeholder="Ex: 2021"
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Prix ($) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="Ex: 45000"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Décrivez l'état du véhicule, ses caractéristiques, etc."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Photos (max 5)</Label>
                                <div
                                    className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={(e) => handleFileSelect(e)}
                                >
                                    <Camera className="h-10 w-10 mb-2" />
                                    <p className="font-semibold">Télécharger des photos</p>
                                    <p className="text-xs">
                                        Faites glisser et déposez ou cliquez pour sélectionner des fichiers.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={(e) => handleFileSelect(e)}
                                    >
                                        Choisir des fichiers
                                    </Button>
                                </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />

                                {/* Image Previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveImage(index);
                                                    }}
                                                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading || isUserLoading || !user}>
                                {isLoading 
                                    ? (uploadProgress || 'Enregistrement...') 
                                    : isUserLoading 
                                        ? 'Chargement...' 
                                        : !user 
                                            ? 'Connectez-vous pour continuer' 
                                            : 'Mettre en vente'}
                            </Button>
                            {!isUserLoading && !user && (
                                <p className="text-sm text-destructive text-center mt-2">
                                    Vous devez être <Link href="/login" className="underline font-medium">connecté</Link> pour ajouter un véhicule.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </form>
            </main>
        </div>
    );
}
