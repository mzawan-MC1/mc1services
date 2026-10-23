import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator, CheckCircle2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ProjectCostEstimator from '../components/tools/ProjectCostEstimator';
import { useEstimatorConfig } from '../hooks/useEstimatorConfig';

export default function ProjectCostEstimatorPage() {
  const cfg = useEstimatorConfig();
  const hero = cfg.hero;

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead pageIdentifier="project-cost-estimator" />

      <section className="relative overflow-hidden bg-slate-900 py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_0%,rgba(37,99,235,0.35),transparent),radial-gradient(50%_50%_at_10%_100%,rgba(20,184,166,0.25),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to="/Tools" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All tools
          </Link>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-200 ring-1 ring-white/15">
            <Calculator className="h-3.5 w-3.5" /> {hero.badge}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-5xl">{hero.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">{hero.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
            {hero.points.map((point) => (
              <span key={point} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-400" />{point}</span>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 md:p-8">
          <ProjectCostEstimator />
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">
          {hero.footerPrefix} <Link to="/BookConsultation" className="font-semibold text-blue-600">{hero.footerConsult}</Link> {hero.footerMid} <Link to="/Portfolio" className="font-semibold text-blue-600">{hero.footerWork}</Link> {hero.footerSuffix}
        </p>
      </main>
    </div>
  );
}
