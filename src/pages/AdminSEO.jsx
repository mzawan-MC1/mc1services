import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Save, Loader2, Search, FileText, Download, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AdminLayout from '../components/admin/AdminLayout';
import FileUpload from '../components/FileUpload';

const commonPages = [
  { id: 'home', name: 'Home Page', url: '/' },
  { id: 'about', name: 'About Us', url: '/About' },
  { id: 'contact', name: 'Contact', url: '/Contact' },
  { id: 'portfolio', name: 'Portfolio', url: '/Portfolio' },
  { id: 'tools', name: 'Tools Hub', url: '/Tools' },
  { id: 'web-development', name: 'Web Development', url: '/WebDevelopment' },
  { id: 'app-development', name: 'App Development', url: '/AppDevelopment' },
  { id: 'digital-marketing', name: 'Digital Marketing', url: '/DigitalMarketing' },
  { id: 'automation', name: 'Automation', url: '/Automation' },
  { id: 'production', name: 'Production', url: '/Production' },
  { id: 'it-services', name: 'IT Services', url: '/ITServices' },
  { id: 'marketing-services', name: 'Marketing Services', url: '/MarketingServices' },
  { id: 'development-services', name: 'Development Services', url: '/DevelopmentServices' },
  { id: 'privacy-policy', name: 'Privacy Policy', url: '/privacy-policy' },
  { id: 'terms-of-service', name: 'Terms of Service', url: '/terms-of-service' },
  { id: 'salary-loan-calculator', name: 'Salary Loan Calculator', url: '/SalaryLoanCalculator' },
  { id: 'traffic-fines-checker', name: 'Traffic Fines Checker', url: '/TrafficFinesChecker' },
  { id: 'visa-overstay-calculator', name: 'Visa Overstay Calculator', url: '/VisaOverstayCalculator' },
  { id: 'toll-estimator', name: 'Toll Estimator', url: '/TollEstimator' },
  { id: 'currency-converter', name: 'Currency Converter', url: '/CurrencyConverter' },
];

