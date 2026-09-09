import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminCMSTools() {
  const queryClient = useQueryClient();
  const [selectedSection, setSelectedSection] = useState('hero');

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['tools-content'],
    queryFn: () => dataLayer.toolsContent.getAll()
  });

  const currentSection = sections.find(s => s.section_key === selectedSection);

  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  React.useEffect(() => {
    if (currentSection) {
      setFormData({
        title: currentSection.title || '',
        description: currentSection.description || ''
      });
    } else {
      setFormData({
        title: '',
        description: ''
      });
    }
  }, [currentSection, selectedSection]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (currentSection) {
        await dataLayer.toolsContent.update(currentSection.id, data);
      } else {
        await dataLayer.toolsContent.create({
          ...data,
          section_key: selectedSection
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tools-content']);
      toast.success('Tools page content saved!');
    }
  });

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
    <AdminLayout currentPage="AdminCMSTools">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Edit Tools Page</h1>
          <p className="text-slate-600 mt-1">Manage tools page content</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['hero', 'intro', 'categories'].map(section => (
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
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter title"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                    rows={4}
                    className="mt-2"
                  />
                </div>
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