

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Camera } from 'lucide-react';
import Link from 'next/link';

export default function AddVehiclePage() {
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
        <Card className="max-w-2xl mx-auto shadow-md">
            <CardHeader>
                <CardTitle>Détails du véhicule</CardTitle>
                <CardDescription>Remplissez les informations ci-dessous pour mettre votre véhicule en vente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="make">Marque</Label>
                    <Input id="make" placeholder="Ex: Toyota" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="model">Modèle</Label>
                    <Input id="model" placeholder="Ex: Prado" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="year">Année</Label>
                        <Input id="year" type="number" placeholder="Ex: 2021" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="price">Prix ($)</Label>
                        <Input id="price" type="number" placeholder="Ex: 45000" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Décrivez l'état du véhicule, ses caractéristiques, etc." />
                </div>
                <div className="space-y-2">
                    <Label>Photos</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
                        <Camera className="h-10 w-10 mb-2"/>
                        <p className="font-semibold">Télécharger des photos</p>
                        <p className="text-xs">Faites glisser et déposez ou cliquez pour sélectionner des fichiers.</p>
                        <Button variant="outline" size="sm" className="mt-4">
                            Choisir des fichiers
                        </Button>
                    </div>
                </div>
                <Button className="w-full">Mettre en vente</Button>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
