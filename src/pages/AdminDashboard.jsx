import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import {
  Briefcase, MessageSquare, Users, HelpCircle, Plus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminLayout from '../components/admin/AdminLayout';
import AdminRoute from '../components/AdminRoute';

const stats = [
  { icon: Briefcase, label: 'Portfolio', count: 'portfolios', color: 'bg-blue-500' },
  { icon: MessageSquare, label: 'Testimonials', count: 'testimonials', color: 'bg-purple-500' },
  { icon: Users, label: 'Team Members', count: 'team', color: 'bg-green-500' },
  { icon: MessageSquare, label: 'Inquiries', count: 'contacts', color: 'bg-orange-500' },
  { icon: HelpCircle, label: 'FAQs', count: 'faqs', color: 'bg-cyan-500' },
];

const quickActions = [
  { label: 'Add Portfolio', href: 'AdminPortfolioEdit', icon: Plus },
  { label: 'Add Testimonial', href: 'AdminTestimonialEdit', icon: Plus },
  { label: 'Add Team Member', href: 'AdminTeamEdit', icon: Plus },
  { label: 'Add FAQ', href: 'AdminFAQEdit', icon: Plus },
];

export default function AdminDashboard() {
  const { data: portfolios = [] } = useQuery({ queryKey: ['admin-portfolios'], queryFn: () => dataLayer.portfolio.getAll() });
  const { data: testimonials = [] } = useQuery({ queryKey: ['admin-testimonials'], queryFn: () => dataLayer.testimonials.getAll() });
  const { data: team = [] } = useQuery({ queryKey: ['admin-team'], queryFn: () => dataLayer.team.getAll() });
  const { data: contacts = [] } = useQuery({ queryKey: ['admin-contacts'], queryFn: () => dataLayer.contactSubmissions.getAll() });
  const { data: faqs = [] } = useQuery({ queryKey: ['admin-faqs'], queryFn: () => dataLayer.faqs.getAll() });

  const counts = {
    portfolios: portfolios.length,
    testimonials: testimonials.length,
    team: team.length,
    contacts: contacts.length,
    faqs: faqs.length,
  };

  const newContacts = contacts.filter(c => c.status === 'new').length;

  return (
    <AdminRoute>
      <AdminLayout currentPage="AdminDashboard">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of your website content</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} to={createPageUrl(action.href)}>
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-300 text-slate-700 hover:bg-slate-100 h-auto py-3"
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{counts[stat.count]}</p>
                    <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
                    {stat.count === 'contacts' && newContacts > 0 && (
                      <p className="text-xs text-orange-600 mt-2">{newContacts} new</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Recent Inquiries</h2>
            <Link to={createPageUrl('AdminContacts')}>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                View All →
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-6">
              {contacts.slice(0, 5).length === 0 ? (
                <p className="text-slate-500 text-center py-8">No inquiries yet</p>
              ) : (
                <div className="space-y-3">
                  {contacts.slice(0, 5).map(contact => (
                    <div key={contact.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{contact.name}</p>
                        <p className="text-sm text-slate-600">{contact.email}</p>
                        {contact.message && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{contact.message}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                        contact.status === 'new' ? 'bg-orange-100 text-orange-700' :
                        contact.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {contact.status || 'new'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </AdminLayout>
    </AdminRoute>
  );
}
