import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ChevronDown, Link2, Loader2, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../components/admin/AdminLayout';
import FileUpload from '../components/FileUpload';
import { dataLayer } from '../components/dataLayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const blueprintArabic = {
  Build: 'البناء', Scale: 'التوسع', Create: 'الإبداع', Explore: 'استكشف', 'Industry Experience': 'الخبرة القطاعية',
  'MC1 Products': 'منتجات MC1', 'About MC1': 'عن MC1', Connect: 'تواصل', Resources: 'المصادر', Legal: 'قانوني',
  'AI Solutions & Intelligent Automation': 'حلول الذكاء الاصطناعي والأتمتة الذكية', 'Custom Software & Business Platforms': 'البرمجيات المخصصة ومنصات الأعمال',
  'Application Development': 'تطوير التطبيقات', 'SaaS Product Engineering': 'هندسة منتجات SaaS', 'Digital Marketing & Growth': 'التسويق الرقمي والنمو',
  'Cloud, IT & Managed Support': 'السحابة وتقنية المعلومات والدعم المُدار', 'Creative Content & Production': 'المحتوى الإبداعي والإنتاج',
  'Automotive & Auctions': 'السيارات والمزادات', 'Logistics, Shipping & Freight': 'الخدمات اللوجستية والشحن',
  'Entertainment & Escape Rooms': 'الترفيه وغرف الهروب', Gaming: 'الألعاب', 'Food, Beverage & Hospitality': 'الأغذية والمشروبات والضيافة',
  'Media & News': 'الإعلام والأخبار', 'Legal & Professional Services': 'الخدمات القانونية والمهنية', 'Other Custom Business Workflows': 'مسارات عمل مخصصة أخرى',
  'Featured Case Studies': 'دراسات حالة مميزة', 'Client Projects': 'مشاريع العملاء', 'All Projects': 'جميع المشاريع',
  'How We Work': 'كيف نعمل', 'Our Team': 'فريقنا', Contact: 'تواصل معنا', 'Free Business Tools': 'أدوات أعمال مجانية',
  FAQs: 'الأسئلة الشائعة', 'Privacy Policy': 'سياسة الخصوصية', 'Terms of Service': 'شروط الخدمة'
};

const blueprintArabicDescriptions = {
  'Practical AI and workflow automation.': 'ذكاء اصطناعي عملي وأتمتة لمسارات العمل.', 'ERP, portals and operational systems.': 'أنظمة ERP وبوابات وأنظمة تشغيلية.',
  'Web, mobile and desktop applications.': 'تطبيقات الويب والجوال وسطح المكتب.', 'Multi-tenant SaaS products and MVPs.': 'منتجات SaaS متعددة المستأجرين ونماذج أولية قابلة للتشغيل.',
  'SEO, paid media and social growth.': 'تحسين محركات البحث والإعلانات المدفوعة والنمو الاجتماعي.', 'Infrastructure, security and support.': 'البنية التحتية والأمن والدعم.',
  'Brand, campaign and video production.': 'إنتاج العلامة التجارية والحملات والفيديو.', 'See MC1 solutions in action.': 'شاهد حلول MC1 أثناء العمل.',
  'MC1 business workflow SaaS platform': 'منصة SaaS من MC1 لإدارة مسارات العمل', 'An MC1-owned digital product': 'منتج رقمي مملوك لـ MC1'
};

