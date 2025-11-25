'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ShieldCheck, Star, CheckCircle2, AlertTriangle, Clock, Loader2, Mail, Phone, User, Car } from 'lucide-react';
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
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  vehicleType: string;
  message: string;
}

export default function InsuranceProvidersPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    vehicleType: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        variant: 'destructive',
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Firestore
      if (firestore) {
        await addDoc(collection(firestore, 'insuranceRequests'), {
          userId: user?.uid || null,
          providerName: selectedProvider,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          vehicleType: formData.vehicleType,
          message: formData.message,
          status: 'pending',
          createdAt: serverTimestamp(),
        });
      }

      toast({
        title: "Demande enregistrée ! 🎉",
        description: "Nous vous contacterons dès qu'un partenariat sera établi avec une compagnie d'assurance.",
      });
      
      setIsDialogOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        vehicleType: '',
        message: '',
      });
    } catch (error) {
      console.error('Error saving insurance request:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'enregistrer votre demande. Veuillez réessayer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDialog = (providerName: string) => {
    setSelectedProvider(providerName);
    // Pre-fill with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phone: user.phoneNumber || '',
      }));
    }
    setIsDialogOpen(true);
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
        {/* Important Notice Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Service en cours de développement
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              <strong>Note importante :</strong> Nous n'avons actuellement aucun partenariat avec les compagnies d'assurance listées ci-dessous. 
              Ces offres sont présentées à titre indicatif. Nous travaillons activement pour vous proposer des partenariats officiels dans les jours à venir.
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 font-medium">
              En soumettant le formulaire, vous manifestez votre intérêt et serez contacté dès qu'un partenariat sera établi.
            </p>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
          <ShieldCheck className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold text-primary">Pourquoi s'assurer ?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Roulez en toute sécurité avec une assurance adaptée. Comparez les offres et manifestez votre intérêt pour la protection adaptée à vos besoins.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {insuranceProviders.map((provider) => (
            <Card key={provider.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300 relative">
              {/* Coming Soon Badge */}
              <div className="absolute top-3 right-3 z-10">
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Bientôt disponible
                </Badge>
              </div>
              
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
                </div>
                <Badge variant="secondary" className="font-semibold text-primary bg-primary/10 hover:bg-primary/20 w-fit mt-2">
                  {provider.price}
                </Badge>
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
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm h-11"
                  onClick={() => openDialog(provider.name)}
                >
                  Manifester mon intérêt
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* Subscription Interest Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Formulaire d'intérêt
            </DialogTitle>
            <DialogDescription className="text-left">
              Vous êtes intéressé par <strong className="text-primary">{selectedProvider}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          {/* Warning Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>⚠️ Rappel :</strong> Ce formulaire enregistre votre intérêt. Aucun engagement ni paiement n'est requis. 
              Nous vous contacterons dès qu'un partenariat officiel sera établi avec cette compagnie.
            </p>
          </div>
          
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Nom complet *
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Ex: Jean Kabongo"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Téléphone *
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+243 XXX XXX XXX"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicleType" className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                Type de véhicule
              </Label>
              <Input
                id="vehicleType"
                name="vehicleType"
                placeholder="Ex: Toyota Land Cruiser 2020"
                value={formData.vehicleType}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Décrivez vos besoins en assurance..."
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <DialogFooter className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Enregistrer mon intérêt"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
