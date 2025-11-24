
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function SplashScreen() {
  const router = useRouter();
  const { user, isUserLoading, userError } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const logoImage = PlaceHolderImages.find(p => p.id === 'app-logo');

  useEffect(() => {
    // Wait until Firebase has determined the auth state
    if (isUserLoading) {
      return;
    }

    if (userError) {
      toast({
        variant: 'destructive',
        title: 'Erreur d\'authentification',
        description: userError.message,
      });
      // Even on error, proceed to login to allow a retry
      router.replace('/login');
      return;
    }

    const checkUserProfile = async () => {
      if (user) {
        // User is logged in, check if profile is complete
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data()?.firstName) {
            // Profile is complete, go to home
            router.replace('/home');
          } else {
            // Profile is incomplete, go to complete-profile
            router.replace('/complete-profile');
          }
        } catch (error) {
          console.error("Error checking user profile:", error);
          toast({
            variant: "destructive",
            title: "Erreur de profil",
            description: "Impossible de vérifier le profil utilisateur."
          });
          // Fallback to home, maybe they can still use the app
          router.replace('/home');
        }
      } else {
        // User is not logged in, go to login
        router.replace('/login');
      }
    };

    // Give a little time for the splash screen to be visible
    const timer = setTimeout(() => {
      checkUserProfile();
    }, 1500); 

    return () => clearTimeout(timer);

  }, [user, isUserLoading, userError, router, firestore, toast]);

  return (
    <div className={cn(
      "flex h-screen flex-col items-center justify-center bg-primary text-primary-foreground",
    )}>
      <div className="flex flex-col items-center gap-8">
        {logoImage && (
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white/50 shadow-lg animate-pulse">
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
        <div className="flex items-center gap-4 text-white">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-lg font-semibold">Chargement...</p>
        </div>
      </div>
    </div>
  );
}
