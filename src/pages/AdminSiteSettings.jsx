import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Save, Globe, Phone, Facebook, Twitter, Linkedin, Instagram, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import FileUpload from '../components/FileUpload';
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminSiteSettings() {
  const queryClient = useQueryClient();
  
  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const data = await dataLayer.siteSettings.getAll();
      console.log('✅ Supabase connected -', data.length, 'settings loaded');
      return data;
    }
  });

  const [formData, setFormData] = useState({});

  // Update form data when settings load
  React.useEffect(() => {
    if (settings.length > 0) {
      const data = {};
      settings.forEach(s => {
        data[s.setting_key] = s.setting_value;
      });
      setFormData(data);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      try {
        for (const [key, value] of Object.entries(updates)) {
          const existing = settings.find(s => s.setting_key === key);
          if (existing) {
            await dataLayer.siteSettings.update(existing.id, { setting_value: value });
          } else {
            await dataLayer.siteSettings.create({
              setting_key: key,
              setting_value: value,
              setting_category: getCategoryForKey(key),
              display_name: getDisplayName(key)
            });
          }
        }
        console.log('✅ Settings saved to Supabase:', Object.keys(updates));
      } catch (error) {
        console.error('❌ Supabase error saving settings:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['site-settings']);
      toast.success('Settings saved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to save: ' + error.message);
    }
  });

  const getCategoryForKey = (key) => {
    if (key.startsWith('who_we_are')) return 'content';
    if (key.includes('logo') || key.includes('favicon') || key.includes('company')) return 'branding';
    if (key.includes('facebook') || key.includes('twitter') || key.includes('linkedin') || key.includes('instagram') || key.includes('youtube') || key.includes('reddit') || key.includes('snapchat')) return 'social';
    if (key.includes('phone') || key.includes('email') || key.includes('address') || key.includes('map')) return 'contact';
    if (key.includes('tracking') || key.includes('analytics') || key.includes('head')) return 'tracking';
    return 'seo';
  };

  const getDisplayName = (key) => {
    return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (category) => {
    // Validate Google Maps URL if saving contact info
    if (category === 'contact' && formData.contact_map_url) {
      const mapUrl = formData.contact_map_url.trim();
      if (mapUrl && !mapUrl.includes('/maps/embed')) {
        toast.error('Invalid Google Maps URL - must be an embed URL (Share → Embed a map)');
        return;
      }
    }

    const categoryKeys = Object.keys(formData).filter(key => {
      const keyCategory = getCategoryForKey(key);
      return keyCategory === category;
    });
    
    if (categoryKeys.length === 0) {
      toast.error('No settings to save');
      return;
    }

    const updates = {};
    categoryKeys.forEach(key => {
      updates[key] = formData[key] !== undefined ? formData[key] : '';
    });
    
    updateMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <AdminLayout currentPage="AdminSiteSettings">
      <div className="p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
            <p className="text-slate-600 mt-1">Manage your website branding, contact info, and integrations</p>
          </div>

        <div className="space-y-6">
          {/* Who We Are Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Who We Are Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={formData.who_we_are_subtitle || ''}
                  onChange={(e) => handleChange('who_we_are_subtitle', e.target.value)}
                  placeholder="Who We Are"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.who_we_are_title || ''}
                  onChange={(e) => handleChange('who_we_are_title', e.target.value)}
                  placeholder="Your Partner in Digital Transformation"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.who_we_are_description || ''}
                  onChange={(e) => handleChange('who_we_are_description', e.target.value)}
                  placeholder="Enter description"
                  rows={6}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Image or Video</Label>
                <FileUpload
                  label="Media"
                  value={formData.who_we_are_media_url || ''}
                  onChange={(url) => handleChange('who_we_are_media_url', url)}
                  accept="image/*,video/*"
                  storagePath="site/who-we-are"
                  validation={{ width: 1920, height: 1080, aspectRatio: 16 / 9, aspectLabel: '16:9', maxImageMB: 2, maxVideoMB: 20, note: 'WebP/AVIF for images or MP4/WebM for video.' }}
                />
                <p className="text-xs text-slate-500 mt-1">Drag & drop supported. Accepts images or MP4/WebM videos.</p>
              </div>
              <Button onClick={() => handleSave('content')} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Who We Are
              </Button>
            </CardContent>
          </Card>
          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={formData.company_name || ''}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="MCS Consultancy"
                  className="mt-2"
                />
              </div>
              <div>
                <FileUpload
                  label="Main Logo"
                  value={formData.logo_url || ''}
                  onChange={(url) => handleChange('logo_url', url)}
                  storagePath="branding"
                  validation={{ width: 1200, height: 360, aspectRatio: 10 / 3, aspectLabel: '10:3', maxImageMB: 2, note: 'Use a transparent PNG or WebP.' }}
                />
              </div>
              <div>
                <FileUpload
                  label="Favicon"
                  value={formData.favicon_url || ''}
                  onChange={(url) => handleChange('favicon_url', url)}
                  storagePath="branding"
                  validation={{ width: 512, height: 512, aspectRatio: 1, aspectLabel: '1:1 square', maxImageMB: 0.5, note: 'Upload a 512×512 PNG/WebP master; browsers scale it automatically.' }}
                />
              </div>
              <Button onClick={() => handleSave('branding')} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Branding
              </Button>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={formData.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  placeholder="+971-50-83-22799"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Primary Email</Label>
                <Input
                  value={formData.contact_email_primary || ''}
                  onChange={(e) => handleChange('contact_email_primary', e.target.value)}
                  placeholder="info@mc1services.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Secondary Email (optional)</Label>
                <Input
                  value={formData.contact_email_secondary || ''}
                  onChange={(e) => handleChange('contact_email_secondary', e.target.value)}
                  placeholder="contact@mc1services.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Textarea
                  value={formData.contact_address || ''}
                  onChange={(e) => handleChange('contact_address', e.target.value)}
                  placeholder="Industrial Area 2, Sharjah, UAE"
                  className="mt-2"
                  rows={2}
                />
              </div>
              <div>
                <Label>Google Maps Embed URL</Label>
                <Input
                  value={formData.contact_map_url || ''}
                  onChange={(e) => handleChange('contact_map_url', e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  <strong>Important:</strong> Must be an embed URL from Google Maps → Share → Embed a map (contains &quot;/maps/embed&quot;)
                </p>
                {formData.contact_map_url && !formData.contact_map_url.includes('/maps/embed') && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    ⚠️ Invalid URL - must contain &quot;/maps/embed&quot; to work properly
                  </p>
                )}
              </div>
              <Button onClick={() => handleSave('contact')} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Contact Info
              </Button>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="w-5 h-5" />
                Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Label>
                <Input
                  value={formData.social_facebook || ''}
                  onChange={(e) => handleChange('social_facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Label>
                <Input
                  value={formData.social_twitter || ''}
                  onChange={(e) => handleChange('social_twitter', e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Label>
                <Input
                  value={formData.social_linkedin || ''}
                  onChange={(e) => handleChange('social_linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Label>
                <Input
                  value={formData.social_instagram || ''}
                  onChange={(e) => handleChange('social_instagram', e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  YouTube
                </Label>
                <Input
                  value={formData.social_youtube || ''}
                  onChange={(e) => handleChange('social_youtube', e.target.value)}
                  placeholder="https://youtube.com/@yourchannel"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Reddit
                </Label>
                <Input
                  value={formData.social_reddit || ''}
                  onChange={(e) => handleChange('social_reddit', e.target.value)}
                  placeholder="https://reddit.com/r/yoursubreddit"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Snapchat
                </Label>
                <Input
                  value={formData.social_snapchat || ''}
                  onChange={(e) => handleChange('social_snapchat', e.target.value)}
                  placeholder="https://snapchat.com/add/yourhandle"
                  className="mt-2"
                />
              </div>
              <Button onClick={() => handleSave('social')} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Social Links
              </Button>
            </CardContent>
          </Card>

          {/* Tracking & Custom Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Tracking & Custom Head Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Custom Head Code (Google Analytics, Facebook Pixel, etc.)</Label>
                <Textarea
                  value={formData.head_tracking_code || ''}
                  onChange={(e) => handleChange('head_tracking_code', e.target.value)}
                  placeholder="<script><!-- Your tracking code here --></script>"
                  className="mt-2 font-mono text-xs"
                  rows={6}
                />
                <p className="text-xs text-slate-500 mt-1">
                  This code will be injected into the {'<head>'} of all pages. Paste tracking pixels, analytics scripts, or meta tags here.
                </p>
              </div>
              <Button onClick={() => handleSave('tracking')} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Tracking Code
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}
