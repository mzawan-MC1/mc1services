import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { ArrowLeft, Save, Loader2, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import FileUpload from '../components/FileUpload';
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminServiceEdit() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '', description: '', full_description: '', category: 'development',
    icon: '', features: [], image_url: '', order: 0, is_active: true
  });
  const [newFeature, setNewFeature] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: () => dataLayer.services.getById(id),
    enabled: !!isEditing
  });

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '', description: service.description || '',
        full_description: service.full_description || '', category: service.category || 'development',
        icon: service.icon || '', features: service.features || [],
        image_url: service.image_url || '', order: service.order || 0, is_active: service.is_active !== false
      });
    }
  }, [service]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        await dataLayer.services.update(id, data);
      } else {
        await dataLayer.services.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-services']);
      toast.success('Service saved successfully');
      navigate(createPageUrl('AdminServices'));
    },
    onError: () => toast.error('Failed to save service')
  });

  const handleUpload = (url) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  if (isEditing && isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('AdminServices')}><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <h1 className="text-3xl font-bold text-slate-900">{isEditing ? 'Edit' : 'New'} Service</h1>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Service Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} required className="mt-1" /></div>
              <div><Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Short Description</Label><Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={2} /></div>
              <div><Label>Full Description</Label><Textarea value={formData.full_description} onChange={(e) => setFormData(p => ({ ...p, full_description: e.target.value }))} className="mt-1" rows={4} /></div>
              <div><Label>Icon Name (Lucide)</Label><Input value={formData.icon} onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))} className="mt-1" placeholder="e.g., Globe, Smartphone" /></div>
              <div>
                <Label>Image</Label>
                <div className="mt-2">
                  <FileUpload onUploadComplete={handleUpload} currentFile={formData.image_url} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Features</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Add feature..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                <Button type="button" onClick={addFeature}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((f, i) => (
                  <Badge key={i} variant="secondary" className="pr-1">{f}<button type="button" onClick={() => setFormData(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }))} className="ml-2 hover:text-red-500"><X className="w-3 h-3" /></button></Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div><Label>Active</Label><p className="text-sm text-slate-500">Show this service on the website</p></div>
                <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData(p => ({ ...p, is_active: v }))} />
              </div>
              <div><Label>Display Order</Label><Input type="number" value={formData.order} onChange={(e) => setFormData(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} className="mt-1 w-24" /></div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link to={createPageUrl('AdminServices')}><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}{isEditing ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}