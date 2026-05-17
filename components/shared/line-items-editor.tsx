'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function LineItemsEditor() {
  const { register, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ name: 'items' });

  const items = watch('items') as Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  const taxRate = watch('taxRate') as number ?? 10;

  const subtotal = items?.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0) ?? 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const updateTotal = (index: number) => {
    const item = items?.[index];
    if (item) {
      const t = Number(item.quantity) * Number(item.unitPrice);
      setValue(`items.${index}.total`, t);
    }
  };

  return (
    <div className="space-y-3">
      <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">
        <div className="col-span-6">Description</div>
        <div className="col-span-2 text-right">Qty</div>
        <div className="col-span-2 text-right">Unit Price</div>
        <div className="col-span-1 text-right">Total</div>
        <div className="col-span-1" />
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-12 sm:col-span-6">
            <Input
              placeholder="Description"
              {...register(`items.${index}.description`)}
            />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <Input
              type="number"
              step="0.01"
              placeholder="1"
              {...register(`items.${index}.quantity`, {
                onChange: () => updateTotal(index),
              })}
            />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register(`items.${index}.unitPrice`, {
                onChange: () => updateTotal(index),
              })}
            />
          </div>
          <div className="col-span-3 sm:col-span-1 text-right">
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(Number(items?.[index]?.quantity ?? 0) * Number(items?.[index]?.unitPrice ?? 0))}
            </span>
            <input type="hidden" {...register(`items.${index}.total`)} />
          </div>
          <div className="col-span-1 flex justify-end">
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ description: '', quantity: 1, unitPrice: 0, total: 0 })}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4" /> Add Line Item
      </Button>

      <div className="border-t pt-3 space-y-1 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600 items-center gap-4">
          <span>GST ({taxRate}%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
