import { useState } from 'react';
import { useEffect } from 'react';
import { supabase } from '../components/supabaseClient';
import { dataLayer } from '../components/dataLayer';
import { createClient } from '@supabase/supabase-js';
import { UserPlus, Edit, Trash, Loader2, Save, Shield, User, Mail, Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import AdminLayout from '../components/admin/AdminLayout';
import AdminRoute from '../components/AdminRoute';

export default function AdminUsers() {
  const [editingUser, setEditingUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Create User State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin'
  });

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rolesList, setRolesList] = useState([]);
  const loadUsers = async () => {
    try {
      if (!supabase) { setUsers([]); return; }
      // Try admin list via RPC first
      const rpc = await supabase.rpc('admin_list_users');
      if (!rpc.error && Array.isArray(rpc.data)) {
        let base = rpc.data || [];
        const ids = base.map(u => u.id).filter(Boolean);
        if (ids.length) {
          const { data: profExtra } = await supabase.from('user_profiles').select('id, avatar_url, phone').in('id', ids);
          const byId = Object.fromEntries((profExtra || []).map(p => [p.id, p]));
          base = base.map(u => ({ ...u, avatar_url: byId[u.id]?.avatar_url || u.avatar_url, phone: byId[u.id]?.phone || u.phone }));
        }
        setUsers(base);
      } else {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setUsers(data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { loadUsers(); }, []);

  const loadRoles = async () => {
    try {
      const r = await dataLayer.roles.getAll();
      setRolesList(r);
    } catch {
      // fallback to built-in roles if query fails
      setRolesList([
        { id: 'default-admin', name: 'admin' },
        { id: 'default-editor', name: 'editor' },
        { id: 'default-viewer', name: 'viewer' }
      ]);
    }
  };
  useEffect(() => { loadRoles(); }, []);
  useEffect(() => {
    const onStorage = (e) => { if (e.key === 'roles_updated') loadRoles(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const [syncPending, setSyncPending] = useState(false);
  const runSync = async () => {
    try {
      setSyncPending(true);
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase.rpc('sync_profiles_from_auth');
      if (error) {
        throw error;
      }
      await loadUsers();
      toast.success(`Synced ${data ?? 0} users from Auth`);
    } catch (err) {
      toast.error(err.message || 'Failed to sync users');
    } finally {
      setSyncPending(false);
    }
  };

  const createUser = async (data) => {
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabasePublishableKey) {
        throw new Error('Missing Supabase environment variables');
      }

      const KEY = '__supabase_signup_client__';
      if (!globalThis[KEY]) {
        globalThis[KEY] = createClient(supabaseUrl, supabasePublishableKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        });
      }
      const tempClient = globalThis[KEY];

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name
          }
        }
      });

      if (authError) {
        console.error('Auth Error:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('No user returned from signUp');
        throw new Error('Failed to create user');
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: authData.user.id,
          full_name: data.full_name,
          role: data.role,
          email: data.email
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('User created but profile setup failed: ' + profileError.message);
      }

      await loadUsers();
      setIsCreateDialogOpen(false);
      setCreateFormData({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin'
      });
      toast.success('Admin user created successfully.');
  };

  const saveUser = async (data) => {
      if (!supabase || !editingUser?.id) throw new Error('Invalid data');
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: data.full_name,
          role: data.role
        })
        .eq('id', editingUser.id);
      
      if (error) throw error;
      await loadUsers();
      setIsDialogOpen(false);
      setEditingUser(null);
      toast.success('User updated successfully!');
  };

  const deleteUser = async (userId) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      // Delete from auth? We can't delete from Auth using Anon key usually.
      // We can delete from user_profiles if RLS allows.
      // The previous code used supabase.auth.admin.deleteUser(userId) which would fail with Anon key.
      // If the user wants to delete, we can try to delete the profile.
      
      // Attempting to use auth.admin (will likely fail in production without service role, but keeping logic if local env works)
      // OR just delete profile.
      
      // Try profile delete first (Cascading? Auth usually cascades to Profile, not vice versa)
      // Actually, we can't delete Auth user from client.
      // We will just delete the profile record, which effectively removes them from the list.
      
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      await loadUsers();
      toast.success('User profile deleted successfully!');
  };

  const handleEdit = (user) => {
    setEditingUser({
      id: user.id,
      full_name: user.full_name,
      email: user.email, // This might be undefined if not in table, but we keep it
      role: user.role
    });
    setIsDialogOpen(true);
  };

  const [savePending, setSavePending] = useState(false);
  const handleSave = async () => {
    try { setSavePending(true); await saveUser(editingUser); } catch (error) { toast.error('Failed to update user: ' + (error.message || error)); } finally { setSavePending(false); }
  };

  const [createPending, setCreatePending] = useState(false);
  const handleCreate = async (e) => {
    e.preventDefault();
    try { setCreatePending(true); await createUser(createFormData); } catch (error) { toast.error(error.message || String(error)); } finally { setCreatePending(false); }
  };

  const handleDelete = async (userId) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try { await deleteUser(userId); } catch (error) { toast.error('Failed to delete user: ' + (error.message || error)); }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <AdminRoute>
    <AdminLayout currentPage="AdminUsers">
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-600 mt-1">Manage admin users and roles</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={runSync}
              disabled={syncPending}
              className="border-slate-300"
            >
              {syncPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Sync from Auth
            </Button>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Admin User
            </Button>
          </div>
        </div>

        {users.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-500 mb-4">No users found</p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={runSync} className="border-slate-300">
                  {syncPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Sync from Auth
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Admin User
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start gap-3">
                    <img
                      src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name || user.email || 'User')}`}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{user.full_name || 'Unknown User'}</CardTitle>
                      <p className="text-sm text-slate-500 mt-1 truncate">{user.email || 'No email recorded'}</p>
                      {user.phone && (
                        <p className="text-xs text-slate-500">{user.phone}</p>
                      )}
                    </div>
                  </div>
                  {user.role === 'admin' ? (
                    <Badge className="bg-blue-600">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <User className="w-3 h-3 mr-1" />
                      {user.role || 'User'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-slate-500 mb-3">
                  Created: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(user)} className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Edit the selected user&apos;s name and role.</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={editingUser.full_name || ''}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, full_name: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) =>
                      setEditingUser({ ...editingUser, role: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesList.length > 0 ? rolesList.map((r) => (
                        <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                      )) : (
                        <>
                          <SelectItem value="admin">admin</SelectItem>
                          <SelectItem value="editor">editor</SelectItem>
                          <SelectItem value="viewer">viewer</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={savePending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {savePending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Admin User</DialogTitle>
              <DialogDescription>Enter details to create a new admin user.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  required
                  value={createFormData.full_name}
                  onChange={(e) => setCreateFormData({ ...createFormData, full_name: e.target.value })}
                  className="mt-2"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    className="pl-10"
                    placeholder="user@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      required
                      value={createFormData.password}
                      onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                      className="pl-10"
                      placeholder="••••••"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={createFormData.confirmPassword}
                      onChange={(e) => setCreateFormData({ ...createFormData, confirmPassword: e.target.value })}
                      className="pl-10"
                      placeholder="••••••"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={createFormData.role}
                  onValueChange={(value) => setCreateFormData({ ...createFormData, role: value })}
                >
                  <SelectTrigger id="role" className="mt-2">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Create User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
    </AdminRoute>
  );
}
