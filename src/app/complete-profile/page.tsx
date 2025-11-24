
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }).optional().or(z.literal('')),
});

export default function CompleteProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const logoImage = PlaceHolderImages.find(p => p.id === 'app-logo');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      // If no user is logged in, redirect to login
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
        toast({ variant: "destructive", title: "Erreur", description: "Utilisateur non authentifié."});
        return;
    }
    setIsLoading(true);
    try {
      const userProfile = {
        id: user.uid,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || user.email || null,
        phoneNumber: user.phoneNumber,
        registrationDate: serverTimestamp(),
      };
      
      const userDocRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

      toast({
        title: "Profil complété !",
        description: "Bienvenue sur Zua-Car !",
      });
      router.push('/home');
    } catch (error: any) {
      console.error("Complete Profile Error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le profil.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className={cn(
        "flex h-screen flex-col items-center justify-center bg-background text-foreground",
      )}>
        <div className="flex flex-col items-center gap-8">
          {logoImage && (
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg animate-pulse">
              <Image
                src={logoImage.imageUrl}
                alt={logoImage.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={logoImage.imageHint}
              />
            </div>
          )}
          <div className="flex items-center gap-4 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-lg font-semibold">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Finaliser votre profil</CardTitle>
          <CardDescription className="text-center">
            Veuillez compléter vos informations pour continuer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!user.email && (
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email (Optionnel)</FormLabel>
                        <FormControl>
                        <Input placeholder="votre@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sauvegarde...' : 'Enregistrer et continuer'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
