
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, Search, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const initialConversations = [
    { id: 1, name: 'Jean-Pierre K.', lastMessage: 'Oui, toujours disponible !', time: '10:42', unread: 2, avatarId: 'avatar-1', online: true },
    { id: 2, name: 'Zua-Pièces Pro', lastMessage: 'Votre commande a été expédiée.', time: 'Hier', unread: 0, avatarId: 'avatar-2', online: false },
    { id: 3, name: 'David M.', lastMessage: 'Merci pour le service !', time: 'Mar', unread: 0, avatarId: 'avatar-3', online: true },
    { id: 4, name: 'Vendeur BMW', lastMessage: 'Le prix est négociable.', time: 'Lun', unread: 1, avatarId: 'avatar-1', online: false },
];

const initialMessages: { [key: number]: any[] } = {
    1: [
        { id: 'm1', text: 'Bonjour, le véhicule est-il toujours disponible ?', sender: 'me', time: '10:40' },
        { id: 'm2', text: 'Oui, toujours disponible !', sender: 'Jean-Pierre K.', time: '10:42' },
        { id: 'm3', text: 'Parfait, je suis intéressé. Pouvons-nous nous voir demain ?', sender: 'me', time: '10:45'},
        { id: 'm4', text: 'Bien sûr, 14h ça vous va ?', sender: 'Jean-Pierre K.', time: '10:46'},
        { id: 'm5', text: 'Excellent, à demain !', sender: 'me', time: '10:47'},

    ],
    2: [
        { id: 'm6', text: 'Bonjour, où en est ma commande de plaquettes de frein ?', sender: 'me', time: 'Hier' },
        { id: 'm7', text: 'Votre commande a été expédiée.', sender: 'Zua-Pièces Pro', time: 'Hier' },
    ],
    3: [],
    4: []
};


export default function MessagesPage() {
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [conversations, setConversations] = useState(initialConversations);
    const [messages, setMessages] = useState<{[key: number]: any[]}>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);
    const currentMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];
    
    const getAvatar = (id: string) => PlaceHolderImages.find(p => p.id === id);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversationId) return;

        const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        const messageToAdd = {
            id: `m${Date.now()}`,
            text: newMessage,
            sender: 'me',
            time: time,
        };

        setMessages(prevMessages => {
            const newMessagesForConvo = [...(prevMessages[selectedConversationId] || []), messageToAdd];
            return {
                ...prevMessages,
                [selectedConversationId]: newMessagesForConvo,
            };
        });

        // Also update the last message in the conversation list
        setConversations(prevConvos => 
            prevConvos.map(convo => 
                convo.id === selectedConversationId 
                ? { ...convo, lastMessage: newMessage, time: time }
                : convo
            )
        );

        setNewMessage('');
    };

    useEffect(() => {
        // Auto-select first conversation on desktop if none is selected
        const handleResize = () => {
            if (window.innerWidth >= 768 && selectedConversationId === null) {
                setSelectedConversationId(initialConversations[0]?.id || null);
            }
        };

        handleResize(); // Run on initial mount
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [selectedConversationId]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [currentMessages, selectedConversationId]);


  return (
    <div className="h-full flex flex-col bg-muted">
      <header className="bg-background p-4 flex items-center justify-between gap-4 shadow-sm shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedConversationId(null)} className={cn("md:hidden", !selectedConversationId && "hidden")}>
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
                    <AvatarImage src={getAvatar(selectedConversation.avatarId)?.imageUrl} />
                    <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h1 className="text-xl font-bold truncate">{selectedConversation.name}</h1>
                </>
            ) : (
                <h1 className="text-xl font-bold">Messages</h1>
            )}
        </div>
      </header>

      <main className="flex-1 flex md:flex-row overflow-hidden">
        {/* Conversations List */}
        <aside className={cn("w-full md:w-1/3 lg:w-1/4 bg-card border-r flex flex-col", selectedConversationId && "hidden md:flex")}>
            <div className="relative p-2 shrink-0">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Rechercher..." className="pl-10 h-11 rounded-full bg-muted border-none" />
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-1 p-2">
                {conversations.map(convo => (
                    <button key={convo.id} onClick={() => setSelectedConversationId(convo.id)} className={cn("w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors", selectedConversationId === convo.id ? 'bg-primary/10' : 'hover:bg-muted')}>
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src={getAvatar(convo.avatarId)?.imageUrl} data-ai-hint={getAvatar(convo.avatarId)?.imageHint}/>
                            <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                             {convo.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />}
                        </Avatar>
                        <div className="flex-1 truncate">
                            <div className="flex justify-between items-center">
                                <p className="font-bold">{convo.name}</p>
                                <p className="text-xs text-muted-foreground">{convo.time}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                {convo.unread > 0 && <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{convo.unread}</span>}
                            </div>
                        </div>
                    </button>
                ))}
                </div>
            </ScrollArea>
        </aside>

        {/* Chat Window */}
         <div className={cn("flex-1 flex-col bg-background", selectedConversationId ? "flex" : "hidden md:flex")}>
            {selectedConversation ? (
                <>
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {currentMessages.map((msg: any) => (
                            <div key={msg.id} className={cn("flex items-end gap-2", msg.sender === 'me' ? 'justify-end' : '')}>
                                {msg.sender !== 'me' && <Avatar className="h-8 w-8"><AvatarImage src={getAvatar(selectedConversation.avatarId)?.imageUrl}/><AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback></Avatar>}
                                <div className={cn("max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl", msg.sender === 'me' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground rounded-bl-none')}>
                                    <p>{msg.text}</p>
                                    <p className="text-xs opacity-70 mt-1 text-right">{msg.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <footer className="p-4 bg-card border-t shrink-0">
                    <form onSubmit={handleSendMessage}>
                        <div className="relative">
                            <Input 
                                placeholder="Écrire un message..." 
                                className="pr-12 h-12 rounded-full bg-muted border-none" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full">
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                    </form>
                </footer>
                </>
            ) : (
                <div className="flex-1 hidden md:flex items-center justify-center text-center text-muted-foreground">
                    <div>
                        <MessageCircle className="h-16 w-16 mx-auto mb-4"/>
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
