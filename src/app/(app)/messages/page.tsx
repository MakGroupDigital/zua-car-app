'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, Search, MessageCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    addDoc, 
    doc, 
    getDoc,
    getDocs,
    updateDoc,
    serverTimestamp,
    Timestamp,
    limit
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { createMessageNotification } from '@/lib/notifications/create-notification';

interface Participant {
    id: string;
    name: string;
    photoURL?: string;
}

interface Conversation {
    id: string;
    participantIds: string[];
    participants: Participant[];
    lastMessage: string;
    lastMessageTime: Timestamp | null;
    vehicleId?: string;
    vehicleTitle?: string;
    partId?: string;
    partTitle?: string;
    rentalId?: string;
    rentalTitle?: string;
    unreadCount?: { [id: string]: number };
    createdAt: Timestamp;
}

interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    createdAt: Timestamp;
}

function MessagesPageContent() {
    const searchParams = useSearchParams();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const sellerIdParam = searchParams.get('sellerId');
    const vehicleIdParam = searchParams.get('vehicleId');
    const partIdParam = searchParams.get('partId');
    const rentalIdParam = searchParams.get('rentalId');
    const messageParam = searchParams.get('message');

    useEffect(() => {
        const createOrOpenConversation = async () => {
            if (!sellerIdParam || !user || !firestore) return;
            if (sellerIdParam === user.uid) {
                toast({
                    variant: 'destructive',
                    title: 'Erreur',
                    description: 'Vous ne pouvez pas vous envoyer un message à vous-même',
                });
                return;
            }

            try {
                const conversationsRef = collection(firestore, 'conversations');
                
                let existingConvoId: string | null = null;
                for (const convo of conversations) {
                    const matchesVehicle = vehicleIdParam ? convo.vehicleId === vehicleIdParam : true;
                    const matchesPart = partIdParam ? convo.partId === partIdParam : true;
                    const matchesRental = rentalIdParam ? convo.rentalId === rentalIdParam : true;
                    if (convo.participantIds.includes(sellerIdParam) && 
                        convo.participantIds.includes(user.uid) &&
                        matchesVehicle && matchesPart && matchesRental) {
                        existingConvoId = convo.id;
                        break;
                    }
                }

                if (existingConvoId) {
                    setSelectedConversationId(existingConvoId);
                    if (messageParam) {
                        setNewMessage(decodeURIComponent(messageParam));
                    }
                } else {
                    const sellerDocRef = doc(firestore, 'users', sellerIdParam);
                    const sellerSnap = await getDoc(sellerDocRef);
                    
                    let sellerName = 'Vendeur';
                    let sellerPhoto = '';
                    
                    if (sellerSnap.exists()) {
                        const sellerData = sellerSnap.data();
                        sellerName = sellerData.firstName && sellerData.lastName 
                            ? `${sellerData.firstName} ${sellerData.lastName}`
                            : sellerData.displayName || sellerData.name || 'Vendeur';
                        sellerPhoto = sellerData.photoURL || '';
                    }

                    const userDocRef = doc(firestore, 'users', user.uid);
                    const userSnap = await getDoc(userDocRef);
                    
                    let userName = 'Moi';
                    let userPhoto = '';
                    
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        userName = userData.firstName && userData.lastName 
                            ? `${userData.firstName} ${userData.lastName}`
                            : userData.displayName || userData.name || 'Utilisateur';
                        userPhoto = userData.photoURL || '';
                    }

                    // Get vehicle, part or rental title
                    let vehicleTitle = '';
                    let partTitle = '';
                    let rentalTitle = '';
                    
                    if (vehicleIdParam) {
                        const vehicleDocRef = doc(firestore, 'vehicles', vehicleIdParam);
                        const vehicleSnap = await getDoc(vehicleDocRef);
                        if (vehicleSnap.exists()) {
                            const vehicleData = vehicleSnap.data();
                            vehicleTitle = vehicleData.title || `${vehicleData.make} ${vehicleData.model}`;
                        }
                    }
                    
                    if (partIdParam) {
                        const partDocRef = doc(firestore, 'parts', partIdParam);
                        const partSnap = await getDoc(partDocRef);
                        if (partSnap.exists()) {
                            const partData = partSnap.data();
                            partTitle = partData.title || partData.name || 'Pièce';
                        }
                    }
                    
                    if (rentalIdParam) {
                        const rentalDocRef = doc(firestore, 'rentals', rentalIdParam);
                        const rentalSnap = await getDoc(rentalDocRef);
                        if (rentalSnap.exists()) {
                            const rentalData = rentalSnap.data();
                            rentalTitle = rentalData.title || `${rentalData.make} ${rentalData.model}` || 'Véhicule de location';
                        }
                    }

                    const newConvoRef = await addDoc(conversationsRef, {
                        participantIds: [user.uid, sellerIdParam],
                        participants: [
                            { id: user.uid, name: userName, photoURL: userPhoto },
                            { id: sellerIdParam, name: sellerName, photoURL: sellerPhoto },
                        ],
                        lastMessage: '',
                        lastMessageTime: null,
                        vehicleId: vehicleIdParam || null,
                        vehicleTitle: vehicleTitle || null,
                        partId: partIdParam || null,
                        partTitle: partTitle || null,
                        rentalId: rentalIdParam || null,
                        rentalTitle: rentalTitle || null,
                        unreadCount: { [user.uid]: 0, [sellerIdParam]: 0 },
                        createdAt: serverTimestamp(),
                    });

                    setSelectedConversationId(newConvoRef.id);
                    if (messageParam) {
                        setNewMessage(decodeURIComponent(messageParam));
                    }
                }
            } catch (err) {
                console.error('Error creating conversation:', err);
                toast({
                    variant: 'destructive',
                    title: 'Erreur',
                    description: 'Impossible de créer la conversation',
                });
            }
        };

        if (sellerIdParam && user && conversations.length >= 0 && !isLoadingConversations) {
            createOrOpenConversation();
        }
    }, [sellerIdParam, vehicleIdParam, messageParam, user, firestore, conversations, isLoadingConversations, toast]);

    useEffect(() => {
        if (!user || !firestore) {
            setIsLoadingConversations(false);
            return;
        }

        const conversationsRef = collection(firestore, 'conversations');
        const q = query(
            conversationsRef,
            where('participantIds', 'array-contains', user.uid),
            orderBy('lastMessageTime', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convos: Conversation[] = [];
            snapshot.forEach((docSnap) => {
                convos.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                } as Conversation);
            });
            setConversations(convos);
            setIsLoadingConversations(false);
        }, (error) => {
            console.error('Error fetching conversations:', error);
            setIsLoadingConversations(false);
        });

        return () => unsubscribe();
    }, [user, firestore]);

    // Global listener for new messages to create notifications
    // This listens to conversation updates (lastMessageTime) to detect new messages
    useEffect(() => {
        if (!user || !firestore) return;

        const conversationsRef = collection(firestore, 'conversations');
        const q = query(
            conversationsRef,
            where('participantIds', 'array-contains', user.uid),
            orderBy('lastMessageTime', 'desc')
        );

        let previousLastMessages: { [key: string]: Timestamp | null } = {};

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            snapshot.forEach(async (convoDoc) => {
                const convoData = convoDoc.data() as Conversation;
                const convoId = convoDoc.id;
                
                // Skip if this is the currently selected conversation
                if (selectedConversationId === convoId) {
                    previousLastMessages[convoId] = convoData.lastMessageTime;
                    return;
                }

                // Check if lastMessageTime changed and message is from someone else
                const previousTime = previousLastMessages[convoId];
                const currentTime = convoData.lastMessageTime;
                
                if (currentTime && 
                    (!previousTime || currentTime.toMillis() > previousTime.toMillis()) &&
                    convoData.lastMessage) {
                    
                    // Get the latest message to check sender
                    const messagesRef = collection(firestore, 'conversations', convoId, 'messages');
                    const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
                    
                    try {
                        const messagesSnapshot = await getDocs(messagesQuery);
                        messagesSnapshot.forEach(async (msgDoc) => {
                            const msgData = msgDoc.data() as Message;
                            
                            // Only create notification if message is from someone else
                            if (msgData.senderId !== user.uid) {
                                const otherParticipant = convoData.participants.find(p => p.id !== user.uid);
                                if (otherParticipant) {
                                    await createMessageNotification(
                                        firestore,
                                        user.uid,
                                        otherParticipant.name,
                                        msgData.text,
                                        convoId,
                                        otherParticipant.photoURL
                                    );
                                }
                            }
                        });
                    } catch (error) {
                        console.error('Error fetching message for notification:', error);
                    }
                }
                
                previousLastMessages[convoId] = currentTime;
            });
        });

        return () => unsubscribe();
    }, [user, firestore, selectedConversationId]);

    useEffect(() => {
        if (!selectedConversationId || !firestore) {
            setMessages([]);
            return;
        }

        setIsLoadingMessages(true);

        const messagesRef = collection(firestore, 'conversations', selectedConversationId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: Message[] = [];
            snapshot.forEach((docSnap) => {
                msgs.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                } as Message);
            });
            setMessages(msgs);
            setIsLoadingMessages(false);

            if (user) {
                const convoRef = doc(firestore, 'conversations', selectedConversationId);
                updateDoc(convoRef, {
                    [`unreadCount.${user.uid}`]: 0,
                }).catch(console.error);
            }
        }, (error) => {
            console.error('Error fetching messages:', error);
            setIsLoadingMessages(false);
        });

        return () => unsubscribe();
    }, [selectedConversationId, firestore, user]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, selectedConversationId]);

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    const getOtherParticipant = (conversation: Conversation): Participant => {
        if (!user) return conversation.participants[0];
        return conversation.participants.find(p => p.id !== user.uid) || conversation.participants[0];
    };

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const formatTime = (timestamp: Timestamp | null) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Hier';
        } else if (diffDays < 7) {
            return date.toLocaleDateString('fr-FR', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversationId || !user || !firestore) return;

        const messageText = newMessage.trim();
        setNewMessage('');
        setIsSending(true);

        try {
            let senderName = 'Moi';
            const userDocRef = doc(firestore, 'users', user.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                senderName = userData.firstName && userData.lastName 
                    ? `${userData.firstName} ${userData.lastName}`
                    : userData.displayName || 'Utilisateur';
            }

            const messagesRef = collection(firestore, 'conversations', selectedConversationId, 'messages');
            await addDoc(messagesRef, {
                text: messageText,
                senderId: user.uid,
                senderName: senderName,
                createdAt: serverTimestamp(),
            });

            const convoRef = doc(firestore, 'conversations', selectedConversationId);
            const otherParticipantId = selectedConversation?.participantIds.find(id => id !== user.uid);
            const otherParticipant = selectedConversation?.participants.find(p => p.id !== user.uid);
            
            await updateDoc(convoRef, {
                lastMessage: messageText,
                lastMessageTime: serverTimestamp(),
                ...(otherParticipantId && {
                    [`unreadCount.${otherParticipantId}`]: (selectedConversation?.unreadCount?.[otherParticipantId] || 0) + 1,
                }),
            });

            // Create notification for recipient
            if (otherParticipantId && otherParticipant) {
                await createMessageNotification(
                    firestore,
                    otherParticipantId,
                    senderName,
                    messageText,
                    selectedConversationId,
                    user.photoURL || undefined
                );
            }
        } catch (err) {
            console.error('Error sending message:', err);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible d\'envoyer le message',
            });
            setNewMessage(messageText);
        } finally {
            setIsSending(false);
        }
    };

    const filteredConversations = conversations.filter(convo => {
        if (!searchTerm) return true;
        const otherParticipant = getOtherParticipant(convo);
        return otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               convo.vehicleTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               convo.partTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               convo.rentalTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               convo.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (isUserLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-muted p-4">
                <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
                <p className="text-muted-foreground text-center mb-4">
                    Vous devez être connecté pour accéder à vos messages.
                </p>
                <Link href="/login">
                    <Button>Se connecter</Button>
                </Link>
            </div>
        );
    }

  return (
    <div className="h-full flex flex-col bg-muted">
      <header className="bg-background p-4 flex items-center justify-between gap-4 shadow-sm shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSelectedConversationId(null)} 
                        className={cn("md:hidden", !selectedConversationId && "hidden")}
                    >
                 <ArrowLeft className="h-6 w-6" />
            </Button>
            <Link href="/home" passHref className={cn("md:hidden", selectedConversationId ? "hidden" : "flex")}>
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            </Link>
             {selectedConversation ? (
                <>
                <Avatar className="h-9 w-9">
                                {getOtherParticipant(selectedConversation).photoURL && (
                                    <AvatarImage src={getOtherParticipant(selectedConversation).photoURL} />
                                )}
                                <AvatarFallback>
                                    {getInitials(getOtherParticipant(selectedConversation).name)}
                                </AvatarFallback>
                </Avatar>
                            <div>
                                <h1 className="text-lg font-bold truncate">
                                    {getOtherParticipant(selectedConversation).name}
                                </h1>
                                {(selectedConversation.vehicleTitle || selectedConversation.partTitle || selectedConversation.rentalTitle) && (
                                    <p className="text-xs text-muted-foreground truncate">
                                        {selectedConversation.vehicleTitle || selectedConversation.partTitle || selectedConversation.rentalTitle}
                                    </p>
                                )}
                            </div>
                </>
            ) : (
                <h1 className="text-xl font-bold">Messages</h1>
            )}
        </div>
      </header>

      <main className="flex-1 flex md:flex-row overflow-hidden">
                <aside className={cn(
                    "w-full md:w-1/3 lg:w-1/4 bg-card border-r flex flex-col", 
                    selectedConversationId && "hidden md:flex"
                )}>
            <div className="relative p-2 shrink-0">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Rechercher..." 
                            className="pl-10 h-11 rounded-full bg-muted border-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {isLoadingConversations ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                            <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">
                                {searchTerm ? 'Aucune conversation trouvée' : 'Aucune conversation'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Contactez un vendeur pour démarrer une conversation
                            </p>
            </div>
                    ) : (
            <ScrollArea className="flex-1">
                <div className="space-y-1 p-2">
                                {filteredConversations.map(convo => {
                                    const otherParticipant = getOtherParticipant(convo);
                                    const unreadCount = convo.unreadCount?.[user.uid] || 0;
                                    
                                    return (
                                        <button 
                                            key={convo.id} 
                                            onClick={() => setSelectedConversationId(convo.id)} 
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors", 
                                                selectedConversationId === convo.id 
                                                    ? 'bg-primary/10' 
                                                    : 'hover:bg-muted'
                                            )}
                                        >
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                                                {otherParticipant.photoURL && (
                                                    <AvatarImage src={otherParticipant.photoURL} />
                                                )}
                                                <AvatarFallback>
                                                    {getInitials(otherParticipant.name)}
                                                </AvatarFallback>
                        </Avatar>
                                            <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                                                    <p className="font-bold truncate">{otherParticipant.name}</p>
                                                    <p className="text-xs text-muted-foreground shrink-0 ml-2">
                                                        {formatTime(convo.lastMessageTime)}
                                                    </p>
                            </div>
                                                {(convo.vehicleTitle || convo.partTitle || convo.rentalTitle) && (
                                                    <p className="text-xs text-primary truncate">
                                                        {convo.vehicleTitle || convo.partTitle || convo.rentalTitle}
                                                    </p>
                                                )}
                            <div className="flex justify-between items-center">
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {convo.lastMessage || 'Nouvelle conversation'}
                                                    </p>
                                                    {unreadCount > 0 && (
                                                        <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 ml-2">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                            </div>
                        </div>
                    </button>
                                    );
                                })}
                </div>
            </ScrollArea>
                    )}
        </aside>

                <div className={cn(
                    "flex-1 flex-col bg-background", 
                    selectedConversationId ? "flex" : "hidden md:flex"
                )}>
            {selectedConversation ? (
                <>
                            {isLoadingMessages ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : (
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                                        {messages.length === 0 ? (
                                            <div className="text-center text-muted-foreground py-8">
                                                <p>Aucun message pour le moment.</p>
                                                <p className="text-sm">Envoyez le premier message !</p>
                                            </div>
                                        ) : (
                                            messages.map((msg) => (
                                                <div 
                                                    key={msg.id} 
                                                    className={cn(
                                                        "flex items-end gap-2", 
                                                        msg.senderId === user.uid ? 'justify-end' : ''
                                                    )}
                                                >
                                                    {msg.senderId !== user.uid && (
                                                        <Avatar className="h-8 w-8">
                                                            {getOtherParticipant(selectedConversation).photoURL && (
                                                                <AvatarImage src={getOtherParticipant(selectedConversation).photoURL} />
                                                            )}
                                                            <AvatarFallback>
                                                                {getInitials(getOtherParticipant(selectedConversation).name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div className={cn(
                                                        "max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl", 
                                                        msg.senderId === user.uid 
                                                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                                                            : 'bg-muted text-foreground rounded-bl-none'
                                                    )}>
                                    <p>{msg.text}</p>
                                                        <p className="text-xs opacity-70 mt-1 text-right">
                                                            {msg.createdAt ? formatTime(msg.createdAt) : '...'}
                                                        </p>
                                </div>
                            </div>
                                            ))
                                        )}
                    </div>
                </ScrollArea>
                            )}

                <footer className="p-4 bg-card border-t shrink-0">
                    <form onSubmit={handleSendMessage}>
                        <div className="relative">
                            <Input 
                                placeholder="Écrire un message..." 
                                className="pr-12 h-12 rounded-full bg-muted border-none" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                            disabled={isSending}
                            />
                                        <Button 
                                            type="submit" 
                                            size="icon" 
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full"
                                            disabled={isSending || !newMessage.trim()}
                                        >
                                            {isSending ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                <Send className="h-5 w-5" />
                                            )}
                            </Button>
                        </div>
                    </form>
                </footer>
                </>
            ) : (
                <div className="flex-1 hidden md:flex items-center justify-center text-center text-muted-foreground">
                    <div>
                                <MessageCircle className="h-16 w-16 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold">Sélectionnez une conversation</h2>
                        <p>Choisissez une conversation dans la liste pour afficher les messages.</p>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-muted flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <MessagesPageContent />
        </Suspense>
    );
}
