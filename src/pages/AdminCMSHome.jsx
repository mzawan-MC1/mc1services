import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import FileUpload from '../components/FileUpload';
import AdminLayout from '../components/admin/AdminLayout';

const HOME_SECTIONS = [
  { key: 'hero', label: 'Hero' },
  { key: 'clients', label: 'Client Logos' },
  { key: 'video', label: 'Who We Are / Video' },
  { key: 'services', label: 'Solutions' },
  { key: 'products', label: 'MC1 Products' },
  { key: 'portfolio', label: 'Flagship Case Studies' },
  { key: 'industries', label: 'Industries' },
  { key: 'process', label: 'How We Work' },
  { key: 'stats', label: 'Verified Results' },
  { key: 'testimonials', label: 'Client Stories' },
  { key: 'cta', label: 'Final Call to Action' }
];

export default function AdminCMSHome() {
  const queryClient = useQueryClient();
  const [selectedSection, setSelectedSection] = useState('hero');

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['home-content'],
    queryFn: () => dataLayer.homeContent.getAll()
  });

  const currentSection = sections.find(s => s.section_key === selectedSection);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    button_text: '',
    button_link: '',
    background_image: '',
    background_video: '',
    section_height: '',
    display_order: 0,
    is_visible: true,
    style_variant: 'default'
  });

  React.useEffect(() => {
    if (currentSection) {
      setFormData({
        title: currentSection.title || '',
        subtitle: currentSection.subtitle || '',
        description: currentSection.description || '',
        button_text: currentSection.button_text || '',
        button_link: currentSection.button_link || '',
        background_image: currentSection.background_image || '',
        background_video: currentSection.background_video || '',
        section_height: currentSection.section_height || '',
        display_order: currentSection.display_order || 0,
        is_visible: currentSection.is_visible !== false,
        style_variant: currentSection.style_variant || 'default'
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        button_text: '',
        button_link: '',
        background_image: '',
        background_video: '',
        section_height: '',
        display_order: HOME_SECTIONS.findIndex((section) => section.key === selectedSection) * 10,
        is_visible: true,
        style_variant: 'default'
      });
    }
  }, [currentSection, selectedSection]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (currentSection) {
        await dataLayer.homeContent.update(currentSection.id, data);
      } else {
        await dataLayer.homeContent.create({
          ...data,
          section_key: selectedSection
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['home-content']);
      toast.success('Home page content saved!');
    }
  });

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
    <AdminLayout currentPage="AdminCMSHome">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Edit Home Page</h1>
          <p className="text-slate-600 mt-1">Manage homepage content and sections</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {HOME_SECTIONS.map(section => (
                <button
                  key={section.key}
                  onClick={() => setSelectedSection(section.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition capitalize ${
                    selectedSection === section.key
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {section.label}
                  {sections.find(s => s.section_key === section.key) && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{selectedSection} Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter title"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => handleChange('subtitle', e.target.value)}
                    placeholder="Enter subtitle"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Enter description"
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Button Text</Label>
                    <Input
                      value={formData.button_text}
                      onChange={(e) => handleChange('button_text', e.target.value)}
                      placeholder="e.g., Get Started"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Button Link</Label>
                    <Input
                      value={formData.button_link}
                      onChange={(e) => handleChange('button_link', e.target.value)}
                      placeholder="e.g., Contact"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div><Label>Display Order</Label><Input type="number" value={formData.display_order} onChange={(e) => handleChange('display_order', Number(e.target.value) || 0)} className="mt-2" /></div>
                  <div><Label>Visual Style</Label><select value={formData.style_variant} onChange={(e) => handleChange('style_variant', e.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"><option value="default">Default</option><option value="dark">Dark / Futuristic</option><option value="light">Light</option><option value="immersive">Immersive Media</option><option value="split">Split Layout</option></select></div>
                  <label className="flex items-center gap-3 self-end rounded-md border p-2.5"><input type="checkbox" checked={formData.is_visible} onChange={(e) => handleChange('is_visible', e.target.checked)} />Visible on website</label>
                </div>
                <FileUpload
                  label="Section Image"
                  value={formData.background_image}
                  onChange={(url) => handleChange('background_image', url)}
                  storagePath={`homepage/${selectedSection}`}
                  validation={{ width: 1920, height: 1080, aspectRatio: 16 / 9, aspectLabel: '16:9', maxImageMB: 2, note: 'WebP or AVIF is preferred.' }}
                />
                {(selectedSection === 'hero' || selectedSection === 'video' || selectedSection === 'products' || selectedSection === 'portfolio') && (
                  <>
                    <FileUpload
                      label="Section Video (optional)"
                      value={formData.background_video}
                      onChange={(url) => handleChange('background_video', url)}
                      accept="video/mp4,video/webm,video/ogg"
                      storagePath={`homepage/${selectedSection}`}
                      validation={{ width: 1920, height: 1080, aspectRatio: 16 / 9, aspectLabel: '16:9', maxVideoMB: 20, maxDurationSeconds: selectedSection === 'hero' ? 30 : 180, note: selectedSection === 'hero' ? 'Use a muted 10–30 second loop.' : 'MP4 or WebM is preferred.' }}
                    />
                  </>
                )}
                {selectedSection === 'hero' && (
                  <>
                    <div>
                      <Label>Section Height</Label>
                      <Input
                        value={formData.section_height}
                        onChange={(e) => handleChange('section_height', e.target.value)}
                        placeholder="e.g., 100vh or 600px"
                        className="mt-2"
                      />
                    </div>
                  </>
                )}
                <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Section
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
