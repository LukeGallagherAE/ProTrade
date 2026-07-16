'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { getInitials, formatDate } from '@/lib/utils';
import { Plus, UserCog, Briefcase, Pencil, Trash2, Loader2 } from 'lucide-react';

interface TeamMember {
  id: string; name: string; email: string; phone: string | null;
  role: string; active: boolean; createdAt: string;
  _count: { assignedJobs: number };
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  STAFF: 'bg-gray-100 text-gray-700',
};

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'STAFF', password: '' });

  const fetchTeam = async () => {
    setLoading(true);
    const res = await fetch('/api/team');
    setTeam(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchTeam(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', role: 'STAFF', password: '' });
    setDialogOpen(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditing(member);
    setForm({ name: member.name, email: member.email, phone: member.phone ?? '', role: member.role, password: '' });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...form, phone: form.phone || undefined, password: form.password || undefined };
    const res = editing
      ? await fetch(`/api/team/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json();
      toast({ title: 'Error', description: err.error ?? 'Failed to save', variant: 'destructive' });
      return;
    }
    toast({ title: editing ? 'Team member updated' : 'Team member added' });
    setDialogOpen(false);
    fetchTeam();
  };

  const handleDelete = async (member: TeamMember) => {
    if (!confirm(`Remove ${member.name} from the team?`)) return;
    const res = await fetch(`/api/team/${member.id}`, { method: 'DELETE' });
    if (!res.ok) { const e = await res.json(); toast({ title: 'Error', description: e.error, variant: 'destructive' }); return; }
    toast({ title: 'Team member removed' });
    fetchTeam();
  };

  return (
    <>
      <Header title="Team" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{team.length} team member{team.length !== 1 ? 's' : ''}</p>
            <Button onClick={openNew}><Plus className="h-4 w-4" />Add Member</Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : team.length === 0 ? (
            <div className="text-center py-16">
              <UserCog className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No team members yet</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={openNew}><Plus className="h-4 w-4" />Add Member</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.map(member => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(member)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(member)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Badge className={`${ROLE_COLORS[member.role]} border-0 text-xs`}>{member.role}</Badge>
                      {member.phone && <p className="text-xs text-gray-500">{member.phone}</p>}
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />{member._count.assignedJobs} assigned job{member._count.assignedJobs !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400">Joined {formatDate(member.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['ADMIN','MANAGER','STAFF'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0400 000 000" />
            </div>
            <div className="space-y-1.5">
              <Label>{editing ? 'New Password (leave blank to keep)' : 'Password *'}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder={editing ? 'Leave blank to keep current' : 'Min 8 characters'}
                required={!editing}
                minLength={editing ? 0 : 8}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : (editing ? 'Save Changes' : 'Add Member')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
