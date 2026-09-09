import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import AdminLayout from '../components/admin/AdminLayout';
import AdminRoute from '../components/AdminRoute';

export default function AdminFAQEdit() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || 'new';
  const navigate = useNavigate();
  const isEditing = id !== 'new';
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({ question: '', answer: '', question_ar: '', answer_ar: '', category: 'general', display_order: 0 });

  const { data: faq, isLoading } = useQuery({
    queryKey: ['faq', id],
    queryFn: () => dataLayer.faqs.getById(id),
    enabled: isEditing
  });

  useEffect(() => {
    if (faq) setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      question_ar: faq.question_ar || '',
      answer_ar: faq.answer_ar || '',
      category: faq.category || 'general',
      display_order: faq.display_order || 0
    });
  }, [faq]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (!data.question?.trim() || !data.answer?.trim() || !data.question_ar?.trim() || !data.answer_ar?.trim()) {
        throw new Error('All fields are required (EN + AR)');
      }
      let nextOrder = parseInt(data.display_order, 10);
      if (!nextOrder || nextOrder <= 0) {
        const existingFaqs = await dataLayer.faqs.getAll();
        const highestOrder = existingFaqs.reduce((highest, faq) => Math.max(highest, faq.display_order || 0), 0);
        nextOrder = highestOrder + 1;
      }
      if (isEditing) {
        await dataLayer.faqs.update(id, { ...data, display_order: nextOrder });
      } else {
        await dataLayer.faqs.create({ ...data, display_order: nextOrder });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-faqs']);
      toast.success('FAQ saved successfully');
      navigate(createPageUrl('AdminFAQs'));
    },
    onError: () => toast.error('Failed to save FAQ')
  });

  if (isEditing && isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <AdminRoute>
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('AdminFAQs')}><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <h1 className="text-3xl font-bold text-slate-900">{isEditing ? 'Edit' : 'New'} FAQ</h1>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>FAQ Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Question *</Label><Input value={formData.question} onChange={(e) => setFormData(p => ({ ...p, question: e.target.value }))} required className="mt-1" /></div>
              <div><Label>Answer *</Label><Textarea value={formData.answer} onChange={(e) => setFormData(p => ({ ...p, answer: e.target.value }))} required className="mt-1" rows={4} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Question (Arabic) *</Label>
                  <Input value={formData.question_ar} onChange={(e) => setFormData(p => ({ ...p, question_ar: e.target.value }))} required className="mt-1" dir="rtl" />
                </div>
                <div>
                  <Label>Answer (Arabic) *</Label>
                  <Textarea value={formData.answer_ar} onChange={(e) => setFormData(p => ({ ...p, answer_ar: e.target.value }))} required className="mt-1" rows={4} dir="rtl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="process">Process</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Order</Label><Input type="number" value={formData.display_order} onChange={(e) => setFormData(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} className="mt-1" /></div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link to={createPageUrl('AdminFAQs')}><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}{isEditing ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
    </AdminRoute>
  );
}