export default function AdminSEO() {
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState('home');

  const { data: allSEO = [], isLoading } = useQuery({
    queryKey: ['page-seo'],
    queryFn: () => dataLayer.pageSEO.getAll()
  });

  const currentPageSEO = allSEO.find(s => s.page_path === selectedPage);

  const [formData, setFormData] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: '',
    robots: 'index, follow',
    // Arabic fields
    meta_title_ar: '',
    meta_description_ar: '',
    meta_keywords_ar: '',
    og_title_ar: '',
    og_description_ar: ''
  });

  React.useEffect(() => {
    if (currentPageSEO) {
      setFormData({
        meta_title: currentPageSEO.meta_title || '',
        meta_description: currentPageSEO.meta_description || '',
        meta_keywords: currentPageSEO.meta_keywords || '',
        og_title: currentPageSEO.og_title || '',
        og_description: currentPageSEO.og_description || '',
        og_image: currentPageSEO.og_image || '',
        canonical_url: currentPageSEO.canonical_url || '',
        robots: currentPageSEO.robots || 'index, follow',
        meta_title_ar: currentPageSEO.meta_title_ar || '',
        meta_description_ar: currentPageSEO.meta_description_ar || '',
        meta_keywords_ar: currentPageSEO.meta_keywords_ar || '',
        og_title_ar: currentPageSEO.og_title_ar || '',
        og_description_ar: currentPageSEO.og_description_ar || ''
      });
    } else {
      setFormData({
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        og_title: '',
        og_description: '',
        og_image: '',
        canonical_url: '',
        robots: 'index, follow',
        meta_title_ar: '',
        meta_description_ar: '',
        meta_keywords_ar: '',
        og_title_ar: '',
        og_description_ar: ''
      });
    }
  }, [currentPageSEO, selectedPage]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (currentPageSEO) {
        await dataLayer.pageSEO.update(currentPageSEO.id, data);
      } else {
        await dataLayer.pageSEO.create({
          ...data,
          page_path: selectedPage
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['page-seo']);
      toast.success('SEO settings saved!');
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error(`Failed to save: ${error.message || 'Unknown error'}`);
      if (error.message && error.message.includes('column')) {
        toast.error('Database columns missing. Please run the migration script.');
      }
    }
  });

  const [robotsTxt, setRobotsTxt] = React.useState('');

  React.useEffect(() => {
    // Check for robots_txt using page_path instead of page_identifier
    const robotsSetting = allSEO.find(s => s.page_path === 'robots_txt');
    if (robotsSetting) {
      setRobotsTxt(robotsSetting.meta_description || '');
    }
  }, [allSEO]);

  const saveRobotsTxt = async () => {
    try {
      // Check for robots_txt using page_path instead of page_identifier
      const existing = allSEO.find(s => s.page_path === 'robots_txt');
      if (existing) {
        await dataLayer.pageSEO.update(existing.id, { meta_description: robotsTxt });
      } else {
        await dataLayer.pageSEO.create({
          // Removed page_identifier as it doesn't exist in schema
          page_path: 'robots_txt',
          meta_title: 'Robots.txt',
          meta_description: robotsTxt
        });
      }
      queryClient.invalidateQueries(['page-seo']);
      toast.success('Robots.txt saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Failed to save: ${error.message || 'Unknown error'}`);
    }
  };

  const generateSitemap = async () => {
    const baseUrl = window.location.origin;
    const today = new Date().toISOString().split('T')[0];
    const urls = commonPages.map(p => `${baseUrl}${p.url || `/${p.id}`}`);

    // Include dynamic pages: solutions, industries and published portfolio case studies
    try {
      const [services, industries, projects] = await Promise.all([
        dataLayer.services.getAll().catch(() => []),
        dataLayer.industries.getAll().catch(() => []),
        dataLayer.portfolio.getPublished().catch(() => []),
      ]);
      (services || []).forEach(s => { if (s.slug) urls.push(`${baseUrl}/solutions/${s.slug}`); });
      (industries || []).forEach(i => { if (i.slug) urls.push(`${baseUrl}/industries/${i.slug}`); });
      (projects || []).forEach(p => { if (p.id) urls.push(`${baseUrl}/PortfolioDetail?id=${p.id}`); });
    } catch (e) {
      console.error('Sitemap dynamic URL fetch failed, using static pages only.', e);
    }

    const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const uniqueUrls = [...new Set(urls)];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map(url => `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sitemap.xml';
    link.click();
    toast.success('Sitemap downloaded!');
  };

  const generateRobotsTxt = () => {
    const content = `User-agent: *
Allow: /

Sitemap: ${window.location.origin}/sitemap.xml`;
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'robots.txt';
    link.click();
    toast.success('Robots.txt downloaded!');
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <AdminLayout currentPage="AdminSEO">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SEO Settings</h1>
            <p className="text-slate-600 mt-1">Manage meta tags and SEO for each page</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateSitemap} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Sitemap
            </Button>
            <Button onClick={generateRobotsTxt} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Robots.txt
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Page Selector */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {commonPages.map(page => (
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
                  {allSEO.find(s => s.page_path === page.id) && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* SEO Form */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="en" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ar">Arabic</TabsTrigger>
              </TabsList>

              <TabsContent value="en">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Basic SEO (English)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Meta Title ({formData.meta_title.length}/60)</Label>
                        <Input
                          value={formData.meta_title}
                          onChange={(e) => handleChange('meta_title', e.target.value)}
                          placeholder="Page Title - Brand Name"
                          maxLength={60}
                          className="mt-2"
                        />
                        <p className="text-xs text-slate-500 mt-1">Optimal: 50-60 characters</p>
                      </div>
                      <div>
                        <Label>Meta Description ({formData.meta_description.length}/160)</Label>
                        <Textarea
                          value={formData.meta_description}
                          onChange={(e) => handleChange('meta_description', e.target.value)}
                          placeholder="Brief description of the page content"
                          maxLength={160}
                          rows={3}
                          className="mt-2"
                        />
                        <p className="text-xs text-slate-500 mt-1">Optimal: 150-160 characters</p>
                      </div>
                      <div>
                        <Label>Keywords (comma-separated)</Label>
                        <Input
                          value={formData.meta_keywords}
                          onChange={(e) => handleChange('meta_keywords', e.target.value)}
                          placeholder="keyword1, keyword2, keyword3"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Canonical URL</Label>
                        <Input
                          value={formData.canonical_url}
                          onChange={(e) => handleChange('canonical_url', e.target.value)}
                          placeholder="https://example.com/page"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Robots</Label>
                        <Select value={formData.robots} onValueChange={(v) => handleChange('robots', v)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="index, follow">Index, Follow (Default)</SelectItem>
                            <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                            <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                            <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Social Media (Open Graph - English)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>OG Title</Label>
                        <Input
                          value={formData.og_title}
                          onChange={(e) => handleChange('og_title', e.target.value)}
                          placeholder="Title for social media sharing"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>OG Description</Label>
                        <Textarea
                          value={formData.og_description}
                          onChange={(e) => handleChange('og_description', e.target.value)}
                          placeholder="Description for social media sharing"
                          rows={2}
                          className="mt-2"
                        />
                      </div>
                      <FileUpload label="Social Sharing Image" value={formData.og_image} onChange={(url) => handleChange('og_image', url)} storagePath="seo" validation={{ width: 1200, height: 630, aspectRatio: 1200 / 630, aspectLabel: '1.91:1', maxImageMB: 1, note: 'WebP or JPG is preferred for social previews.' }} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ar">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Basic SEO (Arabic)
                      </CardTitle>
                    </CardHeader>
                    {/* Removed dir="rtl" to prevent React key issues with direction switching in some browsers */}
                    <CardContent className="space-y-4">
                      <div>
                        <Label>عنوان الصفحة (Meta Title)</Label>
                        <Input
                          value={formData.meta_title_ar}
                          onChange={(e) => handleChange('meta_title_ar', e.target.value)}
                          placeholder="عنوان الصفحة - اسم العلامة التجارية"
                          maxLength={60}
                          className="mt-2 text-right"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <Label>وصف الصفحة (Meta Description)</Label>
                        <Textarea
                          value={formData.meta_description_ar}
                          onChange={(e) => handleChange('meta_description_ar', e.target.value)}
                          placeholder="وصف مختصر لمحتوى الصفحة"
                          maxLength={160}
                          rows={3}
                          className="mt-2 text-right"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <Label>الكلمات المفتاحية (Keywords)</Label>
                        <Input
                          value={formData.meta_keywords_ar}
                          onChange={(e) => handleChange('meta_keywords_ar', e.target.value)}
                          placeholder="كلمة1, كلمة2, كلمة3"
                          className="mt-2 text-right"
                          dir="rtl"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Social Media (Open Graph - Arabic)
                      </CardTitle>
                    </CardHeader>
                    {/* Removed dir="rtl" here as well */}
                    <CardContent className="space-y-4">
                      <div>
                        <Label>عنوان المشاركة (OG Title)</Label>
                        <Input
                          value={formData.og_title_ar}
                          onChange={(e) => handleChange('og_title_ar', e.target.value)}
                          placeholder="العنوان عند المشاركة على وسائل التواصل"
                          className="mt-2 text-right"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <Label>وصف المشاركة (OG Description)</Label>
                        <Textarea
                          value={formData.og_description_ar}
                          onChange={(e) => handleChange('og_description_ar', e.target.value)}
                          placeholder="الوصف عند المشاركة على وسائل التواصل"
                          rows={2}
                          className="mt-2 text-right"
                          dir="rtl"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle>Robots.txt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={robotsTxt}
                  onChange={(e) => setRobotsTxt(e.target.value)}
                  placeholder={`User-agent: *\nAllow: /\n\nSitemap: ${window.location.origin}/sitemap.xml`}
                  rows={8}
                  className="font-mono text-sm"
                />
                <Button onClick={saveRobotsTxt} variant="outline" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Robots.txt
                </Button>
              </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save SEO Settings
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
