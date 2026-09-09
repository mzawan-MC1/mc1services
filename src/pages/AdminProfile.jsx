import { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminRoute from '../components/AdminRoute';
import { supabase } from '../components/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { validateUploadFile } from '../utils/uploadValidation';

export default function AdminProfile() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ full_name: '', phone: '', avatar_url: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

  const load = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Not authenticated'); return; }
      setUser(user);
      setEmail(user.email || '');
      const { data: prof } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
      if (!prof) {
        await supabase.from('user_profiles').insert({ id: user.id }).select('*');
      }
      const { data: prof2 } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
      if (prof2) setForm({ full_name: prof2.full_name || '', phone: prof2.phone || '', avatar_url: prof2.avatar_url || '' });
    } catch (e) {
      toast.error(e.message || 'Failed to load profile');
    }
  };

  useEffect(() => { load(); }, []);

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return;
    const ext = avatarFile.name.split('.').pop().toLowerCase();
    if (!['jpg','jpeg','png','webp'].includes(ext)) { toast.error('Only jpg, png, webp allowed'); return; }
    try {
      validateUploadFile(avatarFile, { accept: 'image/jpeg,image/png,image/webp', maxImageMB: 2 });
    } catch (error) {
      toast.error(error.message);
      return;
    }
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
    if (upErr) { toast.error(upErr.message || 'Upload failed'); return; }
    const { data: pub } = await supabase.storage.from('avatars').getPublicUrl(path);
    setForm(f => ({ ...f, avatar_url: pub.publicUrl }));
    try {
      await supabase.from('user_profiles').update({ avatar_url: pub.publicUrl, updated_at: new Date().toISOString() }).eq('id', user.id);
      window.dispatchEvent(new Event('profile-updated'));
      localStorage.setItem('profile_updated', String(Date.now()));
    } catch {
      // The uploaded avatar remains saved even if the local refresh signal fails.
    }
    toast.success('Avatar uploaded');
  };

  const save = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('user_profiles').update({ full_name: form.full_name, phone: form.phone, avatar_url: form.avatar_url, updated_at: new Date().toISOString() }).eq('id', user.id);
      if (error) throw error;
      toast.success('Profile saved');
      try {
        localStorage.setItem('profile_updated', String(Date.now()));
        window.dispatchEvent(new Event('profile-updated'));
      } catch {
        // Profile saving does not depend on the optional local refresh signal.
      }
    } catch (e) {
      toast.error(e.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    try {
      setChangingPassword(true);
      if (!passwords.newPassword || passwords.newPassword !== passwords.confirmPassword) { throw new Error('Passwords do not match'); }
      const { error } = await supabase.auth.updateUser({ password: passwords.newPassword });
      if (error) throw error;
      setPasswords({ newPassword: '', confirmPassword: '' });
      toast.success('Password updated');
    } catch (e) { toast.error(e.message || 'Failed to update password'); }
    finally { setChangingPassword(false); }
  };

  return (
    <AdminRoute>
    <AdminLayout currentPage="AdminProfile">
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Profile</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Profile Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={form.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + (form.full_name || email || 'User')} alt="avatar" className="w-16 h-16 rounded-full object-cover border" />
                <div className="space-y-2">
                  <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setForm(f => ({ ...f, avatar_url: '' }))}>Remove</Button>
                    <Button onClick={uploadAvatar} disabled={!avatarFile} className="text-black bg-white border-slate-300 hover:bg-slate-100">Upload</Button>
                  </div>
                </div>
              </div>
              <div>
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={email} readOnly className="mt-1" />
              </div>
              <Button onClick={save} disabled={saving} className="bg-blue-600 text-white">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>New Password</Label>
                <Input type="password" value={passwords.newPassword} onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} className="mt-1" />
              </div>
              <Button onClick={changePassword} disabled={changingPassword} className="bg-blue-600 text-white">
                {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
    </AdminRoute>
  );
}
