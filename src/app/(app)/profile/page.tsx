

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser, useFirestore, useDoc, useAuth, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, User, Settings, HelpCircle, LogOut, ArrowLeft, Shield, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const profileMenuItems = [
  { label: 'Modifier le profil', icon: User, href: '/profile/edit' },
  { label: 'Réglages du compte', icon: Settings, href: '/settings' },
  { label: 'Politique de confidentialité', icon: Shield, href: '/privacy' },
  { label: 'Termes et conditions', icon: FileText, href: '/terms' },
  { label: 'Centre d\'aide', icon: HelpCircle, href: '/help' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const userAvatar = PlaceHolderImages.find(p => p.id === 'avatar-1');
  const logoImage = PlaceHolderImages.find(p => p.id === 'app-logo');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      toast({
        title: 'Déconnexion réussie',
        description: 'À bientôt !',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de déconnexion',
        description: error.message || 'Impossible de se déconnecter.',
      });
      setIsLoggingOut(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    if (firstName) return firstName.substring(0, 2);
    return 'ZU';
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className={cn("flex h-screen flex-col items-center justify-center bg-background text-foreground")}>
        <div className="flex flex-col items-center gap-8">
          {logoImage && (
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg animate-pulse">
              <Image src={logoImage.imageUrl} alt={logoImage.description} fill className="object-cover" priority data-ai-hint={logoImage.imageHint} />
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

  const userInitials = getInitials(userProfile?.firstName, userProfile?.lastName);
  const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Utilisateur';
  const displayEmail = userProfile?.email || user?.email;
  const displayPhone = userProfile?.phoneNumber || user?.phoneNumber;

  return (
    <div className="bg-muted min-h-screen">
      <header className="bg-background p-4 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Profil</h1>
      </header>

      <main className="p-4 space-y-6">
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-4 border-primary/50">
              {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint} />}
              <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <div className="text-muted-foreground mt-2 space-y-1">
              {displayEmail && <p>{displayEmail}</p>}
              {displayPhone && <p>{displayPhone}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-0">
            <ul className="divide-y">
              {profileMenuItems.map((item, index) => (
                <li key={index}>
                  <button onClick={() => router.push(item.href)} className="w-full flex items-center p-4 text-left hover:bg-muted transition-colors">
                    <item.icon className="h-6 w-6 mr-4 text-primary" />
                    <span className="flex-grow font-medium">{item.label}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
           <CardContent className="p-0">
                <button onClick={handleLogout} disabled={isLoggingOut} className="w-full flex items-center p-4 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut className="h-6 w-6 mr-4" />
                    <span className="flex-grow font-semibold">Déconnexion</span>
                    {isLoggingOut && <Loader2 className="h-5 w-5 animate-spin"/>}
                </button>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
