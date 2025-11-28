'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Bell, MessageSquare, Heart, ShoppingCart, Tag, CheckCircle2, Loader2, Trash2, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'favorite' | 'vehicle_sold' | 'part_sold' | 'rental_booked' | 'new_offer' | 'system';
  title: string;
  body: string;
  data?: {
    vehicleId?: string;
    partId?: string;
    rentalId?: string;
    conversationId?: string;
    messagePreview?: string;
    senderName?: string;
    senderPhoto?: string;
  };
  read: boolean;
  createdAt: Timestamp;
  imageUrl?: string;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return MessageSquare;
    case 'favorite':
      return Heart;
    case 'vehicle_sold':
    case 'part_sold':
    case 'rental_booked':
      return CheckCircle2;
    case 'new_offer':
      return Tag;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
    case 'favorite':
      return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
    case 'vehicle_sold':
    case 'part_sold':
    case 'rental_booked':
      return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
    case 'new_offer':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getNotificationLink = (notification: Notification) => {
  if (notification.data?.conversationId) {
    return `/messages`;
  }
  if (notification.data?.vehicleId) {
    return `/vehicles/${notification.data.vehicleId}`;
  }
  if (notification.data?.partId) {
    return `/parts/${notification.data.partId}`;
  }
  if (notification.data?.rentalId) {
    return `/vehicleRentalListings/${notification.data.rentalId}`;
  }
  return null;
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { permission, isSupported, requestPermission } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Request notification permission on mount if not already granted
  useEffect(() => {
    if (isSupported && permission === 'default') {
      requestPermission();
    }
  }, [isSupported, permission, requestPermission]);

  // Subscribe to notifications
  useEffect(() => {
    if (!user || !firestore) {
      setIsLoading(false);
      return;
    }

    const notificationsRef = collection(firestore, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      let unread = 0;
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        notifs.push({
          id: docSnap.id,
          ...data,
        } as Notification);
        if (!data.read) unread++;
      });
      
      setNotifications(notifs);
      setUnreadCount(unread);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const markAsRead = async (notificationId: string) => {
    if (!firestore) return;

    try {
      const notifRef = doc(firestore, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!firestore || !user) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const promises = unreadNotifications.map(notif => {
        const notifRef = doc(firestore, 'notifications', notif.id);
        return updateDoc(notifRef, { read: true });
      });
      await Promise.all(promises);
      toast({ title: 'Toutes les notifications ont été marquées comme lues' });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de marquer toutes les notifications comme lues',
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!firestore) return;

    try {
      const notifRef = doc(firestore, 'notifications', notificationId);
      await deleteDoc(notifRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer la notification',
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    const link = getNotificationLink(notification);
    if (link) {
      router.push(link);
    }
  };

  const formatTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
        <Bell className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-muted-foreground text-center mb-4">
          Vous devez être connecté pour voir vos notifications.
        </p>
        <Link href="/login">
          <Button>Se connecter</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background p-4 flex items-center justify-between gap-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/home">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Tout marquer lu
          </Button>
        )}
      </header>

      <main className="p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Aucune notification pour le moment
            </p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Vous recevrez des notifications ici pour vos messages, favoris et activités
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const link = getNotificationLink(notification);

            const cardContent = (
              <Card className={cn(
                "border-none shadow-sm hover:shadow-md cursor-pointer",
                !notification.read && "bg-primary/5"
              )}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      getNotificationColor(notification.type)
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.body}
                          </p>
                          {notification.data?.messagePreview && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              "{notification.data.messagePreview}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 shrink-0">
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Sender info for messages */}
                      {notification.type === 'message' && notification.data?.senderName && (
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-6 w-6">
                            {notification.data.senderPhoto && (
                              <AvatarImage src={notification.data.senderPhoto} />
                            )}
                            <AvatarFallback className="text-xs">
                              {notification.data.senderName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {notification.data.senderName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

            if (link) {
              return (
                <Link key={notification.id} href={link} onClick={() => handleNotificationClick(notification)}>
                  {cardContent}
                </Link>
              );
            }

            return (
              <div key={notification.id} onClick={() => handleNotificationClick(notification)}>
                {cardContent}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}

