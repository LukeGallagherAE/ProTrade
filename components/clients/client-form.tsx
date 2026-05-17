'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, type ClientInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function ClientForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
}: {
  defaultValues?: Partial<ClientInput>;
  onSubmit: (data: ClientInput) => Promise<void>;
  submitLabel?: string;
}) {
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues,
  });

  const submit = async (data: ClientInput) => {
    setSubmitting(true);
    await onSubmit(data);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Client Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="John Smith" {...register('name')} className={errors.name ? 'border-red-400' : ''} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Acme Pty Ltd" {...register('company')} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="0400 000 000" {...register('phone')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="address">Street Address</Label>
            <Input id="address" placeholder="123 Main Street" {...register('address')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Sydney" {...register('city')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="NSW" {...register('state')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" placeholder="2000" {...register('postcode')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea placeholder="Any notes about this client..." rows={4} {...register('notes')} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
