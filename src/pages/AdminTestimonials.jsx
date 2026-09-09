import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Plus, Pencil, Trash2, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AdminLayout from '../components/admin/AdminLayout';
import AdminRoute from '../components/AdminRoute';

export default function AdminTestimonials() {
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: () => dataLayer.testimonials.getAll()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataLayer.testimonials.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-testimonials'])
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, is_featured }) => dataLayer.testimonials.update(id, { is_featured }),
    onSuccess: () => queryClient.invalidateQueries(['admin-testimonials'])
  });

  return (
    <AdminRoute>
    <AdminLayout currentPage="AdminTestimonials">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Testimonials</h1>
            <p className="text-slate-600 mt-1">Manage client testimonials</p>
          </div>
          <Link to={createPageUrl('AdminTestimonialEdit')}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : testimonials.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-500 mb-4">No testimonials yet</p>
              <Link to={createPageUrl('AdminTestimonialEdit')}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Testimonial
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map(testimonial => (
              <Card key={testimonial.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {testimonial.image_url ? (
                      <img src={testimonial.image_url} alt={testimonial.client_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{testimonial.client_name?.[0]}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{testimonial.client_name}</h3>
                      <p className="text-sm text-slate-600">{testimonial.role}{testimonial.company && `, ${testimonial.company}`}</p>
                    </div>
                    {testimonial.is_featured && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500" /> Featured
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 mb-4 line-clamp-3">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < (testimonial.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFeatured.mutate({ id: testimonial.id, is_featured: !testimonial.is_featured })}
                      >
                        <Star className={`w-4 h-4 ${testimonial.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <Link to={createPageUrl(`AdminTestimonialEdit?id=${testimonial.id}`)}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600" onClick={() => deleteMutation.mutate(testimonial.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
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
