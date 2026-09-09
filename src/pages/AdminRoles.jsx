import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Edit, Trash, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../components/admin/AdminLayout';
import AdminRoute from '../components/AdminRoute';
import { dataLayer } from '../components/dataLayer';
import { Checkbox } from '@/components/ui/checkbox';

const PERMISSION_OPTIONS = [
  { key: 'manage_users', label: 'Manage Users' },
  { key: 'manage_roles', label: 'Manage Roles' },
  { key: 'manage_content', label: 'Manage Content' },
  { key: 'manage_site_settings', label: 'Manage Site Settings' },
  { key: 'manage_seo', label: 'Manage SEO' },
  { key: 'manage_media', label: 'Manage Media' },
  { key: 'manage_tools', label: 'Manage Tools' },
  { key: 'view_reports', label: 'View Reports' }
];

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', permissions: {} });

  const loadRoles = async () => {
    try {
      const r = await dataLayer.roles.getAll();
      setRoles(r);
    } catch (e) {
      toast.error(e.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoles(); }, []);

  const openCreate = () => { setEditingRole(null); setForm({ name: '', description: '', permissions: {} }); setIsDialogOpen(true); };
  const openEdit = (role) => { setEditingRole(role); setForm({ name: role.name || '', description: role.description || '', permissions: role.permissions || {} }); setIsDialogOpen(true); };

  const saveRole = async () => {
    try {
      if (!form.name.trim()) { toast.error('Role name is required'); return; }
      if (editingRole) {
        await dataLayer.roles.update(editingRole.id, { name: form.name.trim(), description: form.description || null, permissions: form.permissions || {} });
        toast.success('Role updated');
      } else {
        await dataLayer.roles.create({ name: form.name.trim(), description: form.description || null, permissions: form.permissions || {} });
        toast.success('Role created');
      }
      setIsDialogOpen(false);
      await loadRoles();
      try { localStorage.setItem('roles_updated', String(Date.now())); } catch { /* Local storage may be unavailable in privacy mode. */ }
    } catch (e) { toast.error(e.message || 'Failed to save role'); }
  };

  const deleteRole = async (id) => {
    try {
      await dataLayer.roles.delete(id);
      toast.success('Role deleted');
      await loadRoles();
      try { localStorage.setItem('roles_updated', String(Date.now())); } catch { /* Local storage may be unavailable in privacy mode. */ }
    } catch (e) { toast.error(e.message || 'Failed to delete role'); }
  };

  if (loading) {
    return (
      <AdminRoute>
      <AdminLayout currentPage="AdminRoles">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
    <AdminLayout currentPage="AdminRoles">
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Role Management</h1>
            <p className="text-slate-600 mt-1">Add, edit, and delete roles</p>
          </div>
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        </div>

        {roles.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-500 mb-4">No roles defined</p>
              <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      {role.description && (
                        <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(role)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteRole(role.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Edit Role' : 'Add Role'}</DialogTitle>
              <DialogDescription>{editingRole ? 'Update role name and description.' : 'Create a new role.'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="roleName">Role Name</Label>
                <Input id="roleName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="roleDesc">Description</Label>
                <Input id="roleDesc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2" />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PERMISSION_OPTIONS.map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 rounded-md border border-slate-200 p-2 hover:bg-slate-50">
                      <Checkbox
                        checked={!!form.permissions?.[opt.key]}
                        onCheckedChange={(val) => setForm({ ...form, permissions: { ...(form.permissions || {}), [opt.key]: !!val } })}
                      />
                      <span className="text-sm text-slate-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setForm({ ...form, permissions: Object.fromEntries(PERMISSION_OPTIONS.map(o => [o.key, true])) })}>Apply Admin</Button>
                  <Button type="button" variant="outline" onClick={() => setForm({ ...form, permissions: { manage_content: true, manage_media: true, manage_seo: true } })}>Apply Editor</Button>
                  <Button type="button" variant="outline" onClick={() => setForm({ ...form, permissions: {} })}>Apply Viewer</Button>
                </div>
              </div>
              <Button onClick={saveRole} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {editingRole ? 'Save Changes' : 'Create Role'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
    </AdminRoute>
  );
}
