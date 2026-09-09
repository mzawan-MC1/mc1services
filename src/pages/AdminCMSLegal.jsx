import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Save, Loader2, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AdminLayout from '../components/admin/AdminLayout';

const legalPages = [
  { id: 'privacy-policy', name: 'Privacy Policy' },
  { id: 'terms-of-service', name: 'Terms of Service' }
];

export default function AdminCMSLegal() {
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState('privacy-policy');

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['legal-pages'],
    queryFn: () => dataLayer.legalPages.getAll()
  });

  const currentPageData = pages.find(p => p.slug === selectedPage);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    title_ar: '',
    content_ar: ''
  });

  React.useEffect(() => {
    if (currentPageData) {
      setFormData({
        title: currentPageData.title || '',
        content: currentPageData.content || '',
        title_ar: currentPageData.title_ar || '',
        content_ar: currentPageData.content_ar || ''
      });
    } else {
      // Defaults if not found (though DB should have them)
      const pageInfo = legalPages.find(p => p.id === selectedPage);
      setFormData({
        title: pageInfo?.name || '',
        content: '',
        title_ar: '',
        content_ar: ''
      });
    }
  }, [currentPageData, selectedPage]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (currentPageData) {
        await dataLayer.legalPages.update(currentPageData.id, data);
      } else {
        await dataLayer.legalPages.create({
          ...data,
          slug: selectedPage
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['legal-pages']);
      toast.success('Legal page content saved!');
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error(`Failed to save: ${error.message || 'Unknown error'}`);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <AdminLayout currentPage="AdminCMSLegal">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Legal Pages</h1>
          <p className="text-slate-600 mt-1">Manage Privacy Policy and Terms of Service</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {legalPages.map(page => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    selectedPage === page.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {page.name}
                  {pages.find(p => p.slug === page.id) && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <Tabs defaultValue="en" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ar">Arabic</TabsTrigger>
              </TabsList>

              <TabsContent value="en">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      English Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Page Title</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="e.g. Privacy Policy"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Content (HTML supported)</Label>
                      <Textarea
                        value={formData.content}
                        onChange={(e) => handleChange('content', e.target.value)}
                        placeholder="<p>Enter your content here...</p>"
                        rows={12}
                        className="mt-2 font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500 mt-1">You can use HTML tags for formatting (h1, p, ul, li, etc.)</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ar">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Arabic Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Page Title (Arabic)</Label>
                      <Input
                        value={formData.title_ar}
                        onChange={(e) => handleChange('title_ar', e.target.value)}
                        placeholder="سياسة الخصوصية"
                        className="mt-2 text-right"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <Label>Content (Arabic HTML)</Label>
                      <Textarea
                        value={formData.content_ar}
                        onChange={(e) => handleChange('content_ar', e.target.value)}
                        placeholder="<p>أدخل المحتوى هنا...</p>"
                        rows={12}
                        className="mt-2 font-mono text-sm text-right"
                        dir="rtl"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Content
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
