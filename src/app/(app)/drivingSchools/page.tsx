'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Car, MapPin, Clock, GraduationCap, AlertTriangle, Loader2, Mail, Phone, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  age: string;
  message: string;
}

export default function DrivingSchoolsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedSchool, setSelectedSchool] = useState<typeof drivingSchools[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
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
        await addDoc(collection(firestore, 'drivingSchoolRequests'), {
          userId: user?.uid || null,
          schoolName: selectedSchool?.name,
          schoolPackage: selectedSchool?.package,
          schoolPrice: selectedSchool?.price,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          age: formData.age,
          message: formData.message,
          status: 'pending',
          createdAt: serverTimestamp(),
        });
      }

      toast({
        title: "Demande enregistrée ! 🎉",
        description: "Nous vous contacterons dès qu'un partenariat sera établi avec une auto-école.",
      });
      
      setIsDialogOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        age: '',
        message: '',
      });
    } catch (error) {
      console.error('Error saving driving school request:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'enregistrer votre demande. Veuillez réessayer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDialog = (school: typeof drivingSchools[0]) => {
    setSelectedSchool(school);
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
        <h1 className="text-xl font-bold text-foreground">Auto-écoles</h1>
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
              <strong>Note importante :</strong> Nous n'avons actuellement aucun partenariat avec les auto-écoles listées ci-dessous. 
              Ces offres sont présentées à titre indicatif. Nous travaillons activement pour vous proposer des partenariats officiels dans les jours à venir.
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 font-medium">
              En soumettant le formulaire, vous manifestez votre intérêt et serez contacté dès qu'un partenariat sera établi.
            </p>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-start gap-3">
          <GraduationCap className="h-6 w-6 text-accent mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold text-accent-foreground">Apprenez à conduire</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Trouvez l'auto-école idéale près de chez vous et manifestez votre intérêt pour obtenir votre permis en toute confiance.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {drivingSchools.map((school) => (
            <Card key={school.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300 relative">
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
                </div>
                <Badge className="font-bold text-lg bg-primary hover:bg-primary/90 text-primary-foreground w-fit mt-2">
                  {school.price}
                </Badge>
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
                <Button
                  className={`w-full ${school.color} hover:opacity-90 text-primary-foreground font-semibold shadow-sm h-11`}
                  onClick={() => openDialog(school)}
                >
                  Manifester mon intérêt
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* Registration Interest Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Formulaire d'intérêt
            </DialogTitle>
            <DialogDescription className="text-left">
              Vous êtes intéressé par <strong className="text-primary">{selectedSchool?.name}</strong> - {selectedSchool?.package}.
            </DialogDescription>
          </DialogHeader>
          
          {/* Warning Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>⚠️ Rappel :</strong> Ce formulaire enregistre votre intérêt. Aucun engagement ni paiement n'est requis. 
              Nous vous contacterons dès qu'un partenariat officiel sera établi avec cette auto-école.
            </p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
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
              <Label htmlFor="age" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Âge
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="Ex: 25"
                value={formData.age}
                onChange={handleInputChange}
                min={16}
                max={80}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Décrivez vos besoins ou posez vos questions..."
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            {/* Selected package info */}
            {selectedSchool && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium">Forfait sélectionné :</p>
                <p className="text-sm text-muted-foreground">{selectedSchool.package}</p>
                <p className="text-sm font-bold text-primary">{selectedSchool.price} - {selectedSchool.duration}</p>
              </div>
            )}
            
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
