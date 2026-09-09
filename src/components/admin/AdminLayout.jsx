import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { 
  LayoutDashboard, FileText, Settings, Search, Image, Users, Mail,
  ChevronDown, ChevronRight, Menu, X, Eye, LogOut
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Button } from '@/components/ui/button';
import { dataLayer } from '../dataLayer';

export default function AdminLayout({ children, currentPage }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cmsOpen, setCmsOpen] = useState(false);
  const [profile, setProfile] = useState({ name: '', avatar: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate(createPageUrl('AdminLogin'));
  };

  const menuItems = [
    { id: 'label', label: 'Admin Menu', header: true },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
    { id: 'cms', label: 'CMS', icon: FileText, to: '/admin/cms' },
    { id: 'media', label: 'Media Manager', icon: Image, to: '/admin/media' },
    { id: 'tasks', label: 'Tasks', icon: FileText, to: '/admin/tasks' },
    { id: 'portfolio', label: 'Portfolio', icon: FileText, to: '/admin/portfolio' },
    { id: 'faq', label: 'FAQ', icon: FileText, to: '/admin/faq' },
    { id: 'team', label: 'Team Members', icon: Users, to: '/admin/team' },
    { id: 'inquiries', label: 'Inquiries', icon: Mail, to: '/admin/inquiries' },
    { id: 'testimonials', label: 'Testimonials', icon: FileText, to: '/admin/testimonials' },
    { id: 'site-settings', label: 'Site Settings', icon: Settings, to: '/admin/settings' },
    { id: 'seo', label: 'SEO Settings', icon: Search, to: '/admin/seo' },
    { id: 'users', label: 'User Management', icon: Users, to: '/admin/users' },
    { id: 'roles', label: 'Role Management', icon: Users, to: '/admin/roles' },
    { id: 'profile', label: 'Profile', icon: Users, to: '/admin/profile' },
  ];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: prof } = await supabase.from('user_profiles').select('full_name, avatar_url').eq('id', user.id).single();
        const name = prof?.full_name || user.email || 'User';
        const avatar = prof?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
        setProfile({ name, avatar });
      } catch {}
    };
    loadProfile();
    const onStorage = (e) => { if (e.key === 'profile_updated') loadProfile(); };
    const onEvent = () => loadProfile();
    window.addEventListener('storage', onStorage);
    window.addEventListener('profile-updated', onEvent);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'} flex-shrink-0`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
            {sidebarOpen && (
              <Link to={createPageUrl('AdminDashboard')} className="flex items-center gap-2">
                <img src={profile.avatar} alt="avatar" className="w-8 h-8 rounded-lg object-cover border" />
                <span className="font-semibold text-slate-900 truncate max-w-[150px]">{profile.name || 'Admin'}</span>
              </Link>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            {menuItems.map(item => (
              <div key={item.id}>
                {item.header ? (
                  sidebarOpen ? <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</div> : null
                ) : (
                  <Link
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname.toLowerCase() === item.to 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4 space-y-2">
            <Link to={createPageUrl('Home')}>
              <Button variant="outline" size="sm" className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 justify-start">
                <Eye className="w-4 h-4 mr-2" />
                {sidebarOpen && 'View Site'}
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {sidebarOpen && 'Logout'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-slate-900">Admin Panel</span>
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-40" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
