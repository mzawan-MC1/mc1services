import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, BookOpen, CalendarDays, Clock3, Sparkles } from 'lucide-react';
import { dataLayer } from '../components/dataLayer';
import SEOHead from '../components/SEOHead';
import { getLocalizedValue } from '../utils';
import { optimizeImageUrl } from '../utils/optimizeImage';
import { readingTimeMinutes } from '../utils/markdown.jsx';

const formatDate = (iso, lang) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
};

function PostCard({ post, lang, featured = false }) {
  const title = getLocalizedValue(post, 'title', lang) || post.title;
  const excerpt = getLocalizedValue(post, 'excerpt', lang) || post.excerpt || '';
  const minutes = readingTimeMinutes(getLocalizedValue(post, 'content', lang) || post.content);
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight;
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${featured ? 'lg:flex-row' : ''}`}
    >
      <div className={`relative overflow-hidden bg-slate-100 ${featured ? 'lg:w-1/2 aspect-[16/9] lg:aspect-auto' : 'aspect-[16/9]'}`}>
        {post.cover_image_url ? (
          <img src={optimizeImageUrl(post.cover_image_url, featured ? 1000 : 700)} alt={title} loading={featured ? 'eager' : 'lazy'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-teal-500"><BookOpen className="h-12 w-12 text-white/70" /></div>
        )}
        {post.category && <span className="absolute start-4 top-4 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{post.category}</span>}
      </div>
      <div className={`flex flex-1 flex-col p-6 ${featured ? 'lg:justify-center lg:p-10' : ''}`}>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(post.published_at || post.created_at, lang)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{minutes} min read</span>
        </div>
        <h3 className={`mt-3 font-bold leading-snug text-slate-900 transition group-hover:text-blue-700 ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}>{title}</h3>
        {excerpt && <p className={`mt-2 leading-relaxed text-slate-500 ${featured ? 'text-base' : 'line-clamp-3 text-sm'}`}>{excerpt}</p>}
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
          Read article <Arrow className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default function Blog() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [category, setCategory] = useState('All');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      try { return await dataLayer.blog.getAll(); } catch { return []; }
    },
  });

  const categories = useMemo(() => ['All', ...new Set(posts.map((p) => p.category).filter(Boolean))], [posts]);
  const visible = category === 'All' ? posts : posts.filter((p) => p.category === category);
  const featured = category === 'All' ? visible.find((p) => p.is_featured) || visible[0] : null;
  const rest = featured ? visible.filter((p) => p.id !== featured.id) : visible;

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead pageIdentifier="Blog" />

      <section className="relative overflow-hidden bg-slate-900 py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_0%,rgba(37,99,235,0.35),transparent),radial-gradient(50%_50%_at_10%_100%,rgba(20,184,166,0.25),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-200 ring-1 ring-white/15">
            <Sparkles className="h-3.5 w-3.5" /> Insights & Articles
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-5xl">The MCS Blog</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
            Practical thinking on software, AI, automation and growing a business in the UAE — from the team that builds it every day.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="h-80 animate-pulse rounded-3xl bg-slate-200/70" />)}</div>
        ) : posts.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl bg-white px-8 py-16 text-center shadow-sm ring-1 ring-slate-200/70">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><BookOpen className="h-8 w-8" /></span>
            <h2 className="mt-5 text-2xl font-bold text-slate-900">Our first articles are on the way</h2>
            <p className="mt-2 text-slate-500">We're preparing practical guides on software, AI and automation for UAE businesses. Meanwhile, explore what we build.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/Portfolio" className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">See our work</Link>
              <Link to="/Contact" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50">Talk to us</Link>
            </div>
          </div>
        ) : (
          <>
            {categories.length > 2 && (
              <div className="mb-10 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button key={c} onClick={() => setCategory(c)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${category === c ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}>{c}</button>
                ))}
              </div>
            )}
            {featured && <div className="mb-10"><PostCard post={featured} lang={lang} featured /></div>}
            {rest.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => <PostCard key={post.id} post={post} lang={lang} />)}
              </div>
            )}
          </>
        )}
      </main>

      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-teal-500 py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Have a project in mind?</h2>
            <p className="mt-2 max-w-xl text-blue-100">Tell us what you're building — we'll come back with honest advice and a clear next step.</p>
          </div>
          <Link to="/Contact" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5">
            Start a conversation {lang === 'ar' ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
          </Link>
        </div>
      </section>
    </div>
  );
}