const blueprint = [
  {
    id: 'solutions', label: 'Solutions', label_ar: 'الحلول', menu_type: 'mega', href: '', children: [
      { id: uid(), group: 'Build', label: 'AI Solutions & Intelligent Automation', href: '/Automation', description: 'Practical AI and workflow automation.' },
      { id: uid(), group: 'Build', label: 'Custom Software & Business Platforms', href: '/DevelopmentServices', description: 'ERP, portals and operational systems.' },
      { id: uid(), group: 'Build', label: 'Application Development', href: '/AppDevelopment', description: 'Web, mobile and desktop applications.' },
      { id: uid(), group: 'Scale', label: 'SaaS Product Engineering', href: '/DevelopmentServices', description: 'Multi-tenant SaaS products and MVPs.' },
      { id: uid(), group: 'Scale', label: 'Digital Marketing & Growth', href: '/MarketingServices', description: 'SEO, paid media and social growth.' },
      { id: uid(), group: 'Scale', label: 'Cloud, IT & Managed Support', href: '/ITServices', description: 'Infrastructure, security and support.' },
      { id: uid(), group: 'Create', label: 'Creative Content & Production', href: '/Production', description: 'Brand, campaign and video production.' }
    ]
  },
  {
    id: 'industries', label: 'Industries', label_ar: 'القطاعات', menu_type: 'mega', href: '', children: [
      'Automotive & Auctions', 'Logistics, Shipping & Freight', 'Entertainment & Escape Rooms', 'Gaming',
      'Food, Beverage & Hospitality', 'Media & News', 'Legal & Professional Services', 'Other Custom Business Workflows'
    ].map((label) => ({ id: uid(), group: 'Industry Experience', label, href: '/Portfolio', description: '' }))
  },
  {
    id: 'work', label: 'Work', label_ar: 'أعمالنا', menu_type: 'mega', href: '/Portfolio', children: [
      { id: uid(), group: 'Explore', label: 'Featured Case Studies', href: '/Portfolio', description: 'See MC1 solutions in action.' },
      { id: uid(), group: 'Explore', label: 'Client Projects', href: '/Portfolio?type=client_project', description: '' },
      { id: uid(), group: 'Explore', label: 'MC1 Products', href: '/Portfolio?type=mc1_product', description: '' },
      { id: uid(), group: 'Explore', label: 'All Projects', href: '/Portfolio', description: '' }
    ]
  },
  {
    id: 'products', label: 'Products', label_ar: 'منتجاتنا', menu_type: 'mega', href: '', children: [
      { id: uid(), group: 'MC1 Products', label: 'Proflow 360', href: 'https://proflow360.cloud', description: 'MC1 business workflow SaaS platform', open_new_tab: true },
      { id: uid(), group: 'MC1 Products', label: 'Smart Pocket', href: 'https://1smartpocket.com', description: 'An MC1-owned digital product', open_new_tab: true }
    ]
  },
  {
    id: 'company', label: 'Company', label_ar: 'الشركة', menu_type: 'mega', href: '/About', children: [
      { id: uid(), group: 'About MC1', label: 'About MC1', href: '/About', description: '' },
      { id: uid(), group: 'About MC1', label: 'How We Work', href: '/About', description: '' },
      { id: uid(), group: 'About MC1', label: 'Our Team', href: '/About', description: '' },
      { id: uid(), group: 'Connect', label: 'Contact', href: '/Contact', description: '' }
    ]
  },
  {
    id: 'resources', label: 'Resources', label_ar: 'المصادر', menu_type: 'mega', href: '/Tools', children: [
      { id: uid(), group: 'Resources', label: 'Free Business Tools', href: '/Tools', description: '' },
      { id: uid(), group: 'Resources', label: 'FAQs', href: '/Contact', description: '' },
      { id: uid(), group: 'Legal', label: 'Privacy Policy', href: '/privacy-policy', description: '' },
      { id: uid(), group: 'Legal', label: 'Terms of Service', href: '/terms-of-service', description: '' }
    ]
  }
];

const normalizeItem = (item) => ({
  id: item.id || uid(),
  label: item.label || '',
  label_ar: item.label_ar || '',
  href: item.href || '',
  menu_type: item.menu_type || (item.children?.length ? 'mega' : 'link'),
  is_visible: item.is_visible !== false,
  children: Array.isArray(item.children) ? item.children.map((child) => ({
    id: child.id || uid(), group: child.group || '', group_ar: child.group_ar || '', label: child.label || '', label_ar: child.label_ar || '',
    href: child.href || '', description: child.description || '', description_ar: child.description_ar || '',
    image_url: child.image_url || '', open_new_tab: Boolean(child.open_new_tab),
    source_type: child.source_type || 'custom', source_id: child.source_id || ''
  })) : []
});

const localizeBlueprintItem = (item) => normalizeItem({
  ...item,
  children: (item.children || []).map((child) => ({
    ...child,
    group_ar: child.group_ar || blueprintArabic[child.group] || '',
    label_ar: child.label_ar || blueprintArabic[child.label] || '',
    description_ar: child.description_ar || blueprintArabicDescriptions[child.description] || ''
  }))
});

