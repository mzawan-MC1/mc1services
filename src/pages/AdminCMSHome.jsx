import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
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
  { key: 'products', label: 'MCS Products' },
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
    button_text_secondary: '',
    button_link_secondary: '',
    show_secondary_button: true,
    background_image: '',
    background_video: '',
    content_data: {},
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
        button_text_secondary: currentSection.button_text_secondary || '',
        button_link_secondary: currentSection.button_link_secondary || '',
        show_secondary_button: currentSection.show_secondary_button !== false,
        background_image: currentSection.background_image || '',
        background_video: currentSection.background_video || '',
        content_data: currentSection.content_data || {},
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
        button_text_secondary: '',
        button_link_secondary: '',
        show_secondary_button: true,
        background_image: '',
        background_video: '',
        content_data: {},
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

  const updateStat = (index, field, value) => {
    const stats = [...(formData.content_data?.stats || [])];
    stats[index] = { ...stats[index], [field]: value };
    handleChange('content_data', { ...formData.content_data, stats });
  };

  const addStat = () => {
    const stats = [...(formData.content_data?.stats || []), { value: '', label: '', label_ar: '', icon: 'Briefcase' }];
    handleChange('content_data', { ...formData.content_data, stats });
  };

  const removeStat = (index) => {
    const stats = (formData.content_data?.stats || []).filter((_, itemIndex) => itemIndex !== index);
    handleChange('content_data', { ...formData.content_data, stats });
  };

  const updateContentItem = (listKey, index, field, value) => {
    const items = [...(formData.content_data?.[listKey] || [])];
    items[index] = { ...items[index], [field]: value };
    handleChange('content_data', { ...formData.content_data, [listKey]: items });
  };

  const addContentItem = (listKey, item) => {
    const items = [...(formData.content_data?.[listKey] || []), item];
    handleChange('content_data', { ...formData.content_data, [listKey]: items });
  };

  const removeContentItem = (listKey, index) => {
    const items = (formData.content_data?.[listKey] || []).filter((_, itemIndex) => itemIndex !== index);
    handleChange('content_data', { ...formData.content_data, [listKey]: items });
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
                {selectedSection === 'hero' && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div><Label>Secondary Action</Label><p className="text-xs text-slate-500">Shown beside the main hero button.</p></div>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.show_secondary_button} onChange={(e) => handleChange('show_secondary_button', e.target.checked)} />Show</label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div><Label>Secondary Button Text</Label><Input value={formData.button_text_secondary} onChange={(e) => handleChange('button_text_secondary', e.target.value)} placeholder="e.g., Explore Our Work" className="mt-2" /></div>
                      <div><Label>Secondary Button Link</Label><Input value={formData.button_link_secondary} onChange={(e) => handleChange('button_link_secondary', e.target.value)} placeholder="e.g., Portfolio" className="mt-2" /></div>
                    </div>
                  </div>
                )}
                {selectedSection === 'stats' && (
                  <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div><Label>Verified Metrics</Label><p className="text-xs text-slate-500">Only publish numbers the business can support with evidence.</p></div>
                      <Button type="button" variant="outline" size="sm" onClick={addStat}><Plus className="mr-2 h-4 w-4" />Add Metric</Button>
                    </div>
                    {(formData.content_data?.stats || []).map((stat, index) => (
                      <div key={index} className="grid gap-3 rounded-lg border bg-white p-3 md:grid-cols-[0.7fr_1fr_1fr_0.8fr_auto]">
                        <div><Label>Value</Label><Input value={stat.value || ''} onChange={(e) => updateStat(index, 'value', e.target.value)} placeholder="e.g., 20+" className="mt-1" /></div>
                        <div><Label>English Label</Label><Input value={stat.label || ''} onChange={(e) => updateStat(index, 'label', e.target.value)} placeholder="Projects delivered" className="mt-1" /></div>
                        <div><Label>Arabic Label</Label><Input value={stat.label_ar || ''} onChange={(e) => updateStat(index, 'label_ar', e.target.value)} dir="rtl" className="mt-1" /></div>
                        <div><Label>Icon</Label><select value={stat.icon || 'Briefcase'} onChange={(e) => updateStat(index, 'icon', e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"><option>Briefcase</option><option>Users</option><option>Cpu</option><option>Calendar</option></select></div>
                        <Button type="button" variant="ghost" size="icon" className="self-end text-red-600" aria-label={`Remove metric ${index + 1}`} onClick={() => removeStat(index)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                    {!(formData.content_data?.stats || []).length && <p className="rounded-lg border border-dashed p-4 text-center text-sm text-slate-500">No verified metrics will appear until you add and save them.</p>}
                  </div>
                )}
                {selectedSection === 'process' && (
                  <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div><Label>Delivery Steps</Label><p className="text-xs text-slate-500">These steps appear in this order on the homepage.</p></div>
                      <Button type="button" variant="outline" size="sm" onClick={() => addContentItem('steps', { title: '', title_ar: '', description: '', description_ar: '', icon: 'Search' })}><Plus className="mr-2 h-4 w-4" />Add Step</Button>
                    </div>
                    {(formData.content_data?.steps || []).map((step, index) => (
                      <div key={index} className="rounded-lg border bg-white p-4">
                        <div className="mb-3 flex items-center justify-between"><strong className="text-sm">Step {index + 1}</strong><Button type="button" variant="ghost" size="icon" className="text-red-600" aria-label={`Remove step ${index + 1}`} onClick={() => removeContentItem('steps', index)}><Trash2 className="h-4 w-4" /></Button></div>
                        <div className="grid gap-3 md:grid-cols-2"><div><Label>English Title</Label><Input value={step.title || ''} onChange={(e) => updateContentItem('steps', index, 'title', e.target.value)} className="mt-1" /></div><div><Label>Arabic Title</Label><Input dir="rtl" value={step.title_ar || ''} onChange={(e) => updateContentItem('steps', index, 'title_ar', e.target.value)} className="mt-1" /></div><div><Label>English Description</Label><Textarea rows={3} value={step.description || ''} onChange={(e) => updateContentItem('steps', index, 'description', e.target.value)} className="mt-1" /></div><div><Label>Arabic Description</Label><Textarea dir="rtl" rows={3} value={step.description_ar || ''} onChange={(e) => updateContentItem('steps', index, 'description_ar', e.target.value)} className="mt-1" /></div></div>
                        <div className="mt-3 max-w-xs"><Label>Icon</Label><select value={step.icon || 'Search'} onChange={(e) => updateContentItem('steps', index, 'icon', e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"><option>Search</option><option>Palette</option><option>Code</option><option>Rocket</option></select></div>
                      </div>
                    ))}
                    {!(formData.content_data?.steps || []).length && <p className="rounded-lg border border-dashed p-4 text-center text-sm text-slate-500">The current four-step fallback remains visible until managed steps are added and saved.</p>}
                  </div>
                )}
                {selectedSection === 'video' && (
                  <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4"><div><Label>Company Highlights</Label><p className="text-xs text-slate-500">Short trust points shown beside the company media.</p></div><Button type="button" variant="outline" size="sm" onClick={() => addContentItem('highlights', { label: '', label_ar: '' })}><Plus className="mr-2 h-4 w-4" />Add Highlight</Button></div>
                    {(formData.content_data?.highlights || []).map((highlight, index) => <div key={index} className="grid gap-3 rounded-lg border bg-white p-3 md:grid-cols-[1fr_1fr_auto]"><div><Label>English</Label><Input value={highlight.label || ''} onChange={(e) => updateContentItem('highlights', index, 'label', e.target.value)} className="mt-1" /></div><div><Label>Arabic</Label><Input dir="rtl" value={highlight.label_ar || ''} onChange={(e) => updateContentItem('highlights', index, 'label_ar', e.target.value)} className="mt-1" /></div><Button type="button" variant="ghost" size="icon" className="self-end text-red-600" aria-label={`Remove highlight ${index + 1}`} onClick={() => removeContentItem('highlights', index)}><Trash2 className="h-4 w-4" /></Button></div>)}
                  </div>
                )}
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
