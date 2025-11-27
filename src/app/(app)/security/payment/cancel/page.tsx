'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-2 border-primary/20">
        <CardContent className="p-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-red-500/20">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              Paiement annulé
            </h2>
            <p className="text-muted-foreground">
              Le paiement a été annulé. Vous pouvez réessayer plus tard.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/security')}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la sécurité
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

