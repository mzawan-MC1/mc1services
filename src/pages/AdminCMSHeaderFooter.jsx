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
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminCMSHeaderFooter() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('header');

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['header-footer-settings'],
    queryFn: () => dataLayer.headerFooter.getAll()
  });

  const currentSettings = settings.find(s => s.setting_key === activeTab);

  const [formData, setFormData] = useState({
    logo_url: '',
    phone: '',
    email: '',
    menu_items: [],
    cta_button_text: '',
    cta_button_link: '',
    social_links: {},
    footer_text: '',
    copyright_text: ''
  });

  React.useEffect(() => {
    if (currentSettings) {
      setFormData({
        logo_url: currentSettings.logo_url || '',
        phone: currentSettings.phone || '',
        email: currentSettings.email || '',
        menu_items: currentSettings.menu_items || [],
        cta_button_text: currentSettings.cta_button_text || '',
        cta_button_link: currentSettings.cta_button_link || '',
        social_links: currentSettings.social_links || {},
        footer_text: currentSettings.footer_text || '',
        copyright_text: currentSettings.copyright_text || ''
      });
    }
  }, [currentSettings, activeTab]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (currentSettings) {
        await dataLayer.headerFooter.update(currentSettings.id, data);
      } else {
        await dataLayer.headerFooter.create({
          ...data,
          setting_key: activeTab
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['header-footer-settings']);
      toast.success('Settings saved!');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const addMenuItem = () => {
    setFormData({
      ...formData,
      menu_items: [...formData.menu_items, { label: '', href: '' }]
    });
  };

  const removeMenuItem = (index) => {
    setFormData({
      ...formData,
      menu_items: formData.menu_items.filter((_, i) => i !== index)
    });
  };

  const updateMenuItem = (index, field, value) => {
    const updated = [...formData.menu_items];
    updated[index][field] = value;
    setFormData({ ...formData, menu_items: updated });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <AdminLayout currentPage="AdminCMSHeaderFooter">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Header & Footer Settings</h1>
          <p className="text-slate-600 mt-1">Manage global navigation and branding</p>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'header' ? 'default' : 'outline'}
            onClick={() => setActiveTab('header')}
            className={activeTab === 'header' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}
          >
            Header
          </Button>
          <Button
            variant={activeTab === 'footer' ? 'default' : 'outline'}
            onClick={() => setActiveTab('footer')}
            className={activeTab === 'footer' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}
          >
            Footer
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="capitalize">{activeTab} Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Logo URL</Label>
              <Input
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
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

            {activeTab === 'header' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Menu Items</Label>
                    <Button size="sm" onClick={addMenuItem} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.menu_items.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Label"
                          value={item.label}
                          onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                        />
                        <Input
                          placeholder="Page Name"
                          value={item.href}
                          onChange={(e) => updateMenuItem(index, 'href', e.target.value)}
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => removeMenuItem(index)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>CTA Button Text</Label>
                    <Input
                      value={formData.cta_button_text}
                      onChange={(e) => setFormData({ ...formData, cta_button_text: e.target.value })}
                      placeholder="Get Started"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>CTA Button Link</Label>
                    <Input
                      value={formData.cta_button_link}
                      onChange={(e) => setFormData({ ...formData, cta_button_link: e.target.value })}
                      placeholder="Contact"
                      className="mt-2"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'footer' && (
              <>
                <div>
                  <Label>Footer Text</Label>
                  <Textarea
                    value={formData.footer_text}
                    onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                    placeholder="Company description"
                    rows={3}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Copyright Text</Label>
                  <Input
                    value={formData.copyright_text}
                    onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
                    placeholder="© 2025 Company Name. All rights reserved."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Social Media Links</Label>
                  <div className="grid md:grid-cols-2 gap-3 mt-2">
                    {['linkedin', 'twitter', 'facebook', 'instagram'].map(platform => (
                      <Input
                        key={platform}
                        placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                        value={formData.social_links[platform] || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, [platform]: e.target.value }
                        })}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}