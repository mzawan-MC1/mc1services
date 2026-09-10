import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../components/admin/AdminLayout';
import FileUpload from '../components/FileUpload';
import { dataLayer } from '../components/dataLayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const emptyIndustry = {
  slug: '',
  name: '',
  name_ar: '',
  short_description: '',
  short_description_ar: '',
  image_url: '',
  icon: '',
  display_order: 0,
  is_active: true,
  is_featured: false
};

const makeSlug = (value) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export default function AdminIndustries() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyIndustry);

  const { data: industries = [], isLoading } = useQuery({
    queryKey: ['admin-industries'],
    queryFn: () => dataLayer.industries.getAll()
  });

  useEffect(() => {
    if (!formData.slug && formData.name) {
      setFormData((current) => ({ ...current, slug: makeSlug(current.name) }));
    }
  }, [formData.name, formData.slug]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const normalized = { ...payload, slug: makeSlug(payload.slug || payload.name) };
      return editingId
        ? dataLayer.industries.update(editingId, normalized)
        : dataLayer.industries.create(normalized);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-industries'] });
      setEditingId(null);
      setFormData(emptyIndustry);
      toast.success('Industry saved');
    },
    onError: (error) => toast.error(error?.message || 'Industry could not be saved')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataLayer.industries.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-industries'] });
      toast.success('Industry deleted');
    },
    onError: (error) => toast.error(error?.message || 'Industry could not be deleted')
  });

  const editIndustry = (industry) => {
    setEditingId(industry.id);
    setFormData({ ...emptyIndustry, ...industry });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Industry Management</h1>
          <p className="mt-1 text-slate-600">Manage the industries used by projects, filters, the homepage and the mega-menu.</p>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{editingId ? 'Edit Industry' : 'Add Industry'}</CardTitle>
            {editingId && <Button type="button" variant="ghost" size="icon" onClick={() => { setEditingId(null); setFormData(emptyIndustry); }}><X className="h-4 w-4" /></Button>}
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(formData); }}>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Name *</Label><Input required className="mt-1" value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} /></div>
                <div><Label>Slug *</Label><Input required className="mt-1" value={formData.slug} onChange={(event) => setFormData((current) => ({ ...current, slug: event.target.value }))} /></div>
                <div dir="rtl"><Label>Arabic Name</Label><Input className="mt-1" value={formData.name_ar || ''} onChange={(event) => setFormData((current) => ({ ...current, name_ar: event.target.value }))} /></div>
                <div><Label>Icon Name</Label><Input className="mt-1" placeholder="Car, Ship, Gamepad2…" value={formData.icon || ''} onChange={(event) => setFormData((current) => ({ ...current, icon: event.target.value }))} /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Short Description</Label><Textarea className="mt-1" rows={3} value={formData.short_description || ''} onChange={(event) => setFormData((current) => ({ ...current, short_description: event.target.value }))} /></div>
                <div dir="rtl"><Label>Arabic Description</Label><Textarea className="mt-1" rows={3} value={formData.short_description_ar || ''} onChange={(event) => setFormData((current) => ({ ...current, short_description_ar: event.target.value }))} /></div>
              </div>
              <FileUpload
                label="Industry Card Image"
                value={formData.image_url || ''}
                onChange={(url) => setFormData((current) => ({ ...current, image_url: url }))}
                storagePath="industries"
                validation={{ width: 1200, height: 800, aspectRatio: 1.5, aspectLabel: '3:2', maxImageMB: 1, note: 'WebP or AVIF is preferred.' }}
              />
              <div className="grid gap-4 md:grid-cols-3">
                <div><Label>Display Order</Label><Input type="number" className="mt-1" value={formData.display_order} onChange={(event) => setFormData((current) => ({ ...current, display_order: Number(event.target.value) || 0 }))} /></div>
                <label className="flex items-center gap-3 self-end rounded-lg border p-3"><input type="checkbox" checked={formData.is_active} onChange={(event) => setFormData((current) => ({ ...current, is_active: event.target.checked }))} /><span>Active</span></label>
                <label className="flex items-center gap-3 self-end rounded-lg border p-3"><input type="checkbox" checked={formData.is_featured} onChange={(event) => setFormData((current) => ({ ...current, is_featured: event.target.checked }))} /><span>Featured</span></label>
              </div>
              <Button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 text-white hover:bg-blue-700">
                {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {editingId ? 'Save Industry' : 'Add Industry'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Industries</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {industries.map((industry) => (
                  <div key={industry.id} className="flex gap-4 rounded-xl border p-4">
                    {industry.image_url ? <img src={industry.image_url} alt="" className="h-20 w-28 rounded-lg object-cover" /> : <div className="h-20 w-28 rounded-lg bg-slate-100" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2"><h2 className="truncate font-semibold">{industry.name}</h2>{!industry.is_active && <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Hidden</span>}</div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{industry.short_description || 'No description yet'}</p>
                      <div className="mt-3 flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => editIndustry(industry)}><Edit className="mr-1 h-3.5 w-3.5" />Edit</Button>
                        <Button type="button" size="sm" variant="outline" className="text-red-600" onClick={() => { if (window.confirm(`Delete ${industry.name}? Project links will be removed, but projects remain.`)) deleteMutation.mutate(industry.id); }}><Trash2 className="mr-1 h-3.5 w-3.5" />Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
