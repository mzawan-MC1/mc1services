import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, Search, Filter, Star, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import AdminLayout from '../components/admin/AdminLayout';
import AdminRoute from '../components/AdminRoute';

const categoryLabels = {
  web_development: 'Web Development',
  app_development: 'App Development',
  marketing: 'Marketing',
  branding: 'Branding',
  it_services: 'IT Services',
  automation: 'Automation',
  creative: 'Creative'
};

export default function AdminPortfolio() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: portfolios = [], isLoading } = useQuery({
    queryKey: ['admin-portfolio'],
    queryFn: () => dataLayer.portfolio.getAll()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataLayer.portfolio.deleteWithFiles(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-portfolio']);
      toast.success('Project deleted successfully');
    },
    onError: () => toast.error('Failed to delete project')
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, field, value }) => dataLayer.portfolio.update(id, { [field]: value }),
    onSuccess: () => queryClient.invalidateQueries(['admin-portfolio'])
  });

  return (
    <AdminRoute>
    <AdminLayout currentPage="AdminPortfolio">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Portfolio Management</h1>
            <p className="text-slate-600 mt-1">Manage your portfolio projects</p>
          </div>
          <Link to={createPageUrl('AdminPortfolioEdit')}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : portfolios.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-500 mb-4">No portfolio projects yet</p>
              <Link to={createPageUrl('AdminPortfolioEdit')}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {portfolios.map(portfolio => (
              <Card key={portfolio.id} className="overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {(portfolio.main_image_url || portfolio.image_url) ? (
                      <img src={portfolio.main_image_url || portfolio.image_url} alt={portfolio.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">{portfolio.title?.[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{portfolio.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {categoryLabels[portfolio.category] || portfolio.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 truncate">{portfolio.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        portfolio.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {portfolio.status || 'draft'}
                      </span>
                      {portfolio.is_featured && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border border-slate-300 text-slate-700 hover:bg-slate-100"
                      onClick={() => toggleMutation.mutate({
                        id: portfolio.id,
                        field: 'status',
                        value: portfolio.status === 'published' ? 'draft' : 'published'
                      })}
                      title={portfolio.status === 'published' ? 'Unpublish' : 'Publish'}
                    >
                      {portfolio.status === 'published' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border border-slate-300 text-slate-700 hover:bg-slate-100"
                      onClick={() => toggleMutation.mutate({
                        id: portfolio.id,
                        field: 'is_featured',
                        value: !portfolio.is_featured
                      })}
                      title={portfolio.is_featured ? 'Remove from featured' : 'Add to featured'}
                    >
                      <Star className={`w-4 h-4 ${portfolio.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                    <Link to={createPageUrl(`AdminPortfolioEdit?id=${portfolio.id}`)}>
                      <Button variant="ghost" size="icon" className="border border-slate-300 text-slate-700 hover:bg-slate-100">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="border border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Portfolio Project?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{portfolio.title}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteMutation.mutate(portfolio.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
    </AdminRoute>
  );
}
