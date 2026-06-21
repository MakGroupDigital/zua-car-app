'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell, Loader2, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useLocation } from '@/hooks/use-location';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export function FloatingTopBar() {
  const { user } = useUser();
  const firestore = useFirestore();
  const logoImage = PlaceHolderImages.find(p => p.id === 'app-logo');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { location, currentTime, isLoading: isLocationLoading, permissionStatus, requestLocation } = useLocation();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc(userDocRef);

  useEffect(() => {
    if (!user || !firestore) return;

    const q = query(
      collection(firestore, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    return onSnapshot(q, (snapshot) => {
      setUnreadNotifications(snapshot.size);
    }, (error) => {
      console.error('Error fetching unread notifications:', error);
    });
  }, [user, firestore]);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    if (firstName) return firstName.substring(0, 2);
    return 'AU';
  };

  const userInitials = getInitials(userProfile?.firstName, userProfile?.lastName);
  const userPhotoURL = userProfile?.photoURL || user?.photoURL;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 pointer-events-none">
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/50 bg-background/75 p-3 shadow-2xl shadow-primary/10 backdrop-blur-2xl pointer-events-auto">
        <div className="flex items-center justify-between gap-3">
          {permissionStatus === 'granted' && location ? (
            <div className="flex min-w-0 items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-2">
              <div className="rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-2">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 leading-none">
                <p className="max-w-[96px] truncate text-xs font-bold text-primary">
                  {location.city}
                </p>
                {currentTime && <p className="text-[10px] text-muted-foreground">{currentTime}</p>}
              </div>
            </div>
          ) : (
            <button
              onClick={requestLocation}
              className={cn(
                'flex min-w-0 items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-2 transition-colors hover:bg-primary/10',
                isLocationLoading && 'cursor-wait opacity-70'
              )}
              disabled={isLocationLoading}
            >
              <div className="rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-2">
                {isLocationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <MapPin className="h-4 w-4 text-primary" />
                )}
              </div>
              <span className="hidden text-xs font-bold text-primary min-[390px]:inline">
                Localisation
              </span>
            </button>
          )}

          <Link href="/home" className="flex flex-1 justify-center">
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-primary-foreground shadow-lg">
              {logoImage && (
                <Image
                  src={logoImage.imageUrl}
                  alt={logoImage.description}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              )}
              <div className="leading-none">
                <p className="text-sm font-black tracking-wide">AUTONEX</p>
                <p className="text-[10px] opacity-80">Hub RDC</p>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/notifications" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-card shadow-lg transition-all duration-300 hover:scale-110 hover:bg-primary/10"
              >
                <Bell className="h-5 w-5 text-primary" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent text-xs font-bold text-primary-foreground shadow-lg">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/profile">
              <Avatar className="h-10 w-10 border-2 border-primary shadow-lg ring-2 ring-primary/20">
                {userPhotoURL ? (
                  <AvatarImage src={userPhotoURL} alt="Photo de profil" className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
