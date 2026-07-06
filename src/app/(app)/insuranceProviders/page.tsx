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
  usage: string;
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
    usage: '',
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
          usage: formData.usage,
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
        usage: '',
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
      <main className="p-4 max-w-3xl mx-auto space-y-6">
        <section className="rounded-[2rem] border border-white/50 bg-card/75 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-black text-transparent">
            Assurance
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Comparez les offres et demandez un devis selon votre véhicule et son usage.</p>
        </section>

        <div className="bg-primary/10 border border-primary/20 rounded-[1.5rem] p-4 flex items-start gap-3">
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
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className={`h-12 w-12 rounded-xl ${provider.color} flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm`}>
                      {provider.logo}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">{provider.name}</CardTitle>
                      <div className="flex items-center gap-1 text-accent mt-1">
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
                  Demander un devis
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
              <Label htmlFor="usage">Usage</Label>
              <select
                id="usage"
                name="usage"
                value={formData.usage}
                onChange={(e) => setFormData(prev => ({ ...prev, usage: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">Sélectionner</option>
                <option value="Personnel">Personnel</option>
                <option value="Location">Location</option>
                <option value="Transport professionnel">Transport professionnel</option>
                <option value="Entreprise">Entreprise</option>
              </select>
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
