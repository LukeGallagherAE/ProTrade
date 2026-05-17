'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [business, setBusiness] = useState({
    name: 'ProTrade Services',
    email: 'admin@protrade.com.au',
    phone: '1300 000 000',
    address: '',
    city: '',
    state: '',
    postcode: '',
    abn: '',
    gstRegistered: true,
    defaultTaxRate: '10',
    paymentTerms: 'Payment due within 14 days of invoice date.',
    quoteTerms: 'This quote is valid for 30 days from the date of issue.',
    invoiceNotes: 'Thank you for your business.',
    logo: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Settings saved', description: 'Your business settings have been updated.' });
  };

  return (
    <>
      <Header title="Settings" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSave} className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Business Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Business Name</Label>
                    <Input value={business.name} onChange={e => setBusiness(b => ({ ...b, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>ABN</Label>
                    <Input placeholder="12 345 678 901" value={business.abn} onChange={e => setBusiness(b => ({ ...b, abn: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" value={business.email} onChange={e => setBusiness(b => ({ ...b, email: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input value={business.phone} onChange={e => setBusiness(b => ({ ...b, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input placeholder="Street address" value={business.address} onChange={e => setBusiness(b => ({ ...b, address: e.target.value }))} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input placeholder="Sydney" value={business.city} onChange={e => setBusiness(b => ({ ...b, city: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Input placeholder="NSW" value={business.state} onChange={e => setBusiness(b => ({ ...b, state: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Postcode</Label>
                    <Input placeholder="2000" value={business.postcode} onChange={e => setBusiness(b => ({ ...b, postcode: e.target.value }))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Tax & Invoicing</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Default GST Rate (%)</Label>
                    <Input type="number" step="0.1" value={business.defaultTaxRate} onChange={e => setBusiness(b => ({ ...b, defaultTaxRate: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Default Payment Terms</Label>
                  <Textarea rows={2} value={business.paymentTerms} onChange={e => setBusiness(b => ({ ...b, paymentTerms: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Default Quote Terms</Label>
                  <Textarea rows={2} value={business.quoteTerms} onChange={e => setBusiness(b => ({ ...b, quoteTerms: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Default Invoice Notes</Label>
                  <Textarea rows={2} value={business.invoiceNotes} onChange={e => setBusiness(b => ({ ...b, invoiceNotes: e.target.value }))} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit"><Save className="h-4 w-4" />Save Settings</Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
