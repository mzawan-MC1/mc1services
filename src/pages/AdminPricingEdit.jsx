import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminPricingEdit() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = id && id !== 'new';

  const { data: plan, isLoading } = useQuery({
    queryKey: ['pricing-plan', id],
    queryFn: () => dataLayer.pricingPlans.getById(id),
    enabled: isEditing
  });

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    billing_period: 'monthly',
    category: 'web_development',
    description: '',
    features: [],
    cta_text: 'Get Started',
    is_popular: false,
    order: 0
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        price: plan.price || '',
        billing_period: plan.billing_period || 'monthly',
        category: plan.category || 'web_development',
        description: plan.description || '',
        features: plan.features || [],
        cta_text: plan.cta_text || 'Get Started',
        is_popular: plan.is_popular || false,
        order: plan.order || 0
      });
    }
  }, [plan]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        await dataLayer.pricingPlans.update(id, data);
      } else {
        await dataLayer.pricingPlans.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-plans']);
      toast.success('Pricing plan saved successfully');
      navigate(createPageUrl('AdminPricing'));
    },
    onError: () => toast.error('Failed to save pricing plan')
  });

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  if (isEditing && isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('AdminPricing'))}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-3xl font-bold text-slate-900">{isEditing ? 'Edit' : 'New'} Pricing Plan</h1>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Plan Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Plan Name *</Label><Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required className="mt-1" /></div>
                <div><Label>Price *</Label><Input value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))} required className="mt-1" placeholder="$999" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Billing Period</Label><Input value={formData.billing_period} onChange={(e) => setFormData(p => ({ ...p, billing_period: e.target.value }))} className="mt-1" placeholder="monthly, one-time" /></div>
                <div><Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web_development">Web Development</SelectItem>
                      <SelectItem value="app_development">App Development</SelectItem>
                      <SelectItem value="digital_marketing">Digital Marketing</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="it_services">IT Services</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={2} /></div>
              <div><Label>CTA Text</Label><Input value={formData.cta_text} onChange={(e) => setFormData(p => ({ ...p, cta_text: e.target.value }))} className="mt-1" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Features</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Add feature..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                <Button type="button" onClick={addFeature}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((f, i) => (
                  <Badge key={i} variant="secondary" className="pr-1">{f}<button type="button" onClick={() => setFormData(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }))} className="ml-2 hover:text-red-500"><X className="w-3 h-3" /></button></Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div><Label>Popular</Label><p className="text-sm text-slate-500">Highlight this plan as recommended</p></div>
                <Switch checked={formData.is_popular} onCheckedChange={(v) => setFormData(p => ({ ...p, is_popular: v }))} />
              </div>
              <div><Label>Display Order</Label><Input type="number" value={formData.order} onChange={(e) => setFormData(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} className="mt-1 w-24" /></div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('AdminPricing'))}>Cancel</Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}{isEditing ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
