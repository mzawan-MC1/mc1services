import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, Clock3, Facebook, Linkedin, Link2, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { dataLayer } from '../components/dataLayer';
import { BreadcrumbJsonLd } from '../components/StructuredData';
import { getLocalizedValue } from '../utils';
import { optimizeImageUrl } from '../utils/optimizeImage';
import { renderMarkdown, readingTimeMinutes } from '../utils/markdown.jsx';

const setMeta = (selector, attribute, value) => {
  let el = document.querySelector(selector);
  if (!value) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute[0], attribute[1]);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

export default function BlogDetail() {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const BackArrow = lang === 'ar' ? ArrowRight : ArrowLeft;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      try {
        const rows = await dataLayer.blog.getBySlug(slug);
        return rows[0] || null;
      } catch { return null; }
    },
  });

  const { data: allPosts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => { try { return await dataLayer.blog.getAll(); } catch { return []; } },
  });

  const title = post ? (getLocalizedValue(post, 'title', lang) || post.title) : '';
  const excerpt = post ? (getLocalizedValue(post, 'excerpt', lang) || post.excerpt || '') : '';
  const content = post ? (getLocalizedValue(post, 'content', lang) || post.content || '') : '';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (!post) return;
    const seoTitle = post.meta_title || `${title} | MCS Consultancy Blog`;
    const seoDesc = post.meta_description || excerpt;
    document.title = seoTitle;
    setMeta('meta[name="description"]', ['name', 'description'], seoDesc);
    setMeta('meta[property="og:title"]', ['property', 'og:title'], seoTitle);
    setMeta('meta[property="og:description"]', ['property', 'og:description'], seoDesc);
    setMeta('meta[property="og:type"]', ['property', 'og:type'], 'article');
    setMeta('meta[property="og:image"]', ['property', 'og:image'], post.cover_image_url || '');
    setMeta('meta[name="twitter:card"]', ['name', 'twitter:card'], 'summary_large_image');
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', pageUrl);

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: seoDesc,
      image: post.cover_image_url ? [post.cover_image_url] : undefined,
      datePublished: post.published_at || post.created_at,
      dateModified: post.updated_at || post.published_at || post.created_at,
      author: { '@type': 'Organization', name: post.author_name || 'MCS Consultancy' },
      publisher: { '@type': 'Organization', name: 'MCS Consultancy', url: 'https://mc1services.com' },
      mainEntityOfPage: pageUrl,
    };
    let script = document.getElementById('blog-article-jsonld');
    if (!script) { script = document.createElement('script'); script.id = 'blog-article-jsonld'; script.type = 'application/ld+json'; document.head.appendChild(script); }
    script.textContent = JSON.stringify(ld);
    return () => { document.getElementById('blog-article-jsonld')?.remove(); };
  }, [post, title, excerpt, pageUrl]);

  const related = useMemo(() => {
    if (!post) return [];
    return allPosts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);
  }, [allPosts, post]);

  const shareLinks = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${pageUrl}`)}`, icon: null, emoji: '💬' },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, icon: Linkedin },
    { label: 'X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}`, icon: Twitter },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, icon: Facebook },
  ];

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(pageUrl); toast.success('Link copied'); } catch { toast.error('Could not copy the link'); }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-20"><div className="h-10 w-2/3 animate-pulse rounded bg-slate-200" /><div className="mt-6 aspect-[16/9] animate-pulse rounded-3xl bg-slate-200" /><div className="mt-8 space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-4 animate-pulse rounded bg-slate-200" />)}</div></div>;
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Article not found</h1>
        <p className="mt-3 text-slate-500">This article may have been moved or unpublished.</p>
        <Link to="/Blog" className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"><BackArrow className="h-4 w-4" /> Back to the blog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-x-0 top-0 z-[60] h-1" aria-hidden="true">
        <div className="h-full bg-gradient-to-r from-blue-600 to-teal-500 transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>
      <BreadcrumbJsonLd items={[{ name: 'Home', url: 'https://mc1services.com/' }, { name: 'Blog', url: 'https://mc1services.com/Blog' }, { name: title }]} />

      <article className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6 md:pt-14">
        <nav className="flex items-center gap-1.5 text-sm text-slate-400">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
          <Link to="/Blog" className="hover:text-blue-600">Blog</Link>
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
          <span className="max-w-[40vw] truncate text-slate-600">{title}</span>
        </nav>

        {post.category && <span className="mt-8 inline-block rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-700">{post.category}</span>}
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 md:text-[2.75rem] md:leading-[1.15]">{title}</h1>
        {excerpt && <p className="mt-4 text-lg leading-relaxed text-slate-500">{excerpt}</p>}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y border-slate-100 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-teal-500 text-sm font-bold text-white">{(post.author_name || 'M').slice(0, 1)}</span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{post.author_name || 'MCS Consultancy'}</p>
              <p className="flex items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(post.published_at || post.created_at).toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{readingTimeMinutes(content)} min read</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {shareLinks.map(({ label, href, icon: Icon, emoji }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${label}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-blue-600 hover:text-white">
                {Icon ? <Icon className="h-4 w-4" /> : <span className="text-sm">{emoji}</span>}
              </a>
            ))}
            <button onClick={copyLink} aria-label="Copy link" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-blue-600 hover:text-white"><Link2 className="h-4 w-4" /></button>
          </div>
        </div>

        {post.cover_image_url && (
          <img src={optimizeImageUrl(post.cover_image_url, 1100)} alt={title} className="mt-8 aspect-[16/9] w-full rounded-3xl object-cover shadow-md" />
        )}

        <div className="text-[1.05rem]">{renderMarkdown(content)}</div>

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-600">#{tag}</span>)}
          </div>
        )}

        <div className="mt-12 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-teal-500 p-8 text-center md:p-10">
          <h2 className="text-2xl font-extrabold text-white">Working on something similar?</h2>
          <p className="mx-auto mt-2 max-w-md text-blue-100">We help UAE businesses build software, automate operations and grow online.</p>
          <Link to="/Contact" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow transition hover:-translate-y-0.5">Talk to our team {lang === 'ar' ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-slate-900">Keep reading</h2>
            <div className="mt-7 grid gap-8 md:grid-cols-3">
              {related.map((rel) => (
                <Link key={rel.id} to={`/blog/${rel.slug}`} className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    {rel.cover_image_url && <img src={optimizeImageUrl(rel.cover_image_url, 600)} alt={rel.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold leading-snug text-slate-900 group-hover:text-blue-700">{rel.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{rel.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
