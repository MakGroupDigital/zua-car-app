
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const logoImage = PlaceHolderImages.find(p => p.id === 'app-logo');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Zua-Car !",
      });
      router.push('/home');
    } catch (error: any) {
      console.error("Login Error:", error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message || "Impossible de se connecter. Veuillez vérifier vos identifiants.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          {logoImage && (
            <div className="mx-auto mb-4 relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
              <Image
                src={logoImage.imageUrl}
                alt="Zua-Car Logo"
                fill
                className="object-cover"
                data-ai-hint={logoImage.imageHint}
              />
            </div>
          )}
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="votre@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                          aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between text-sm">
                <div />
                <Link href="/forgot-password" passHref>
                  <span className="cursor-pointer font-medium text-primary hover:underline">Mot de passe oublié ?</span>
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Chargement...' : 'Se connecter'}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            Pas encore de compte ?{' '}
            <Link href="/signup" passHref>
              <span className="cursor-pointer font-medium text-primary hover:underline">Inscrivez-vous</span>
            </Link>
          </div>
          <div className="my-4 flex items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="mx-4 flex-shrink text-xs text-muted-foreground">OU</span>
              <div className="flex-grow border-t border-border"></div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mb-3" 
            onClick={async () => {
              setIsLoading(true);
              try {
                const provider = new GoogleAuthProvider();
                const userCredential = await signInWithPopup(auth, provider);
                const user = userCredential.user;

                // Check if user profile exists
                if (firestore) {
                  const userDocRef = doc(firestore, 'users', user.uid);
                  const userDoc = await getDoc(userDocRef);

                  if (!userDoc.exists() || !userDoc.data()?.firstName) {
                    // Create or update user profile with Google data
                    const displayName = user.displayName || '';
                    const nameParts = displayName.split(' ');
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';

                    await setDoc(userDocRef, {
                      id: user.uid,
                      firstName: firstName || user.email?.split('@')[0] || 'Utilisateur',
                      lastName: lastName,
                      email: user.email,
                      photoURL: user.photoURL,
                      registrationDate: serverTimestamp(),
                    }, { merge: true });

                    toast({
                      title: "Connexion réussie",
                      description: "Bienvenue sur Zua-Car !",
                    });
                    router.push('/home');
                  } else {
                    // Profile exists, go to home
                    toast({
                      title: "Connexion réussie",
                      description: "Bienvenue sur Zua-Car !",
                    });
                    router.push('/home');
                  }
                } else {
                  router.push('/home');
                }
              } catch (error: any) {
                console.error("Google Sign-In Error:", error);
                toast({
                  variant: "destructive",
                  title: "Erreur de connexion",
                  description: error.message || "Impossible de se connecter avec Google.",
                });
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Se connecter avec Google
          </Button>
          
          {/* Temporairement désactivé - Authentification par téléphone */}
          {/* <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => router.push('/phone-login')}
            disabled={isLoading}
          >
            Se connecter avec un numéro de téléphone
          </Button> */}

        </CardContent>
      </Card>
    </div>
  );
}
