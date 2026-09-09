import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { ArrowLeft, Save, Loader2, Plus, Trash, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import FileUpload from '../components/FileUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AdminLayout from '../components/admin/AdminLayout';

const pages = [
  { id: 'web-dev', name: 'Web Development', slug: 'web-development' },
  { id: 'app-dev', name: 'App Development', slug: 'app-development' },
  { id: 'marketing', name: 'Digital Marketing', slug: 'digital-marketing' },
  { id: 'automation', name: 'Automation', slug: 'automation' },
  { id: 'production', name: 'Production', slug: 'production' },
  { id: 'it-services', name: 'IT Services', slug: 'it-services' }
];

export default function AdminCMSServices() {
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState(pages[0]);
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: servicePages = [], isLoading } = useQuery({
    queryKey: ['service-pages'],
    queryFn: () => dataLayer.servicePageContent.getAll()
  });

  const currentPageContent = servicePages.find(p => p.page_slug === selectedPage.slug) || {};

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (currentPageContent.id) {
        await dataLayer.servicePageContent.update(currentPageContent.id, { ...data, page_slug: selectedPage.slug });
      } else {
        await dataLayer.servicePageContent.create({ ...data, page_slug: selectedPage.slug });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['service-pages']);
      toast.success('Page content saved successfully');
    },
    onError: () => toast.error('Failed to save content')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataLayer.servicePageContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['service-page-content']);
      toast.success('Service page deleted!');
    }
  });

  const handleEdit = (service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingService({
      page_slug: 'web-development',
      hero_title: '',
      hero_subtitle: '',
      hero_description: '',
      hero_image: '',
      cta_text: 'Get Started',
      cta_link: 'Contact'
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <AdminLayout currentPage="AdminCMSServices">
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('AdminDashboard')}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Service Pages CMS</h1>
              <p className="text-slate-600">Manage all service page content</p>
            </div>
          </div>
          <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Service Page
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicePages.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base capitalize flex-1">
                    {service.page_slug.replace(/-/g, ' ')}
                  </CardTitle>
                  {service.hero_image && (
                    <img src={service.hero_image} alt="" className="w-12 h-12 object-cover rounded-lg ml-2" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                  {service.hero_title || 'No title set'}
                </p>
                <p className="text-xs text-slate-500 mb-4 line-clamp-1">
                  {service.hero_description || 'No description'}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(service)} className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Delete this service page?')) {
                        deleteMutation.mutate(service.id);
                      }
                    }}
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {servicePages.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 mb-4">No service pages yet</p>
              <Button onClick={handleNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Service Page
              </Button>
            </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService?.id ? 'Edit' : 'New'} Service Page
              </DialogTitle>
            </DialogHeader>
            {editingService && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate(editingService);
                }}
                className="space-y-4"
              >
                <div>
                  <Label>Page Slug</Label>
                  <select
                    value={editingService.page_slug}
                    onChange={(e) =>
                      setEditingService({ ...editingService, page_slug: e.target.value })
                    }
                    className="w-full mt-2 px-3 py-2 border rounded-lg"
                    disabled={!!editingService.id}
                  >
                    <option value="web-development">Web Development</option>
                    <option value="app-development">App Development</option>
                    <option value="digital-marketing">Digital Marketing</option>
                    <option value="automation">Automation</option>
                    <option value="production">Production</option>
                    <option value="it-services">IT Services</option>
                    <option value="development-services">Development Services</option>
                    <option value="marketing-services">Marketing Services</option>
                  </select>
                </div>
                <div>
                  <Label>Hero Title</Label>
                  <Input
                    value={editingService.hero_title || ''}
                    onChange={(e) =>
                      setEditingService({ ...editingService, hero_title: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Hero Subtitle</Label>
                  <Input
                    value={editingService.hero_subtitle || ''}
                    onChange={(e) =>
                      setEditingService({ ...editingService, hero_subtitle: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Hero Description</Label>
                  <Textarea
                    value={editingService.hero_description || ''}
                    onChange={(e) =>
                      setEditingService({ ...editingService, hero_description: e.target.value })
                    }
                    className="mt-2"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Hero Image</Label>
                  <FileUpload
                    value={editingService.hero_image || ''}
                    onChange={(url) =>
                      setEditingService({ ...editingService, hero_image: url })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>CTA Button Text</Label>
                    <Input
                      value={editingService.cta_text || ''}
                      onChange={(e) =>
                        setEditingService({ ...editingService, cta_text: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>CTA Button Link</Label>
                    <Input
                      value={editingService.cta_link || ''}
                      onChange={(e) =>
                        setEditingService({ ...editingService, cta_link: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={saveMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Service Page
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </AdminLayout>
  );
}