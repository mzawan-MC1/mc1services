import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Star, TriangleAlert, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import AdminLayout from '../components/admin/AdminLayout';
import AdminRoute from '../components/AdminRoute';

export default function AdminBlog() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: posts = [], isLoading, isError } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: () => dataLayer.blog.getAll(),
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataLayer.blog.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-blog'] }); queryClient.invalidateQueries({ queryKey: ['blog-posts'] }); toast.success('Article deleted'); },
    onError: () => toast.error('Failed to delete the article'),
  });

  const togglePublish = useMutation({
    mutationFn: (post) => dataLayer.blog.update(post.id, {
      is_published: !post.is_published,
      published_at: !post.is_published && !post.published_at ? new Date().toISOString() : post.published_at,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-blog'] }); queryClient.invalidateQueries({ queryKey: ['blog-posts'] }); },
    onError: () => toast.error('Failed to update the article'),
  });

  const filtered = posts.filter((p) => (p.title || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminRoute>
      <AdminLayout currentPage="AdminBlog">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Blog Articles</h1>
              <p className="text-sm text-slate-500">Write and publish articles — they appear at /Blog with full SEO automatically.</p>
            </div>
            <Link to={createPageUrl('AdminBlogEdit')}>
              <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> New Article</Button>
            </Link>
          </div>

          {isError && (
            <Card className="border-amber-300 bg-amber-50">
              <CardContent className="flex gap-3 p-5">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold">The blog table isn't set up yet.</p>
                  <p className="mt-1">Open Supabase → SQL Editor, paste the contents of <strong>blog-setup.sql</strong> (the file Muse provided) and click Run — it takes a few seconds. Then refresh this page.</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Input placeholder="Search articles…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm bg-white" />

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
          ) : filtered.length === 0 && !isError ? (
            <Card><CardContent className="py-16 text-center text-slate-500">No articles yet. Click “New Article” to write your first post.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((post) => (
                <Card key={post.id}>
                  <CardContent className="flex flex-wrap items-center gap-4 p-4">
                    {post.cover_image_url
                      ? <img src={post.cover_image_url} alt="" className="h-14 w-24 shrink-0 rounded-lg object-cover" />
                      : <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">No image</div>}
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate font-semibold text-slate-900">
                        {post.title}
                        {post.is_featured && <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />}
                      </p>
                      <p className="truncate text-sm text-slate-500">/blog/{post.slug} · {post.category || 'Insights'} · {post.published_at ? new Date(post.published_at).toLocaleDateString('en-GB') : 'Not published'}</p>
                    </div>
                    <Badge className={post.is_published ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-100'}>{post.is_published ? 'Published' : 'Draft'}</Badge>
                    <div className="flex items-center gap-1.5">
                      {post.is_published && (
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" title="View live article">
                          <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4" /></Button>
                        </a>
                      )}
                      <Button variant="outline" size="sm" onClick={() => togglePublish.mutate(post)} title={post.is_published ? 'Unpublish' : 'Publish'}>
                        {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Link to={`${createPageUrl('AdminBlogEdit')}?id=${post.id}`}>
                        <Button variant="outline" size="sm"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this article?</AlertDialogTitle>
                            <AlertDialogDescription>“{post.title}” will be permanently removed from the blog.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate(post.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
