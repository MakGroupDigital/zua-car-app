'use client';

import { useFormState } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { submitContactForm } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type ContactFormProps = {
  content: {
    title: string;
    subtitle: string;
    form: {
      name: string;
      email: string;
      message: string;
      button: string;
      success: string;
      error: string;
    }
  }
}

export default function ContactForm({ content }: ContactFormProps) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(submitContactForm, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: "Success!",
        description: content.form.success,
      });
      formRef.current?.reset();
    } else if (state.message === 'error') {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: content.form.error,
      });
    }
  }, [state, toast, content.form.success, content.form.error]);

  return (
    <section id="contact" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline">{content.title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{content.subtitle}</p>
        </div>
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={dispatch} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{content.form.name}</Label>
                <Input id="name" name="name" placeholder={content.form.name} required />
                 {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{content.form.email}</Label>
                <Input id="email" name="email" type="email" placeholder={content.form.email} required />
                {state.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{content.form.message}</Label>
                <Textarea id="message" name="message" placeholder={content.form.message} className="min-h-[150px]" required />
                {state.errors?.message && <p className="text-sm font-medium text-destructive">{state.errors.message[0]}</p>}
              </div>
              <Button type="submit" className="w-full" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                {content.form.button}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
