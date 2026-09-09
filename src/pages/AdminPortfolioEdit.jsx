import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { storageHelpers } from '../components/supabaseClient';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '../components/FileUpload';
import GalleryUpload from '../components/GalleryUpload';
import AdminLayout from '../components/admin/AdminLayout';
import AdminRoute from '../components/AdminRoute';

export default function AdminPortfolioEdit() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = id !== 'new';

  const { data: project, isLoading } = useQuery({
    queryKey: ['portfolio-project', id],
    queryFn: () => dataLayer.portfolio.getById(id),
    enabled: isEditing
  });

  const { data: images = [] } = useQuery({
    queryKey: ['portfolio-images', id],
    queryFn: () => dataLayer.portfolio.getImages(id),
    enabled: isEditing
  });

  const [formData, setFormData] = useState({
    title: '',
    client_name: '',
    category: 'web_development',
    status: 'draft',
    main_image_url: '',
    short_description: '',
    long_description: '',
    industry: '',
    project_date: '',
    completion_date: '',
    project_overview: '',
    tech_stack_text: '',
    live_project_url: '',
    gallery_items: [],
    // Arabic fields
    title_ar: '',
    short_description_ar: '',
    long_description_ar: '',
    project_overview_ar: ''
  });

  useEffect(() => {
    if (project) {
      const toISO = (val) => {
        if (!val) return '';
        const isoMatch = /^\d{4}-\d{2}-\d{2}$/;
        if (isoMatch.test(val)) return val;
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth()+1).padStart(2,'0');
          const dd = String(d.getDate()).padStart(2,'0');
          return `${yyyy}-${mm}-${dd}`;
        }
        return '';
      };
      setFormData({
        title: project.title || '',
        client_name: project.client_name || '',
        category: project.category || 'web_development',
        status: project.status || 'draft',
        main_image_url: project.main_image_url || '',
        short_description: project.short_description || '',
        long_description: project.long_description || '',
        industry: project.industry || '',
        project_date: toISO(project.project_date) || '',
        completion_date: toISO(project.completion_date) || '',
        project_overview: project.project_overview || '',
        tech_stack_text: Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : '',
        live_project_url: project.live_project_url || '',
        gallery_items: images.map((img, idx) => ({ image_url: img.image_url, caption: img.caption || '', display_order: img.display_order ?? idx })),
        // Arabic
        title_ar: project.title_ar || '',
        short_description_ar: project.short_description_ar || '',
        long_description_ar: project.long_description_ar || '',
        project_overview_ar: project.project_overview_ar || ''
      });
    }
  }, [project, images]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const normalizeDate = (val) => {
        if (!val) return null;
        // Accept YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY
        const isoMatch = /^\d{4}-\d{2}-\d{2}$/;
        if (isoMatch.test(val)) return val;
        const slashMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const m = val.match(slashMatch);
        if (m) {
          const [, a, b, y] = m;
          // Assume locale entered MM/DD/YYYY; try both safely
          const mmdd = `${y}-${String(a).padStart(2,'0')}-${String(b).padStart(2,'0')}`;
          const ddmm = `${y}-${String(b).padStart(2,'0')}-${String(a).padStart(2,'0')}`;
          // Prefer a valid date (new Date and check month/day)
          const asDate = (s) => {
            const d = new Date(s);
            return isNaN(d.getTime()) ? null : s;
          };
          return asDate(mmdd) || asDate(ddmm);
        }
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth()+1).padStart(2,'0');
          const dd = String(d.getDate()).padStart(2,'0');
          return `${yyyy}-${mm}-${dd}`;
        }
        return null;
      };
      const payload = {
        title: data.title,
        client_name: data.client_name,
        category: data.category,
        status: data.status,
        main_image_url: data.main_image_url,
        short_description: data.short_description,
        long_description: data.long_description,
        industry: data.industry,
        project_date: normalizeDate(data.project_date),
        completion_date: normalizeDate(data.completion_date),
        project_overview: data.project_overview,
        tech_stack: data.tech_stack_text.split(',').map((t) => t.trim()).filter((t) => t.length > 0),
        live_project_url: data.live_project_url,
        // Arabic
        title_ar: data.title_ar,
        short_description_ar: data.short_description_ar,
        long_description_ar: data.long_description_ar,
        project_overview_ar: data.project_overview_ar
      };
      let projectId = id;
      if (isEditing) {
        if (project?.main_image_url && project.main_image_url !== payload.main_image_url) {
          await storageHelpers.deleteFileByPublicUrl(project.main_image_url);
        }
        await dataLayer.portfolio.update(id, payload);
      } else {
        const created = await dataLayer.portfolio.create(payload);
        projectId = created.id;
      }
      await dataLayer.portfolio.setImages(projectId, data.gallery_items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-portfolio']);
      toast.success('Project saved successfully');
      navigate(createPageUrl('AdminPortfolio'));
    },
    onError: (e) => {
      const message = e?.message || (typeof e === 'string' ? e : null) || 'Failed to save project';
      toast.error(message);
    }
  });

  const handleMainImageUpload = (url) => {
    setFormData(prev => ({ ...prev, main_image_url: url }));
  };

  const handleGalleryChange = (items) => {
    setFormData(prev => ({ ...prev, gallery_items: items }));
  };

  if (isEditing && isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <AdminRoute>
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('AdminPortfolio'))}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-3xl font-bold text-slate-900">{isEditing ? 'Edit' : 'New'} Project</h1>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web_development">Web Development</SelectItem>
                      <SelectItem value="app_development">App Development</SelectItem>
                      <SelectItem value="digital_marketing">Digital Marketing</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="it_services">IT Services</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="apps">Apps</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="branding">Branding</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="en" className="w-full mt-4">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">Arabic</TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-4 mt-4">
                  <div><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} required className="mt-1" /></div>
                  <div><Label>Short Description</Label><Textarea value={formData.short_description} onChange={(e) => setFormData(p => ({ ...p, short_description: e.target.value }))} className="mt-1" rows={3} /></div>
                  <div><Label>Long Description</Label><Textarea value={formData.long_description} onChange={(e) => setFormData(p => ({ ...p, long_description: e.target.value }))} className="mt-1" rows={6} /></div>
                  <div><Label>Project Overview</Label><Textarea value={formData.project_overview} onChange={(e) => setFormData(p => ({ ...p, project_overview: e.target.value }))} className="mt-1" rows={4} /></div>
                </TabsContent>

                <TabsContent value="ar" className="space-y-4 mt-4" dir="rtl">
                  <div><Label>عنوان المشروع (Title)</Label><Input value={formData.title_ar} onChange={(e) => setFormData(p => ({ ...p, title_ar: e.target.value }))} className="mt-1" /></div>
                  <div><Label>وصف قصير (Short Description)</Label><Textarea value={formData.short_description_ar} onChange={(e) => setFormData(p => ({ ...p, short_description_ar: e.target.value }))} className="mt-1" rows={3} /></div>
                  <div><Label>وصف طويل (Long Description)</Label><Textarea value={formData.long_description_ar} onChange={(e) => setFormData(p => ({ ...p, long_description_ar: e.target.value }))} className="mt-1" rows={6} /></div>
                  <div><Label>نظرة عامة (Overview)</Label><Textarea value={formData.project_overview_ar} onChange={(e) => setFormData(p => ({ ...p, project_overview_ar: e.target.value }))} className="mt-1" rows={4} /></div>
                </TabsContent>
              </Tabs>

              <div className="border-t pt-4 mt-4 space-y-4">
                <h3 className="font-medium">Common Details</h3>
                <div><Label>Client Name</Label><Input value={formData.client_name} onChange={(e) => setFormData(p => ({ ...p, client_name: e.target.value }))} className="mt-1" /></div>

                <div>
                    <Label>Main Image</Label>
                    <div className="text-xs text-slate-500 mb-2">Required size: 1200 x 800 px</div>
                    <div className="mt-2">
                    <FileUpload
                        onUploadComplete={handleMainImageUpload}
                        currentFile={formData.main_image_url}
                        validation={{ width: 1200, height: 800 }}
                    />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div><Label>Industry</Label><Input value={formData.industry} onChange={(e) => setFormData(p => ({ ...p, industry: e.target.value }))} className="mt-1" /></div>
                    <div><Label>Project Date</Label><Input type="date" value={formData.project_date} onChange={(e) => setFormData(p => ({ ...p, project_date: e.target.value }))} className="mt-1" /></div>
                    <div><Label>Completed Date</Label><Input type="date" value={formData.completion_date} onChange={(e) => setFormData(p => ({ ...p, completion_date: e.target.value }))} className="mt-1" /></div>
                </div>
                <div><Label>Tech Stack (comma-separated)</Label><Input value={formData.tech_stack_text} onChange={(e) => setFormData(p => ({ ...p, tech_stack_text: e.target.value }))} className="mt-1" /></div>
                <div><Label>Live Project URL</Label><Input value={formData.live_project_url} onChange={(e) => setFormData(p => ({ ...p, live_project_url: e.target.value }))} className="mt-1" /></div>
              </div>

            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
              <div className="text-sm text-slate-500 font-normal">Required size: 1000 x 700 px</div>
            </CardHeader>
            <CardContent>
              <GalleryUpload
                value={formData.gallery_items}
                onChange={handleGalleryChange}
                label="Project Gallery"
                validation={{ width: 1000, height: 700 }}
              />
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('AdminPortfolio'))}>Cancel</Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}{isEditing ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
    </AdminRoute>
  );
}
