'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    title: string;
    description?: string;
    status: string;
    createdAt: any;
}

export default function SalesDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user's vehicles from Firestore
    useEffect(() => {
        const fetchVehicles = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const vehiclesRef = collection(firestore, 'vehicles');
                const q = query(
                    vehiclesRef,
                    where('userId', '==', user.uid)
                );

                const querySnapshot = await getDocs(q);
                const vehiclesData: Vehicle[] = [];

                querySnapshot.forEach((doc) => {
                    vehiclesData.push({
                        id: doc.id,
                        ...doc.data()
                    } as Vehicle);
                });

                setVehicles(vehiclesData);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
                toast({
                    variant: 'destructive',
                    title: 'Erreur',
                    description: 'Impossible de charger vos véhicules',
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (!isUserLoading) {
            fetchVehicles();
        }
    }, [user, isUserLoading, firestore, toast]);

    const handleDelete = async (vehicleId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
            return;
        }

        try {
            await deleteDoc(doc(firestore, 'vehicles', vehicleId));

            // Remove from local state
            setVehicles(vehicles.filter(v => v.id !== vehicleId));

            toast({
                title: 'Véhicule supprimé',
                description: 'Le véhicule a été supprimé avec succès',
            });
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de supprimer le véhicule',
            });
        }
    };

    return (
        <div className="min-h-screen bg-muted">
            <header className="bg-background p-4 flex items-center justify-between gap-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <Link href="/home" passHref>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Mes Ventes</h1>
                </div>
                <Link href="/dashboard/vente/nouveau" passHref>
                    <Button>
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Ajouter
                    </Button>
                </Link>
            </header>
            <main className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                    Gérez vos véhicules en vente ici. Vous pouvez en ajouter, les modifier ou les supprimer.
                </p>

                {isLoading || isUserLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground mt-4">Chargement de vos véhicules...</p>
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
                        <h3 className="text-lg font-semibold">Aucun véhicule en vente</h3>
                        <p className="text-muted-foreground mt-2 max-w-md">
                            Commencez par ajouter votre premier véhicule pour le vendre sur notre plateforme.
                        </p>
                        <Link href="/dashboard/vente/nouveau" passHref>
                            <Button className="mt-4">
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Mettre un véhicule en vente
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {vehicles.map((vehicle) => {
                            // Use a placeholder image for now
                            const vehicleImage = PlaceHolderImages.find(p => p.id === 'car-tesla-model-3');

                            return (
                                <Link href={`/dashboard/vente/${vehicle.id}`} passHref key={vehicle.id}>
                                    <Card className="shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            {vehicleImage && (
                                                <Image
                                                    src={vehicleImage.imageUrl}
                                                    alt={vehicle.title}
                                                    width={100}
                                                    height={75}
                                                    className="rounded-lg object-cover aspect-[4/3]"
                                                    data-ai-hint={vehicleImage.imageHint}
                                                />
                                            )}
                                            <div className="flex-grow">
                                                <h3 className="font-bold">{vehicle.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {vehicle.make} {vehicle.model} - {vehicle.year}
                                                </p>
                                                <p className="text-primary font-semibold mt-1">${vehicle.price.toLocaleString()}</p>
                                                <span
                                                    className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-2 ${vehicle.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    {vehicle.status === 'active' ? 'En ligne' : 'En attente'}
                                                </span>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                        <MoreVertical className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Modifier
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(vehicle.id); }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
