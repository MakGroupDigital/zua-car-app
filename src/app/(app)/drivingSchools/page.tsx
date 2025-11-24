
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Car, MapPin, Clock, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const drivingSchools = [
  {
    id: 1,
    name: 'Auto-École Référence',
    location: 'Gombe, Kinshasa',
    price: '250$',
    package: 'Permis B - Complet',
    duration: '2 mois',
    features: ['Code de la route', '20h de conduite', 'Examen inclus'],
    color: 'bg-primary'
  },
  {
    id: 2,
    name: 'Conduite Pro',
    location: 'Lemba, Kinshasa',
    price: '200$',
    package: 'Permis B - Accéléré',
    duration: '1 mois',
    features: ['Code intensif', '15h de conduite', 'Suivi personnalisé'],
    color: 'bg-accent'
  },
  {
    id: 3,
    name: 'Excellence Driving',
    location: 'Ngaliema, Kinshasa',
    price: '300$',
    package: 'Permis B + Perfectionnement',
    duration: '3 mois',
    features: ['Code illimité', '30h de conduite', 'Conduite de nuit'],
    color: 'bg-primary/80'
  },
  {
    id: 4,
    name: 'Start & Go',
    location: 'Limete, Kinshasa',
    price: '180$',
    package: 'Permis B - Basique',
    duration: '1.5 mois',
    features: ['Code en ligne', '10h de conduite', 'Horaires flexibles'],
    color: 'bg-accent/80'
  }
];

export default function DrivingSchoolsPage() {
  const { toast } = useToast();
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRegister = () => {
    // Ici, on pourrait ajouter la logique pour sauvegarder l'inscription dans Firestore
    console.log(`Inscription à ${selectedSchool}`);
    toast({
      title: "Inscription envoyée !",
      description: `Votre demande d'inscription pour ${selectedSchool} a été reçue. L'école vous contactera bientôt.`,
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <header className="bg-background sticky top-0 z-10 border-b p-4 flex items-center gap-4 shadow-sm">
        <Link href="/home" passHref>
          <Button variant="ghost" size="icon" className="hover:bg-muted rounded-full">
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-foreground">Auto-écoles</h1>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-6">
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-start gap-3">
          <GraduationCap className="h-6 w-6 text-accent mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold text-accent-foreground">Apprenez à conduire</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Trouvez l'auto-école idéale près de chez vous et obtenez votre permis en toute confiance.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {drivingSchools.map((school) => (
            <Card key={school.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className={`h-12 w-12 rounded-xl ${school.color} flex items-center justify-center text-primary-foreground shadow-sm`}>
                      <Car className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">{school.name}</CardTitle>
                      <div className="flex items-center gap-1 text-muted-foreground mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="text-sm">{school.location}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="font-bold text-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                    {school.price}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-muted-foreground border-border">
                    {school.package}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full">
                    <Clock className="h-3 w-3" />
                    {school.duration}
                  </div>
                </div>
                <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
                  {school.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-foreground">
                      <div className={`h-1.5 w-1.5 rounded-full ${school.color}`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <Dialog open={isDialogOpen && selectedSchool === school.name} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (open) setSelectedSchool(school.name);
                }}>
                  <DialogTrigger asChild>
                    <Button
                      className={`w-full ${school.color} hover:opacity-90 text-primary-foreground font-semibold shadow-sm h-11`}
                      onClick={() => setSelectedSchool(school.name)}
                    >
                      S'inscrire
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmer l'inscription</DialogTitle>
                      <DialogDescription>
                        Vous êtes sur le point de vous inscrire à <strong>{school.name}</strong> pour le forfait <strong>{school.package}</strong>.
                        Voulez-vous continuer ?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                      <Button onClick={handleRegister}>Confirmer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
