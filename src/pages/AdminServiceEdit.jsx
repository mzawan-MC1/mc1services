import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { ArrowLeft, Save, Loader2, X } from 'lucide-react';
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
    title: '', title_ar: '', description: '', description_ar: '', full_description: '', full_description_ar: '',
    category: 'development', category_ar: '', slug: '', parent_id: '', service_group: '', page_url: '',
    menu_description: '', menu_description_ar: '', menu_image_url: '', icon: '', features: [], features_ar: [],
    image_url: '', order: 0, is_active: true, is_featured: false
  });
  const [newFeature, setNewFeature] = useState('');
  const [newFeatureAr, setNewFeatureAr] = useState('');

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: () => dataLayer.services.getById(id),
    enabled: !!isEditing
  });

  const { data: allServices = [] } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => dataLayer.services.getAll()
  });

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '', title_ar: service.title_ar || '',
        description: service.description || '', description_ar: service.description_ar || '',
        full_description: service.full_description || '', full_description_ar: service.full_description_ar || '',
        category: service.category || 'development', category_ar: service.category_ar || '',
        slug: service.slug || '', parent_id: service.parent_id || '', service_group: service.service_group || '',
        page_url: service.page_url || '',
        menu_description: service.menu_description || '', menu_description_ar: service.menu_description_ar || '',
        menu_image_url: service.menu_image_url || '', icon: service.icon || '',
        features: service.features || [], features_ar: service.features_ar || [],
        image_url: service.image_url || '', order: service.order || 0, is_active: service.is_active !== false,
        is_featured: Boolean(service.is_featured)
      });
    }
  }, [service]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        parent_id: data.parent_id || null,
        slug: (data.slug || data.title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      };
      if (isEditing) {
        await dataLayer.services.update(id, payload);
      } else {
        await dataLayer.services.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-services']);
      toast.success('Service saved successfully');
      navigate('/admin/services');
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

  const addArabicFeature = () => {
    if (newFeatureAr.trim()) {
      setFormData(prev => ({ ...prev, features_ar: [...prev.features_ar, newFeatureAr.trim()] }));
      setNewFeatureAr('');
    }
  };

  if (isEditing && isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/services"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <h1 className="text-3xl font-bold text-slate-900">{isEditing ? 'Edit' : 'New'} Service</h1>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Service Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>English Title *</Label><Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} required className="mt-1" /></div>
                <div dir="rtl"><Label>Arabic Title</Label><Input value={formData.title_ar} onChange={(e) => setFormData(p => ({ ...p, title_ar: e.target.value }))} className="mt-1" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>SEO Slug</Label><Input value={formData.slug} onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))} placeholder="ai-automation" className="mt-1" /></div>
                <div><Label>Service Group</Label><Input value={formData.service_group} onChange={(e) => setFormData(p => ({ ...p, service_group: e.target.value }))} placeholder="AI & Automation" className="mt-1" /></div>
              </div>
              <div><Label>Public Page Link</Label><Input value={formData.page_url} onChange={(e) => setFormData(p => ({ ...p, page_url: e.target.value }))} placeholder="/Automation" className="mt-1" /></div>
              <div><Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Custom Software</SelectItem>
                    <SelectItem value="ai_automation">AI & Automation</SelectItem>
                    <SelectItem value="application_development">Application Development</SelectItem>
                    <SelectItem value="saas_engineering">SaaS Engineering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="it_services">Cloud & IT</SelectItem>
                    <SelectItem value="production">Creative Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div dir="rtl"><Label>Arabic Category Label</Label><Input value={formData.category_ar} onChange={(e) => setFormData(p => ({ ...p, category_ar: e.target.value }))} className="mt-1" /></div>
              <div><Label>Parent Service</Label>
                <select value={formData.parent_id} onChange={(e) => setFormData(p => ({ ...p, parent_id: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
                  <option value="">Top-level service</option>
                  {allServices.filter((item) => item.id !== id).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>English Short Description</Label><Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={3} /></div>
                <div dir="rtl"><Label>Arabic Short Description</Label><Textarea value={formData.description_ar} onChange={(e) => setFormData(p => ({ ...p, description_ar: e.target.value }))} className="mt-1" rows={3} /></div>
                <div><Label>English Full Description</Label><Textarea value={formData.full_description} onChange={(e) => setFormData(p => ({ ...p, full_description: e.target.value }))} className="mt-1" rows={5} /></div>
                <div dir="rtl"><Label>Arabic Full Description</Label><Textarea value={formData.full_description_ar} onChange={(e) => setFormData(p => ({ ...p, full_description_ar: e.target.value }))} className="mt-1" rows={5} /></div>
                <div><Label>English Mega-Menu Description</Label><Textarea value={formData.menu_description} onChange={(e) => setFormData(p => ({ ...p, menu_description: e.target.value }))} className="mt-1" rows={2} /></div>
                <div dir="rtl"><Label>Arabic Mega-Menu Description</Label><Textarea value={formData.menu_description_ar} onChange={(e) => setFormData(p => ({ ...p, menu_description_ar: e.target.value }))} className="mt-1" rows={2} /></div>
              </div>
              <div><Label>Icon Name (Lucide)</Label><Input value={formData.icon} onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))} className="mt-1" placeholder="e.g., Globe, Smartphone" /></div>
              <div>
                <Label>Image</Label>
                <div className="mt-2">
                  <FileUpload onUploadComplete={handleUpload} currentFile={formData.image_url} storagePath="services" validation={{ width: 1600, height: 1000, aspectRatio: 1.6, aspectLabel: '8:5', maxImageMB: 1.5, note: 'WebP or AVIF is preferred.' }} />
                </div>
              </div>
              <FileUpload label="Mega-Menu Card Image" value={formData.menu_image_url} onChange={(url) => setFormData(p => ({ ...p, menu_image_url: url }))} storagePath="navigation/services" validation={{ width: 1200, height: 750, aspectRatio: 1.6, aspectLabel: '8:5', maxImageMB: 1 }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Features (English and Arabic)</CardTitle></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="flex gap-2 mb-3"><Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Add English feature..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} /><Button type="button" onClick={addFeature}>Add</Button></div>
                <div className="flex flex-wrap gap-2">{formData.features.map((f, i) => <Badge key={i} variant="secondary" className="pr-1">{f}<button type="button" onClick={() => setFormData(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }))} className="ml-2 hover:text-red-500"><X className="w-3 h-3" /></button></Badge>)}</div>
              </div>
              <div dir="rtl">
                <div className="flex gap-2 mb-3"><Input value={newFeatureAr} onChange={(e) => setNewFeatureAr(e.target.value)} placeholder="أضف ميزة بالعربية..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArabicFeature())} /><Button type="button" onClick={addArabicFeature}>إضافة</Button></div>
                <div className="flex flex-wrap gap-2">{formData.features_ar.map((f, i) => <Badge key={i} variant="secondary" className="pl-1">{f}<button type="button" onClick={() => setFormData(p => ({ ...p, features_ar: p.features_ar.filter((_, idx) => idx !== i) }))} className="mr-2 hover:text-red-500"><X className="w-3 h-3" /></button></Badge>)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div><Label>Active</Label><p className="text-sm text-slate-500">Show this service on the website</p></div>
                <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData(p => ({ ...p, is_active: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <div><Label>Featured</Label><p className="text-sm text-slate-500">Allow this service in homepage and mega-menu highlights</p></div>
                <Switch checked={formData.is_featured} onCheckedChange={(v) => setFormData(p => ({ ...p, is_featured: v }))} />
              </div>
              <div><Label>Display Order</Label><Input type="number" value={formData.order} onChange={(e) => setFormData(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} className="mt-1 w-24" /></div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link to="/admin/services"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}{isEditing ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