export default function AdminNavigation() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState([]);
  const [expandedItemId, setExpandedItemId] = useState(null);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['header-footer-settings'],
    queryFn: () => dataLayer.headerFooter.getAll()
  });
  const { data: services = [] } = useQuery({ queryKey: ['admin-services'], queryFn: () => dataLayer.services.getAll() });
  const { data: industries = [] } = useQuery({ queryKey: ['admin-industries'], queryFn: () => dataLayer.industries.getAll() });
  const { data: projects = [] } = useQuery({ queryKey: ['admin-portfolio'], queryFn: () => dataLayer.portfolio.getAll() });
  const header = settings.find((setting) => setting.setting_key === 'header');

  useEffect(() => {
    if (header) setItems((header.menu_items || []).map(normalizeItem));
  }, [header]);

  const saveMutation = useMutation({
    mutationFn: () => header
      ? dataLayer.headerFooter.update(header.id, { menu_items: items })
      : dataLayer.headerFooter.create({ setting_key: 'header', menu_items: items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header-footer-settings'] });
      toast.success('Navigation saved');
    },
    onError: (error) => toast.error(error?.message || 'Navigation could not be saved')
  });

  const updateItem = (index, values) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...values } : item));
  const updateChild = (itemIndex, childIndex, values) => setItems((current) => current.map((item, index) => index === itemIndex ? { ...item, children: item.children.map((child, cIndex) => cIndex === childIndex ? { ...child, ...values } : child) } : item));
  const moveItem = (index, direction) => setItems((current) => {
    const next = [...current];
    const target = index + direction;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });

  const linkManagedRecords = () => {
    let linked = 0;
    const findByLabel = (records, label) => records.find((record) =>
      (record.title || record.name || '').trim().toLowerCase() === (label || '').trim().toLowerCase()
    );
    const nextItems = items.map((item) => ({
      ...item,
      children: item.children.map((child) => {
        const service = findByLabel(services, child.label);
        if (service) {
          linked += 1;
          return { ...child, source_type: 'service', source_id: service.id };
        }
        const industry = findByLabel(industries, child.label);
        if (industry) {
          linked += 1;
          return { ...child, source_type: 'industry', source_id: industry.id };
        }
        return child;
      })
    }));
    setItems(nextItems);
    toast.success(linked ? `${linked} menu links connected. Your uploaded menu images were preserved. Review and save navigation.` : 'No exact service or industry label matches were found.');
  };

  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <AdminLayout>
      <div className="space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-2xl font-bold text-slate-900">Navigation & Mega-Menu</h1><p className="mt-1 text-slate-600">Every public menu label, link, description and image is controlled here.</p></div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => { if (window.confirm('Replace the current menu editor values with the approved MC1 blueprint? Save is still required.')) { const nextItems = blueprint.map(localizeBlueprintItem); setItems(nextItems); setExpandedItemId(nextItems[0]?.id || null); } }}><Sparkles className="mr-2 h-4 w-4" />Load MC1 Blueprint</Button>
            <Button type="button" variant="outline" onClick={linkManagedRecords} title="Connect labels and links to managed content without replacing uploaded menu images"><Link2 className="mr-2 h-4 w-4" />Link Records — Keep Images</Button>
            <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-blue-600 text-white hover:bg-blue-700">{saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Navigation</Button>
          </div>
        </div>

        <div className="space-y-5">
          {items.map((item, itemIndex) => (
            <Card key={item.id}>
              <CardHeader className="flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => setExpandedItemId((current) => current === item.id ? null : item.id)}
                  aria-expanded={expandedItemId === item.id}
                  aria-controls={`navigation-editor-${item.id}`}
                >
                  <ChevronDown className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${expandedItemId === item.id ? 'rotate-180' : ''}`} />
                  <span className="min-w-0">
                    <CardTitle className="truncate text-lg">{item.label || `Menu item ${itemIndex + 1}`}</CardTitle>
                    <span className="mt-1 block text-xs font-normal text-slate-500">{item.children.length} menu link{item.children.length === 1 ? '' : 's'} · {item.is_visible ? 'Visible' : 'Hidden'}</span>
                  </span>
                </button>
                <div className="flex gap-1">
                  <Button type="button" size="icon" variant="outline" onClick={() => moveItem(itemIndex, -1)}><ArrowUp className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="outline" onClick={() => moveItem(itemIndex, 1)}><ArrowDown className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="outline" className="text-red-600" onClick={() => setItems((current) => current.filter((_, index) => index !== itemIndex))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              {expandedItemId === item.id && <CardContent id={`navigation-editor-${item.id}`} className="space-y-5 border-t pt-5">
                <div className="grid gap-3 md:grid-cols-5">
                  <div><Label>English Label</Label><Input className="mt-1" value={item.label} onChange={(event) => updateItem(itemIndex, { label: event.target.value })} /></div>
                  <div dir="rtl"><Label>Arabic Label</Label><Input className="mt-1" value={item.label_ar} onChange={(event) => updateItem(itemIndex, { label_ar: event.target.value })} /></div>
                  <div><Label>Direct Link</Label><Input className="mt-1" value={item.href} onChange={(event) => updateItem(itemIndex, { href: event.target.value })} /></div>
                  <div><Label>Menu Type</Label><select className="mt-1 w-full rounded-md border px-3 py-2" value={item.menu_type} onChange={(event) => updateItem(itemIndex, { menu_type: event.target.value })}><option value="link">Simple Link</option><option value="mega">Mega-Menu</option></select></div>
                  <label className="flex items-center gap-2 self-end rounded-md border px-3 py-2"><input type="checkbox" checked={item.is_visible} onChange={(event) => updateItem(itemIndex, { is_visible: event.target.checked })} />Visible</label>
                </div>

                {item.menu_type === 'mega' && <div className="space-y-4 border-t pt-5">
                  <div className="flex items-center justify-between"><div><h3 className="font-semibold">Mega-menu links and cards</h3><p className="text-xs text-slate-500">Group names create columns. Reference existing content to keep one source of truth.</p></div><Button type="button" size="sm" variant="outline" onClick={() => updateItem(itemIndex, { children: [...item.children, { id: uid(), group: '', group_ar: '', label: '', label_ar: '', href: '', description: '', description_ar: '', image_url: '', open_new_tab: false, source_type: 'custom', source_id: '' }] })}><Plus className="mr-1 h-4 w-4" />Add Link</Button></div>
                  {item.children.map((child, childIndex) => (
                    <div key={child.id} className="grid gap-4 rounded-xl bg-slate-50 p-4 lg:grid-cols-[1fr_1fr_1.5fr_auto]">
                      <div className="space-y-3">
                        <div><Label>Column / Group</Label><Input className="mt-1" value={child.group} onChange={(event) => updateChild(itemIndex, childIndex, { group: event.target.value })} /></div>
                        <div dir="rtl"><Label>Arabic Group</Label><Input className="mt-1" value={child.group_ar} onChange={(event) => updateChild(itemIndex, childIndex, { group_ar: event.target.value })} /></div>
                        <div><Label>English Label</Label><Input className="mt-1" value={child.label} onChange={(event) => updateChild(itemIndex, childIndex, { label: event.target.value })} /></div>
                        <div dir="rtl"><Label>Arabic Label</Label><Input className="mt-1" value={child.label_ar} onChange={(event) => updateChild(itemIndex, childIndex, { label_ar: event.target.value })} /></div>
                      </div>
                      <div className="space-y-3">
                        <div><Label>Content Source</Label><select className="mt-1 w-full rounded-md border px-3 py-2" value={child.source_type || 'custom'} onChange={(event) => updateChild(itemIndex, childIndex, { source_type: event.target.value, source_id: '' })}><option value="custom">Custom Link</option><option value="service">Existing Service</option><option value="industry">Existing Industry</option><option value="project">Existing Project/Product</option></select></div>
                        {child.source_type !== 'custom' && <div><Label>Select Record</Label><select className="mt-1 w-full rounded-md border px-3 py-2" value={child.source_id || ''} onChange={(event) => updateChild(itemIndex, childIndex, { source_id: event.target.value })}><option value="">Choose a record</option>{(child.source_type === 'service' ? services : child.source_type === 'industry' ? industries : projects).map((record) => <option key={record.id} value={record.id}>{record.title || record.name}</option>)}</select></div>}
                        <div><Label>Link</Label><Input className="mt-1" value={child.href} onChange={(event) => updateChild(itemIndex, childIndex, { href: event.target.value })} /></div>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={child.open_new_tab} onChange={(event) => updateChild(itemIndex, childIndex, { open_new_tab: event.target.checked })} />Open in new tab</label>
                      </div>
                      <div className="space-y-3">
                        <div><Label>Description</Label><Textarea className="mt-1" rows={2} value={child.description} onChange={(event) => updateChild(itemIndex, childIndex, { description: event.target.value })} /></div>
                        <div dir="rtl"><Label>Arabic Description</Label><Textarea className="mt-1" rows={2} value={child.description_ar} onChange={(event) => updateChild(itemIndex, childIndex, { description_ar: event.target.value })} /></div>
                        <FileUpload label="Optional Feature Image" value={child.image_url} onChange={(url) => updateChild(itemIndex, childIndex, { image_url: url })} storagePath="navigation" validation={{ width: 1200, height: 750, aspectRatio: 1.6, aspectLabel: '8:5', maxImageMB: 1, note: 'WebP or AVIF is preferred.' }} />
                      </div>
                      <Button type="button" size="icon" variant="ghost" className="text-red-600" onClick={() => updateItem(itemIndex, { children: item.children.filter((_, index) => index !== childIndex) })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>}
              </CardContent>}
            </Card>
          ))}
        </div>
        <Button type="button" variant="outline" onClick={() => { const item = normalizeItem({ label: 'New Menu Item' }); setItems((current) => [...current, item]); setExpandedItemId(item.id); }}><Plus className="mr-2 h-4 w-4" />Add Main Menu Item</Button>
      </div>
    </AdminLayout>
  );
}
