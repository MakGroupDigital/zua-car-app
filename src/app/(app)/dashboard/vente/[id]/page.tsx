'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function VehicleDetailPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { id } = useParams(); // vehicle document id

    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicle = async () => {
            if (!user) {
                toast({
                    variant: 'destructive',
                    title: 'Erreur',
                    description: 'Vous devez être connecté pour voir le véhicule',
                });
                router.push('/dashboard/vente');
                return;
            }
            try {
                const docRef = doc(firestore, 'vehicles', id as string);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setVehicle({ id: snap.id, ...snap.data() });
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Erreur',
                        description: 'Véhicule non trouvé',
                    });
                    router.push('/dashboard/vente');
                }
            } catch (error) {
                console.error('Error fetching vehicle:', error);
                toast({
                    variant: 'destructive',
                    title: 'Erreur',
                    description: 'Impossible de charger le véhicule',
                });
                router.push('/dashboard/vente');
            } finally {
                setLoading(false);
            }
        };
        if (!isUserLoading) {
            fetchVehicle();
        }
    }, [user, isUserLoading, firestore, id, router, toast]);

    if (loading || isUserLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Chargement du véhicule...</p>
            </div>
        );
    }

    if (!vehicle) return null; // already redirected on error

    const vehicleImage = PlaceHolderImages.find(p => p.id === 'car-tesla-model-3'); // placeholder

    return (
        <div className="min-h-screen bg-muted p-4">
            <header className="bg-background p-4 flex items-center gap-4 shadow-sm mb-4">
                <Link href="/dashboard/vente" passHref>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">Détails du véhicule</h1>
            </header>
            <Card className="max-w-2xl mx-auto shadow-md">
                <CardHeader>
                    <CardTitle>{vehicle.title || `${vehicle.make} ${vehicle.model}`}</CardTitle>
                    <CardDescription>{vehicle.description || 'Aucune description fournie.'}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    {vehicleImage && (
                        <Image
                            src={vehicleImage.imageUrl}
                            alt={vehicle.title}
                            width={300}
                            height={225}
                            className="rounded-lg object-cover"
                            data-ai-hint={vehicleImage.imageHint}
                        />
                    )}
                    <ul className="space-y-2 w-full">
                        <li><strong>Marque:</strong> {vehicle.make}</li>
                        <li><strong>Modèle:</strong> {vehicle.model}</li>
                        <li><strong>Année:</strong> {vehicle.year}</li>
                        <li><strong>Prix:</strong> ${vehicle.price?.toLocaleString()}</li>
                        <li><strong>Status:</strong> {vehicle.status}</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
