'use client';
import { useEffect, useState, useCallback } from 'react';
import { Plus, UserCog, Phone, Mail, DollarSign } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { TeamMember } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const DEFAULT_FORM = { name: '', email: '', phone: '', role: 'tradesperson' as const, trade: '', status: 'active' as const, hourlyRate: 0 };

export default function TeamPage() {
  const { showToast } = useToast();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch('/api/team').then(r => r.json()).then(data => { setTeam(data); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  }

  function openEdit(m: TeamMember) {
    setEditingId(m.id);
    setForm({ name: m.name, email: m.email, phone: m.phone, role: m.role, trade: m.trade, status: m.status, hourlyRate: m.hourlyRate });
    setShowModal(true);
  }

  function setField(k: string, v: string | number) {
    setForm(p => ({ ...p, [k]: v }));
  }

  async function save() {
    if (!form.name) { showToast('Name is required', 'error'); return; }
    setSaving(true);
    const url = editingId ? `/api/team/${editingId}` : '/api/team';
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      showToast(editingId ? 'Team member updated' : 'Team member added');
      setShowModal(false);
      load();
    } else {
      showToast('Failed to save', 'error');
    }
    setSaving(false);
  }

  async function del(id: string) {
    if (!confirm('Remove this team member?')) return;
    const res = await fetch(`/api/team/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Team member removed'); load(); }
    else showToast('Failed to remove', 'error');
  }

  const TRADES = ['Electrical','Plumbing','HVAC','Carpentry','Painting','Tiling','Roofing','General'].map(v => ({ value: v, label: v }));
  const ROLES = [{ value: 'admin', label: 'Admin' }, { value: 'manager', label: 'Manager' }, { value: 'tradesperson', label: 'Tradesperson' }, { value: 'apprentice', label: 'Apprentice' }];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Team</h2>
          <p className="text-sm text-slate-500 mt-0.5">{team.length} member{team.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openNew}><Plus size={16} /> Add Member</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>
      ) : team.length === 0 ? (
        <Card>
          <EmptyState icon={<UserCog size={28} />} title="No team members" description="Add your first team member to start assigning jobs." action={<Button onClick={openNew}>Add Member</Button>} />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map(m => (
            <Card key={m.id} className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center">
                    <span className="text-brand-700 font-bold">{m.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.trade}</p>
                  </div>
                </div>
                <Badge status={m.status} size="sm" />
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-600"><Badge status={m.role} /></div>
                {m.email && <div className="flex items-center gap-2 text-xs text-slate-600"><Mail size={12} className="text-slate-400" />{m.email}</div>}
                {m.phone && <div className="flex items-center gap-2 text-xs text-slate-600"><Phone size={12} className="text-slate-400" />{m.phone}</div>}
                {m.hourlyRate > 0 && <div className="flex items-center gap-2 text-xs text-slate-600"><DollarSign size={12} className="text-slate-400" />{formatCurrency(m.hourlyRate)}/hr</div>}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => openEdit(m)} className="flex-1">Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => del(m.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">Remove</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Team Member' : 'Add Team Member'} size="sm">
        <div className="space-y-4">
          <Input label="Full Name *" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Jane Smith" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Role" value={form.role} onChange={e => setField('role', e.target.value)} options={ROLES} />
            <Select label="Trade" value={form.trade} onChange={e => setField('trade', e.target.value)} placeholder="Select trade" options={TRADES} />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="jane@example.com" />
          <Input label="Phone" type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="0400 000 000" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Hourly Rate ($)" type="number" min="0" value={form.hourlyRate} onChange={e => setField('hourlyRate', parseFloat(e.target.value) || 0)} />
            <Select label="Status" value={form.status} onChange={e => setField('status', e.target.value)} options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'}]} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={save} loading={saving} className="flex-1">{editingId ? 'Save Changes' : 'Add Member'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
