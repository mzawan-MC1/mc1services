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
    section_height: ''
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
        section_height: currentSection.section_height || ''
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
        section_height: ''
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
              {['hero', 'services', 'process', 'stats', 'cta'].map(section => (
                <button
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition capitalize ${
                    selectedSection === section
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {section}
                  {sections.find(s => s.section_key === section) && (
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
                {selectedSection === 'hero' && (
                  <>
                    <div>
                      <FileUpload
                        label="Background Image"
                        value={formData.background_image}
                        onChange={(url) => handleChange('background_image', url)}
                      />
                    </div>
                    <div>
                      <Label>Background Video URL (optional)</Label>
                      <Input
                        value={formData.background_video}
                        onChange={(e) => handleChange('background_video', e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="mt-2"
                      />
                    </div>
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
