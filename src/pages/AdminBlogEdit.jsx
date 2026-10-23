import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { ArrowLeft, Loader2, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import FileUpload from '../components/FileUpload';
import AdminLayout from '../components/admin/AdminLayout';
import AdminRoute from '../components/AdminRoute';
import { renderMarkdown, slugify } from '../utils/markdown.jsx';

const CATEGORIES = ['Insights', 'Software Development', 'AI & Automation', 'Digital Marketing', 'Case Studies', 'Company News', 'Guides'];

const emptyPost = {
  title: '', title_ar: '', slug: '', excerpt: '', excerpt_ar: '', content: '', content_ar: '',
  cover_image_url: '', category: 'Insights', tags: '', author_name: 'MCS Consultancy',
  is_published: false, is_featured: false, meta_title: '', meta_description: '',
};

export default function AdminBlogEdit() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyPost);
  const [slugTouched, setSlugTouched] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin-blog-post', id],
    queryFn: () => dataLayer.blog.getById(id),
    enabled: isEditing,
    retry: false,
  });

  useEffect(() => {
    if (existing) {
      setForm({ ...emptyPost, ...existing, tags: Array.isArray(existing.tags) ? existing.tags.join(', ') : '' });
      setSlugTouched(true);
    }
  }, [existing]);

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'title' && !slugTouched) next.slug = slugify(value);
      return next;
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        title_ar: form.title_ar?.trim() || null,
        slug: slugify(form.slug || form.title),
        excerpt: form.excerpt?.trim() || null,
        excerpt_ar: form.excerpt_ar?.trim() || null,
        content: form.content || '',
        content_ar: form.content_ar?.trim() || null,
        cover_image_url: form.cover_image_url || null,
        category: form.category || 'Insights',
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        author_name: form.author_name?.trim() || 'MCS Consultancy',
        is_published: form.is_published,
        is_featured: form.is_featured,
        meta_title: form.meta_title?.trim() || null,
        meta_description: form.meta_description?.trim() || null,
      };
      if (payload.is_published && !existing?.published_at) payload.published_at = new Date().toISOString();
      if (isEditing) return dataLayer.blog.update(id, payload);
      return dataLayer.blog.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success(isEditing ? 'Article updated' : 'Article created');
      navigate(createPageUrl('AdminBlog'));
    },
    onError: (err) => toast.error(`Save failed: ${err?.message || 'check that blog-setup.sql has been run'}`),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('A title is required'); return; }
    saveMutation.mutate();
  };

  if (isEditing && isLoading) {
    return <AdminRoute><AdminLayout currentPage="AdminBlogEdit"><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div></AdminLayout></AdminRoute>;
  }

  return (
    <AdminRoute>
      <AdminLayout currentPage="AdminBlogEdit">
        <form onSubmit={submit} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('AdminBlog')}><Button type="button" variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
              <h1 className="text-2xl font-bold text-slate-900">{isEditing ? 'Edit Article' : 'New Article'}</h1>
            </div>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Article
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Article</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Title *</Label><Input className="mt-1 bg-white" value={form.title} onChange={set('title')} placeholder="e.g. How Much Does It Cost to Build an App in Dubai?" /></div>
                  <div>
                    <Label>URL Slug</Label>
                    <Input className="mt-1 bg-white" value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug')(e); }} placeholder="cost-to-build-an-app-in-dubai" />
                    <p className="mt-1 text-xs text-slate-400">The article will live at /blog/{form.slug || 'your-slug'}</p>
                  </div>
                  <div><Label>Short Summary (excerpt)</Label><Textarea className="mt-1 bg-white" rows={3} value={form.excerpt} onChange={set('excerpt')} placeholder="One or two sentences shown on the blog listing and in Google results." /></div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Content</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview((v) => !v)}><Eye className="mr-1.5 h-4 w-4" />{showPreview ? 'Hide preview' : 'Preview'}</Button>
                    </div>
                    <Textarea className="mt-1 bg-white font-mono text-sm" rows={16} value={form.content} onChange={set('content')} placeholder={'Write the article here.\n\nFormatting: ## Heading, ### Sub-heading, - bullet list, > quote, **bold**, *italic*, [link text](https://…)\nLeave a blank line between paragraphs.'} />
                    <p className="mt-1 text-xs text-slate-400">Tip: 800–1,500 words with headings every few paragraphs reads best and ranks best.</p>
                  </div>
                  {showPreview && (
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Preview</p>
                      <div className="text-[0.95rem]">{renderMarkdown(form.content) || <p className="text-slate-400">Nothing to preview yet.</p>}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Arabic (optional)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Title (Arabic)</Label><Input dir="rtl" className="mt-1 bg-white" value={form.title_ar} onChange={set('title_ar')} /></div>
                  <div><Label>Summary (Arabic)</Label><Textarea dir="rtl" className="mt-1 bg-white" rows={2} value={form.excerpt_ar} onChange={set('excerpt_ar')} /></div>
                  <div><Label>Content (Arabic)</Label><Textarea dir="rtl" className="mt-1 bg-white" rows={8} value={form.content_ar} onChange={set('content_ar')} /></div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><Label>Published</Label><Switch checked={form.is_published} onCheckedChange={(v) => setForm((f) => ({ ...f, is_published: v }))} /></div>
                  <div className="flex items-center justify-between"><Label>Featured (hero slot)</Label><Switch checked={form.is_featured} onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: v }))} /></div>
                  <div>
                    <Label>Category</Label>
                    <select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={form.category} onChange={set('category')}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><Label>Tags (comma separated)</Label><Input className="mt-1 bg-white" value={form.tags} onChange={set('tags')} placeholder="dubai, saas, cost-guide" /></div>
                  <div><Label>Author</Label><Input className="mt-1 bg-white" value={form.author_name} onChange={set('author_name')} /></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Cover Image</CardTitle></CardHeader>
                <CardContent>
                  <FileUpload label="One cover picture (1200×675 works best)" value={form.cover_image_url} onChange={(url) => setForm((f) => ({ ...f, cover_image_url: url || '' }))} storagePath="blog" validation={{ maxSizeMB: 5, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] }} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>SEO (optional)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Meta Title</Label><Input className="mt-1 bg-white" value={form.meta_title} onChange={set('meta_title')} placeholder="Leave empty to use the article title" /></div>
                  <div><Label>Meta Description</Label><Textarea className="mt-1 bg-white" rows={3} value={form.meta_description} onChange={set('meta_description')} placeholder="Leave empty to use the summary. Aim for ~150 characters." /></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </AdminLayout>
    </AdminRoute>
  );
}
