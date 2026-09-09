import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AdminLayout from '../components/admin/AdminLayout';
import AdminRoute from '../components/AdminRoute';

const categoryColors = {
  general: 'bg-slate-100 text-slate-700',
  development: 'bg-blue-100 text-blue-700',
  marketing: 'bg-purple-100 text-purple-700',
  pricing: 'bg-green-100 text-green-700',
  process: 'bg-orange-100 text-orange-700'
};

export default function AdminFAQs() {
  const queryClient = useQueryClient();

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const rows = await dataLayer.faqs.getAll();
      return (rows || []).sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataLayer.faqs.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-faqs'])
  });

  return (
    <AdminRoute>
    <AdminLayout currentPage="AdminFAQs">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">FAQs</h1>
            <p className="text-slate-600 mt-1">Manage frequently asked questions</p>
          </div>
          <Link to={createPageUrl('AdminFAQEdit')}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add FAQ</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : faqs.length === 0 ? (
          <Card className="text-center py-12"><CardContent><p className="text-slate-500 mb-4">No FAQs yet</p><Link to={createPageUrl('AdminFAQEdit')}><Button><Plus className="w-4 h-4 mr-2" />Add First FAQ</Button></Link></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {faqs.map(faq => (
              <Card key={faq.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={categoryColors[faq.category] || categoryColors.general}>{faq.category}</Badge>
                      </div>
                      <h3 className="font-medium text-slate-900 mb-1">{faq.question}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{faq.answer}</p>
                      {(faq.question_ar || faq.answer_ar) && (
                        <div className="mt-2 border-t border-slate-200 pt-2">
                          <h4 className="text-sm font-medium text-slate-900">Arabic</h4>
                          <p className="text-sm text-slate-600">{faq.question_ar || '—'}</p>
                          <p className="text-sm text-slate-600 line-clamp-2" dir="rtl">{faq.answer_ar || '—'}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={createPageUrl(`AdminFAQEdit?id=${faq.id}`)}><Button variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button></Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-600"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Delete FAQ?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={() => deleteMutation.mutate(faq.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
    </AdminRoute>
  );
}
