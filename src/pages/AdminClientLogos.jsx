import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import FileUpload from '../components/FileUpload';
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminClientLogos() {
  const queryClient = useQueryClient();
  const [editingLogo, setEditingLogo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', website_url: '', logo_url: '' });

  const { data: logos = [], isLoading } = useQuery({
    queryKey: ['client-logos'],
    queryFn: () => dataLayer.clientLogos.getAll()
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingLogo) {
        await dataLayer.clientLogos.update(editingLogo.id, data);
      } else {
        await dataLayer.clientLogos.create({ ...data, order: logos.length });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['client-logos']);
      setShowForm(false);
      toast.success('Client logo saved');
      // Reset form for next add and exit edit mode
      setEditingLogo(null);
      setFormData({ name: '', website_url: '', logo_url: '' });
    },
    onError: () => toast.error('Failed to save logo')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataLayer.clientLogos.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['client-logos']);
      toast.success('Logo deleted');
    },
    onError: () => toast.error('Failed to delete logo')
  });

  const handleUpload = (url) => {
    setFormData(prev => ({ ...prev, logo_url: url }));
  };

  return (
    <AdminLayout currentPage="AdminClientLogos">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Client Logos</h1>
            <p className="text-slate-600 mt-1">Manage client logos for homepage</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />Add Logo
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader><CardTitle>{editingLogo ? 'Edit Logo' : 'Add New Logo'}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Company Name *</Label><Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required className="mt-1" /></div>
                  <div><Label>Website URL</Label><Input type="url" inputMode="url" value={formData.website_url} onChange={(e) => setFormData(p => ({ ...p, website_url: e.target.value }))} className="mt-1" placeholder="https://example.com" /></div>
                </div>
                <div>
                  <Label>Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {formData.logo_url ? (
                      <div className="relative">
                        <img src={formData.logo_url} alt="" className="h-16 object-contain" />
                        <button type="button" onClick={() => setFormData(p => ({ ...p, logo_url: '' }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <div className="w-32">
                        <FileUpload onUploadComplete={handleUpload} storagePath="client-logos" validation={{ width: 480, height: 200, aspectRatio: 2.4, aspectLabel: '12:5', maxImageMB: 0.15, note: 'Use the original full-colour logo on a transparent background.' }} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Recommended: 480 × 200 px, maximum 150 KB. Use the original full-colour transparent PNG or WebP so the hover effect can restore its real colours.</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingLogo(null); setFormData({ name: '', website_url: '', logo_url: '' }); }} className="border-slate-300 text-slate-700 hover:bg-slate-100">Cancel</Button>
                  <Button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">{editingLogo ? 'Save Changes' : 'Add Logo'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : logos.length === 0 ? (
          <Card className="text-center py-12"><CardContent><p className="text-slate-500">No client logos yet</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {logos.map(logo => (
              <Card key={logo.id}>
                <CardContent className="p-4 text-center">
                  {logo.logo_url ? (
                    <img src={logo.logo_url} alt={logo.name} className="h-12 object-contain mx-auto mb-2" />
                  ) : (
                    <div className="h-12 bg-slate-100 rounded flex items-center justify-center mb-2"><span className="text-slate-500 font-medium">{logo.name}</span></div>
                  )}
                  <p className="text-sm font-medium truncate">{logo.name}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingLogo(logo); setShowForm(true); setFormData({ name: logo.name || '', website_url: logo.website_url || '', logo_url: logo.logo_url || '' }); }}>
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete Logo?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={() => deleteMutation.mutate(logo.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
