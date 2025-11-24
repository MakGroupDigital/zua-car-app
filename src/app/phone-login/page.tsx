
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const phoneFormSchema = z.object({
  phoneNumber: z.string().min(9, { message: "Le numéro de téléphone est trop court." }),
});

const otpFormSchema = z.object({
  otp: z.string().length(6, { message: "Le code doit contenir 6 chiffres." }),
});

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function PhoneLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const logoImage = PlaceHolderImages.find(p => p.id === 'app-logo');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);

  const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phoneNumber: "+243" },
  });

  const otpForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: "" },
  });
  
  useEffect(() => {
    if (auth && !window.recaptchaVerifier?.auth) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            },
        });
    }
  }, [auth]);

  const onPhoneSubmit = async (values: z.infer<typeof phoneFormSchema>) => {
    setIsLoading(true);
    try {
      const verifier = window.recaptchaVerifier;
      if (!verifier) {
        throw new Error("Recaptcha verifier not initialized.");
      }
      const confirmationResult = await signInWithPhoneNumber(auth, values.phoneNumber, verifier);
      window.confirmationResult = confirmationResult;
      setShowOtpForm(true);
      toast({
        title: "Code envoyé",
        description: "Un code de vérification a été envoyé à votre téléphone.",
      });
    } catch (error: any) {
      console.error("Phone Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le code.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (values: z.infer<typeof otpFormSchema>) => {
    setIsLoading(true);
    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        throw new Error("Confirmation result not available.");
      }
      const userCredential = await confirmationResult.confirm(values.otp);
      const user = userCredential.user;

      // Check if user profile exists
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data()?.firstName) {
        // User profile is complete, go to home
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Zua-Car !",
        });
        router.push('/home');
      } else {
        // New user or incomplete profile, go to complete profile page
        toast({
          title: "Connexion réussie",
          description: "Veuillez compléter votre profil.",
        });
        router.push('/complete-profile');
      }
    } catch (error: any) {
      console.error("OTP Error:", error);
      toast({
        variant: "destructive",
        title: "Erreur de vérification",
        description: error.message || "Le code est incorrect.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-2xl relative">
        <CardHeader className="text-center">
           <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-10" onClick={() => showOtpForm ? setShowOtpForm(false) : router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {logoImage && !showOtpForm && (
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
          <CardTitle className="text-center text-2xl font-bold pt-8">
            {showOtpForm ? "Vérifier le code" : "Connexion par téléphone"}
          </CardTitle>
          <CardDescription className="text-center">
            {showOtpForm ? "Entrez le code à 6 chiffres que vous avez reçu." : "Entrez votre numéro de téléphone pour vous connecter."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showOtpForm ? (
             <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
                <FormField
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+243 XXX XXX XXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Envoi en cours...' : 'Envoyer le code'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code de vérification</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Vérification...' : 'Vérifier et se connecter'}
                </Button>
              </form>
            </Form>
          )}
          <div id="recaptcha-container"></div>
        </CardContent>
      </Card>
    </div>
  );
}
