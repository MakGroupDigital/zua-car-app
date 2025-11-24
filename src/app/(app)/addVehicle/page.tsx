import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
    title: z.string().min(2, { message: 'Le titre doit contenir au moins 2 caractères.' }),
    price: z.string().min(1, { message: 'Le prix est requis.' }),
    description: z.string().optional(),
});

export default function AddVehiclePage() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { title: '', price: '', description: '' },
    });

    const onSubmit = async (values) => {
        if (!auth) return;
        setIsLoading(true);
        try {
            const vehicleRef = doc(firestore, 'vehicles', `${auth.uid}_${Date.now()}`);
            await setDocumentNonBlocking(vehicleRef, {
                userId: auth.uid,
                title: values.title,
                price: values.price,
                description: values.description ?? '',
                createdAt: serverTimestamp(),
            }, { merge: true });
            toast({ title: 'Annonce créée', description: 'Votre véhicule a été publié.' });
            router.push('/vehicles');
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de créer l'annonce." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            <header className="bg-background sticky top-0 z-10 border-b p-4 flex items-center gap-4 shadow-sm">
                <Link href="/vehicles" passHref>
                    <Button variant="ghost" size="icon" className="hover:bg-muted rounded-full">
                        <ArrowLeft className="h-6 w-6 text-foreground" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold text-foreground">Ajouter un véhicule à vendre</h1>
            </header>
            <main className="p-4 max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Nouvelle annonce</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="title" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Titre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex : Peugeot 308 2018" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="price" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prix</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex : 12000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (optionnel)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Détails du véhicule..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Enregistrement...' : "Publier l'annonce"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
