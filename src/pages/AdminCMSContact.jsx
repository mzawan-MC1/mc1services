import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { ArrowLeft, Save, Loader2, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import FileUpload from '../components/FileUpload';
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminCMSContact() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [selectedSection, setSelectedSection] = useState('hero');

  const { data: contactContent = [], isLoading } = useQuery({
    queryKey: ['contact-content'],
    queryFn: () => dataLayer.contactContent.getAll()
  });

  const currentSection = contactContent.find(s => s.section_key === selectedSection);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    address: '',
    phone: '',
    email: '',
    map_embed_url: '',
    button_text: ''
  });

  React.useEffect(() => {
    if (currentSection) {
      setFormData({
        title: currentSection.title || '',
        subtitle: currentSection.subtitle || '',
        address: currentSection.address || '',
        phone: currentSection.phone || '',
        email: currentSection.email || '',
        map_embed_url: currentSection.map_embed_url || '',
        button_text: currentSection.button_text || ''
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        address: '',
        phone: '',
        email: '',
        map_embed_url: '',
        button_text: ''
      });
    }
  }, [currentSection, selectedSection]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (currentSection) {
        await dataLayer.contactContent.update(currentSection.id, { ...data, section_key: selectedSection });
      } else {
        await dataLayer.contactContent.create({ ...data, section_key: selectedSection });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contact-content']);
      toast.success('Content saved successfully');
    },
    onError: () => toast.error('Failed to save content')
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
    <AdminLayout currentPage="AdminCMSContact">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Edit Contact Page</h1>
          <p className="text-slate-600 mt-1">Manage contact page content</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['hero', 'info', 'form'].map(section => (
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
                  {contactContent.find(s => s.section_key === section) && (
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
                  <Label>Subtitle</Label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Enter subtitle"
                    className="mt-2"
                  />
                </div>
                {selectedSection === 'info' && (
                  <>
                    <div>
                      <Label>Address</Label>
                      <Textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter address"
                        rows={2}
                        className="mt-2"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+971-XX-XXX-XXXX"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="contact@example.com"
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Google Maps Embed URL</Label>
                      <Input
                        value={formData.map_embed_url}
                        onChange={(e) => setFormData({ ...formData, map_embed_url: e.target.value })}
                        placeholder="https://www.google.com/maps/embed?..."
                        className="mt-2"
                      />
                    </div>
                  </>
                )}
                {selectedSection === 'form' && (
                  <div>
                    <Label>Submit Button Text</Label>
                    <Input
                      value={formData.button_text}
                      onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                      placeholder="Send Message"
                      className="mt-2"
                    />
                  </div>
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