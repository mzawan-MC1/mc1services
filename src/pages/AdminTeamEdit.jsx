import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '../components/FileUpload';
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminTeamEdit() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = id !== 'new';

  const { data: member, isLoading } = useQuery({
    queryKey: ['team-member', id],
    queryFn: () => dataLayer.team.getById(id),
    enabled: isEditing
  });

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    profile_url: '',
    image_url: '',
    order: 0,
    // Arabic fields
    name_ar: '',
    role_ar: '',
    bio_ar: ''
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        role: member.role || '',
        bio: member.bio || '',
        profile_url: member.profile_url || '',
        image_url: member.image_url || '',
        order: member.order || 0,
        // Arabic
        name_ar: member.name_ar || '',
        role_ar: member.role_ar || '',
        bio_ar: member.bio_ar || ''
      });
    }
  }, [member]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Submitting team member payload:', data);
      try {
        if (isEditing) {
          await dataLayer.team.update(id, data);
        } else {
          await dataLayer.team.create(data);
        }
      } catch (error) {
        console.error('Supabase Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-team']);
      toast.success('Team member saved successfully');
      navigate(createPageUrl('AdminTeam'));
    },
    onError: (error) => {
      console.error('Mutation Error:', error);
      toast.error('Failed to save team member: ' + (error.message || 'Unknown error'));
    }
  });

  const handleUpload = (url) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  if (isEditing && isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('AdminTeam'))}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-3xl font-bold text-slate-900">{isEditing ? 'Edit' : 'New'} Team Member</h1>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (!formData.name) {
            toast.error('Name is required');
            return;
          }
          if (formData.profile_url && !/^https?:\/\//.test(formData.profile_url)) {
            toast.error('Profile URL must start with http:// or https://');
            return;
          }
          saveMutation.mutate(formData);
        }} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Member Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="en" className="w-full">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">Arabic</TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-4 mt-4">
                  <div><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required className="mt-1" /></div>
                  <div><Label>Role *</Label><Input value={formData.role} onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))} required className="mt-1" /></div>
                  <div><Label>Bio</Label><Textarea value={formData.bio} onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))} className="mt-1" rows={4} /></div>
                </TabsContent>

                <TabsContent value="ar" className="space-y-4 mt-4" dir="rtl">
                  <div><Label>الاسم (Name)</Label><Input value={formData.name_ar} onChange={(e) => setFormData(p => ({ ...p, name_ar: e.target.value }))} className="mt-1" /></div>
                  <div><Label>المسمى الوظيفي (Role)</Label><Input value={formData.role_ar} onChange={(e) => setFormData(p => ({ ...p, role_ar: e.target.value }))} className="mt-1" /></div>
                  <div><Label>نبذة (Bio)</Label><Textarea value={formData.bio_ar} onChange={(e) => setFormData(p => ({ ...p, bio_ar: e.target.value }))} className="mt-1" rows={4} /></div>
                </TabsContent>
              </Tabs>

              <div className="border-t pt-4 mt-4 space-y-4">
                <h3 className="font-medium">Common Details</h3>
                <div>
                  <Label>Profile Link</Label>
                  <Input
                    value={formData.profile_url}
                    onChange={(e) => setFormData(p => ({ ...p, profile_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">Link to LinkedIn, Instagram, Facebook, etc.</p>
                </div>
                <div>
                  <Label>Photo</Label>
                  <div className="mt-2">
                    <FileUpload onUploadComplete={handleUpload} currentFile={formData.image_url} storagePath="team" validation={{ width: 800, height: 800, aspectRatio: 1, aspectLabel: '1:1 square', maxImageMB: 1, note: 'Use a clear portrait with the face centred.' }} />
                  </div>
                </div>
                <div><Label>Display Order</Label><Input type="number" value={formData.order} onChange={(e) => setFormData(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} className="mt-1 w-24" /></div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('AdminTeam'))}>Cancel</Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}{isEditing ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
