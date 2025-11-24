'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShieldCheck, Star, CheckCircle2 } from 'lucide-react';
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

const insuranceProviders = [
  {
    id: 1,
    name: 'SafeDrive RDC',
    description: 'Assurance complète pour votre tranquillité d\'esprit. Couverture tous risques.',
    price: 'À partir de 50$ / mois',
    rating: 4.8,
    features: ['Assurance Tous Risques', 'Assistance 24/7', 'Véhicule de remplacement'],
    logo: 'SD',
    color: 'bg-primary'
  },
  {
    id: 2,
    name: 'AutoProtect Congo',
    description: 'La protection abordable pour tous les conducteurs. Responsabilité civile incluse.',
    price: 'À partir de 30$ / mois',
    rating: 4.5,
    features: ['Responsabilité Civile', 'Protection Juridique', 'Service rapide'],
    logo: 'AP',
    color: 'bg-accent'
  },
  {
    id: 3,
    name: 'Kinshasa Assur',
    description: 'L\'expert de l\'assurance auto à Kinshasa. Solutions sur mesure.',
    price: 'À partir de 45$ / mois',
    rating: 4.7,
    features: ['Vol et Incendie', 'Bris de glace', 'Remboursement valeur à neuf'],
    logo: 'KA',
    color: 'bg-primary/80'
  },
  {
    id: 4,
    name: 'Global Motors Insurance',
    description: 'Une couverture internationale pour vos véhicules de luxe et 4x4.',
    price: 'À partir de 80$ / mois',
    rating: 4.9,
    features: ['Couverture Internationale', 'Conducteur VIP', 'Dépannage 0km'],
    logo: 'GM',
    color: 'bg-accent/80'
  }
];

export default function InsuranceProvidersPage() {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubscribe = () => {
    // Ici, on pourrait ajouter la logique pour sauvegarder la demande dans Firestore
    console.log(`Souscription à ${selectedProvider}`);
    toast({
      title: "Demande envoyée !",
      description: `Votre demande de souscription pour ${selectedProvider} a été reçue. Un agent vous contactera bientôt.`,
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
        <h1 className="text-xl font-bold text-foreground">Assurance Auto</h1>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-6">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
          <ShieldCheck className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold text-primary">Pourquoi s'assurer ?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Roulez en toute sécurité avec nos partenaires certifiés. Comparez les offres et choisissez la protection adaptée à vos besoins.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {insuranceProviders.map((provider) => (
            <Card key={provider.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className={`h-12 w-12 rounded-xl ${provider.color} flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm`}>
                      {provider.logo}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">{provider.name}</CardTitle>
                      <div className="flex items-center gap-1 text-yellow-500 mt-1">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium text-muted-foreground">{provider.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-semibold text-primary bg-primary/10 hover:bg-primary/20">
                    {provider.price}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {provider.description}
                </p>
                <div className="space-y-2">
                  {provider.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-3 bg-muted/20 border-t">
                <Dialog open={isDialogOpen && selectedProvider === provider.name} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (open) setSelectedProvider(provider.name);
                }}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm h-11"
                      onClick={() => setSelectedProvider(provider.name)}
                    >
                      Souscrire maintenant
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmer la souscription</DialogTitle>
                      <DialogDescription>
                        Vous êtes sur le point de demander une souscription chez <strong>{provider.name}</strong>.
                        Voulez-vous continuer ?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                      <Button onClick={handleSubscribe}>Confirmer</Button>
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
