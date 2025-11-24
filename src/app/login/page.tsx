
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
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 flex-shrink text-xs text-gray-500">OU</span>
              <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => router.push('/phone-login')}>
              Se connecter avec un numéro de téléphone
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
