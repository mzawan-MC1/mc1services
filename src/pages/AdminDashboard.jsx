import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { format } from 'date-fns';
import {
  Briefcase, MessageSquare, Users, HelpCircle, Plus, Newspaper, Mail,
  ListTodo, Layers, Building2, Send, CalendarCheck, Calculator, Bot,
  AlertTriangle, ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminLayout from '../components/admin/AdminLayout';

const SOURCE_META = {
  booking: { label: 'Booking', Icon: CalendarCheck, classes: 'bg-violet-100 text-violet-700' },
  estimator: { label: 'Cost Estimate', Icon: Calculator, classes: 'bg-cyan-100 text-cyan-700' },
  assistant: { label: 'Assistant', Icon: Bot, classes: 'bg-fuchsia-100 text-fuchsia-700' },
  contact: { label: 'Contact Form', Icon: Mail, classes: 'bg-sky-100 text-sky-700' },
};

const quickActions = [
  { label: 'Add Portfolio', href: 'AdminPortfolioEdit', icon: Plus },
  { label: 'Add Testimonial', href: 'AdminTestimonialEdit', icon: Plus },
  { label: 'Add Team Member', href: 'AdminTeamEdit', icon: Plus },
  { label: 'Add FAQ', href: 'AdminFAQEdit', icon: Plus },
  { label: 'Write Blog Post', href: 'AdminBlogEdit', icon: Plus },
  { label: 'New Task', href: null, to: '/admin/tasks', icon: Plus },
];

// One uniform stat card: same structure on every card (icon, value, label +
// optional pill on the SAME line) and h-full throughout, so a whole row
// always renders at one identical height. The entire card is a link.
function StatCard({ to, icon: Icon, color, value, label, pill, pillClasses = 'bg-slate-100 text-slate-600', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      <Link to={to} className="block h-full">
        <Card className="h-full transition hover:shadow-md hover:ring-1 hover:ring-slate-200">
          <CardContent className="flex h-full flex-col p-5">
            <div className="flex min-h-[40px] items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-[15px] font-bold leading-tight text-slate-900">{label}</p>
              {pill && (
                <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${pillClasses}`}>{pill}</span>
              )}
            </div>
            <p className="mt-auto pt-4 text-[28px] font-bold leading-none text-slate-900">{value}</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data: portfolios = [] } = useQuery({ queryKey: ['admin-portfolios'], queryFn: () => dataLayer.portfolio.getAll() });
  const { data: testimonials = [] } = useQuery({ queryKey: ['admin-testimonials'], queryFn: () => dataLayer.testimonials.getAll() });
  const { data: team = [] } = useQuery({ queryKey: ['admin-team'], queryFn: () => dataLayer.team.getAll() });
  const { data: contacts = [] } = useQuery({ queryKey: ['admin-contacts'], queryFn: () => dataLayer.contactSubmissions.getAll() });
  const { data: faqs = [] } = useQuery({ queryKey: ['admin-faqs'], queryFn: () => dataLayer.faqs.getAll() });
  const { data: posts = [] } = useQuery({ queryKey: ['dash-blog'], queryFn: () => dataLayer.blog.getAll() });
  const { data: tasks = [] } = useQuery({ queryKey: ['dash-tasks'], queryFn: () => dataLayer.tasks.getAll() });
  const { data: services = [] } = useQuery({ queryKey: ['dash-services'], queryFn: () => dataLayer.services.getAll() });
  const { data: industries = [] } = useQuery({ queryKey: ['dash-industries'], queryFn: () => dataLayer.industries.getAll() });
  const { data: emailSettings } = useQuery({ queryKey: ['dash-email-settings'], queryFn: () => dataLayer.email.getSettings() });
  const { data: emailLogs = [] } = useQuery({ queryKey: ['dash-email-logs'], queryFn: () => dataLayer.email.getLogs() });

  const newContacts = contacts.filter(c => (c.status || 'new') === 'new').length;
  const publishedPosts = posts.filter(p => !p.status || p.status === 'published').length;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isOverdue = (t) => t.status !== 'completed' && t.due_date && new Date(t.due_date) < today;
  const overdueTasks = tasks.filter(isOverdue);
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const openTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    })
    .slice(0, 4);

  const emailConnected = !!emailSettings?.smtp_host;
  const sentCount = emailLogs.filter(l => l.status === 'sent').length;
  const lastLog = emailLogs[0];

  const priorityDot = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-slate-400' };

  return (
    <AdminLayout currentPage="AdminDashboard">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-600">Everything happening across your website, in one place.</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.to || createPageUrl(action.href)}>
                <Button variant="outline" className="h-auto w-full justify-start border-slate-300 py-3 text-slate-700 hover:bg-slate-100">
                  <action.icon className="mr-2 h-4 w-4" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Content stats */}
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700">Website Content</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            <StatCard index={0} to={createPageUrl('AdminPortfolio')} icon={Briefcase} color="bg-blue-500" value={portfolios.length} label="Portfolio" />
            <StatCard index={1} to={createPageUrl('AdminTestimonials')} icon={MessageSquare} color="bg-purple-500" value={testimonials.length} label="Testimonials" />
            <StatCard index={2} to={createPageUrl('AdminTeam')} icon={Users} color="bg-green-500" value={team.length} label="Team Members" />
            <StatCard index={3} to={createPageUrl('AdminBlog')} icon={Newspaper} color="bg-rose-500" value={posts.length} label="Blog Posts" pill={posts.length ? `${publishedPosts} live` : null} pillClasses="bg-rose-50 text-rose-600" />
            <StatCard index={4} to={createPageUrl('AdminFAQs')} icon={HelpCircle} color="bg-cyan-500" value={faqs.length} label="FAQs" />
          </div>
        </div>

        {/* Operations stats */}
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700">Operations</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            <StatCard index={0} to={createPageUrl('AdminContacts')} icon={Mail} color="bg-orange-500" value={contacts.length} label="Inquiries"
              pill={newContacts > 0 ? `${newContacts} new` : null} pillClasses="bg-orange-100 text-orange-700" />
            <StatCard index={1} to="/admin/tasks" icon={ListTodo} color="bg-indigo-500" value={tasks.length} label="Tasks"
              pill={overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : inProgressTasks.length > 0 ? `${inProgressTasks.length} active` : null}
              pillClasses={overdueTasks.length > 0 ? 'bg-red-100 text-red-700' : 'bg-indigo-50 text-indigo-600'} />
            <StatCard index={2} to={createPageUrl('AdminServices')} icon={Layers} color="bg-teal-500" value={services.length} label="Services" />
            <StatCard index={3} to={createPageUrl('AdminIndustries')} icon={Building2} color="bg-amber-500" value={industries.length} label="Industries" />
            <StatCard index={4} to={createPageUrl('AdminEmail')} icon={Send} color="bg-sky-500" value={sentCount} label="Emails Sent"
              pill={emailConnected ? 'Connected' : 'Not set up'} pillClasses={emailConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} />
          </div>
        </div>

        {/* Bottom row: recent inquiries + snapshots */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Recent inquiries */}
          <div className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Recent Inquiries</h2>
              <Link to={createPageUrl('AdminContacts')}>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">View All →</Button>
              </Link>
            </div>
            <Card>
              <CardContent className="p-4 sm:p-5">
                {contacts.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">No inquiries yet</p>
                ) : (
                  <div className="space-y-2.5">
                    {contacts.slice(0, 5).map(contact => {
                      const meta = SOURCE_META[contact.source] || SOURCE_META.contact;
                      return (
                        <Link key={contact.id} to={createPageUrl('AdminContacts')} className="block">
                          <div className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-slate-900">{contact.name}</p>
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.classes}`}>
                                  <meta.Icon className="h-3 w-3" />{meta.label}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600">{contact.email}</p>
                              {contact.message && (
                                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{contact.message.replace(/\s+/g, ' ')}</p>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                (contact.status || 'new') === 'new' ? 'bg-orange-100 text-orange-700' :
                                contact.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {(contact.status || 'new').replace(/_/g, ' ')}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {contact.created_at && format(new Date(contact.created_at), 'MMM d · h:mm a')}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column snapshots */}
          <div className="space-y-6">
            {/* Tasks snapshot */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Tasks Snapshot</h2>
                <Link to="/admin/tasks">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">Open Board →</Button>
                </Link>
              </div>
              <Card>
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{tasks.length} total</span>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">{inProgressTasks.length} in progress</span>
                    {overdueTasks.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-red-700">
                        <AlertTriangle className="h-3 w-3" />{overdueTasks.length} overdue
                      </span>
                    )}
                  </div>
                  {openTasks.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-500">No open tasks — all clear.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {openTasks.map(t => (
                        <Link key={t.id} to={`/admin/tasks/${t.id}`} className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${priorityDot[t.priority] || 'bg-slate-300'}`} />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{t.title}</span>
                          {t.due_date && (
                            <span className={`shrink-0 text-xs ${isOverdue(t) ? 'font-semibold text-red-600' : 'text-slate-400'}`}>
                              {isOverdue(t) ? 'Overdue · ' : ''}{format(new Date(t.due_date), 'MMM d')}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Email system snapshot */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Email System</h2>
                <Link to={createPageUrl('AdminEmail')}>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">Settings →</Button>
                </Link>
              </div>
              <Card>
                <CardContent className="p-4 sm:p-5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${emailConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="font-semibold text-slate-900">{emailConnected ? 'Connected' : 'Not configured'}</span>
                    {emailConnected && <span className="truncate text-slate-500">· {emailSettings.from_email}</span>}
                  </div>
                  {emailConnected && (
                    <div className="mt-3 space-y-1.5 text-slate-600">
                      <p>Alerts go to <span className="font-medium text-slate-800">{emailSettings.notify_email || '—'}</span></p>
                      {lastLog ? (
                        <p className="truncate">
                          Last email: <span className="font-medium text-slate-800">{lastLog.subject}</span>
                          <span className="text-slate-400"> · {lastLog.created_at && format(new Date(lastLog.created_at), 'MMM d, h:mm a')}</span>
                        </p>
                      ) : (
                        <p className="text-slate-400">No emails sent yet.</p>
                      )}
                    </div>
                  )}
                  {!emailConnected && (
                    <Link to={createPageUrl('AdminEmail')} className="mt-3 inline-flex items-center gap-1 font-medium text-blue-600 hover:underline">
                      Set up SMTP <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
