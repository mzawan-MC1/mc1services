import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { ArrowLeft, Save, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import AdminLayout from '../components/admin/AdminLayout';
import AdminRoute from '../components/AdminRoute';
import FileUpload from '../components/FileUpload';

export default function AdminTestimonialEdit() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = id && id !== 'new';

  const [formData, setFormData] = useState({
    client_name: '',
    company: '',
    role: '',
    content: '',
    image_url: '',
    rating: 5,
    is_featured: false
  });

  const { data: testimonial, isLoading } = useQuery({
    queryKey: ['testimonial', id],
    queryFn: () => dataLayer.testimonials.getById(id),
    enabled: !!isEditing
  });

  useEffect(() => {
    if (testimonial) {
      setFormData({
        client_name: testimonial.client_name || '',
        company: testimonial.company || '',
        role: testimonial.role || '',
        content: testimonial.content || '',
        image_url: testimonial.image_url || '',
        rating: testimonial.rating || 5,
        is_featured: testimonial.is_featured || false
      });
    }
  }, [testimonial]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        await dataLayer.testimonials.update(id, data);
      } else {
        await dataLayer.testimonials.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-testimonials']);
      toast.success('Testimonial saved successfully');
      navigate(createPageUrl('AdminTestimonials'));
    },
    onError: () => toast.error('Failed to save testimonial')
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isEditing && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <AdminRoute>
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('AdminTestimonials')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditing ? 'Edit Testimonial' : 'New Testimonial'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Client Name *</Label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => handleChange('client_name', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Role/Position</Label>
                  <Input
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="mt-1"
                    placeholder="e.g. CEO"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <div className="mt-2">
                  <FileUpload label="Client Photo" value={formData.image_url} onChange={(url) => handleChange('image_url', url)} storagePath="testimonials" validation={{ width: 512, height: 512, aspectRatio: 1, aspectLabel: '1:1 square', maxImageMB: 0.5, note: 'Use a clear, centred portrait.' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Testimonial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Content *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  required
                  className="mt-1"
                  rows={4}
                  placeholder="What the client said..."
                />
              </div>
              <div>
                <Label>Rating</Label>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleChange('rating', star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label>Featured</Label>
                  <p className="text-sm text-slate-500">Show on the homepage</p>
                </div>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(v) => handleChange('is_featured', v)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link to={createPageUrl('AdminTestimonials')}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isEditing ? 'Save Changes' : 'Add Testimonial'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
    </AdminRoute>
  );
}
