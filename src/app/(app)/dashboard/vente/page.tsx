

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Données factices pour l'exemple
const userVehicles = [
  { id: '1', name: 'Toyota Prado 2021', price: '45,000', status: 'En ligne', imageId: 'car-tesla-model-3' },
  { id: '2', name: 'BMW X5 2019', price: '38,500', status: 'En attente', imageId: 'car-bmw-series-3' },
];

export default function SalesDashboardPage() {
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
        <p className="text-sm text-muted-foreground">Gérez vos véhicules en vente ici. Vous pouvez en ajouter, les modifier ou les supprimer.</p>
        
        {userVehicles.length === 0 ? (
             <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold">Aucun véhicule en vente</h3>
                <p className="text-muted-foreground mt-2 max-w-md">Commencez par ajouter votre premier véhicule pour le vendre sur notre plateforme.</p>
                <Link href="/dashboard/vente/nouveau" passHref>
                     <Button className="mt-4">
                         <PlusCircle className="mr-2 h-5 w-5" />
                         Mettre un véhicule en vente
                     </Button>
                </Link>
             </div>
        ) : (
            <div className="space-y-4">
                {userVehicles.map((vehicle) => {
                    const vehicleImage = PlaceHolderImages.find(p => p.id === vehicle.imageId);
                    return (
                        <Card key={vehicle.id} className="shadow-md">
                            <CardContent className="p-4 flex items-center gap-4">
                                {vehicleImage && (
                                    <Image
                                        src={vehicleImage.imageUrl}
                                        alt={vehicle.name}
                                        width={100}
                                        height={75}
                                        className="rounded-lg object-cover aspect-[4/3]"
                                        data-ai-hint={vehicleImage.imageHint}
                                    />
                                )}
                                <div className="flex-grow">
                                    <h3 className="font-bold">{vehicle.name}</h3>
                                    <p className="text-primary font-semibold">${vehicle.price}</p>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${vehicle.status === 'En ligne' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {vehicle.status}
                                    </span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Modifier
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        )}
      </main>
    </div>
  );
}
