import { supabase, supabaseHelpers, storageHelpers } from './supabaseClient';

// Unified data layer that routes all data calls through Supabase
export const dataLayer = {
  // Site Settings
  siteSettings: {
    getAll: () => supabaseHelpers.getAll('site_settings'),
    getBySetting: (key) => supabaseHelpers.getByKey('site_settings', 'setting_key', key),
    create: (data) => supabaseHelpers.create('site_settings', data),
    update: (id, data) => supabaseHelpers.update('site_settings', id, data),
    upsert: (data) => supabaseHelpers.upsert('site_settings', data, 'setting_key'),
  },

  // Header/Footer Settings
  headerFooter: {
    getAll: () => supabaseHelpers.getAll('header_footer_settings'),
    getByKey: (key) => supabaseHelpers.getByKey('header_footer_settings', 'setting_key', key),
    create: (data) => supabaseHelpers.create('header_footer_settings', data),
    update: (id, data) => supabaseHelpers.update('header_footer_settings', id, data),
    upsert: (data) => supabaseHelpers.upsert('header_footer_settings', data, 'setting_key'),
  },

  // Home Page Content
  homeContent: {
    getAll: () => supabaseHelpers.getAll('home_page_content'),
    getBySection: (key) => supabaseHelpers.getByKey('home_page_content', 'section_key', key),
    create: (data) => supabaseHelpers.create('home_page_content', data),
    update: (id, data) => supabaseHelpers.update('home_page_content', id, data),
    upsert: (data) => supabaseHelpers.upsert('home_page_content', data, 'section_key'),
  },

  // Portfolio
  portfolio: {
    getAll: () => supabaseHelpers.getAll('portfolio', 'created_at', false),
    getById: (id) => supabaseHelpers.getById('portfolio', id),
    getImages: async (projectId) => {
      const rows = await supabaseHelpers.getByKey('project_images', 'project_id', projectId);
      return rows.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    },
    setImages: async (projectId, images) => {
      const existing = await supabaseHelpers.getByKey('project_images', 'project_id', projectId);
      const nextUrls = new Set((images || []).map((i) => i.image_url).filter(Boolean));
      const removedUrls = (existing || []).map((e) => e.image_url).filter((u) => u && !nextUrls.has(u));
      if (removedUrls.length) {
        await storageHelpers.deleteFilesByPublicUrls(removedUrls);
      }
      await supabaseHelpers.deleteByKey('project_images', 'project_id', projectId);
      if (images?.length) {
        const payload = images.map((img, idx) => ({
          project_id: projectId,
          image_url: img.image_url,
          caption: img.caption || '',
          display_order: img.display_order ?? idx,
        }));
        await supabaseHelpers.insertMany('project_images', payload);
      }
    },
    getFeatured: async () => {
      const all = await supabaseHelpers.getAll('portfolio');
      return all.filter(p => p.is_featured && p.status === 'published');
    },
    getPublished: async () => {
      const all = await supabaseHelpers.getAll('portfolio');
      return all.filter(p => p.status === 'published');
    },
    create: (data) => supabaseHelpers.create('portfolio', data),
    update: (id, data) => supabaseHelpers.update('portfolio', id, data),
    delete: (id) => supabaseHelpers.delete('portfolio', id),
    async deleteWithFiles(id) {
      const project = await supabaseHelpers.getById('portfolio', id);
      const imgs = await supabaseHelpers.getByKey('project_images', 'project_id', id);
      const urls = [];
      if (project?.main_image_url) urls.push(project.main_image_url);
      if (project?.image_url) urls.push(project.image_url);
      for (const i of imgs || []) {
        if (i?.image_url) urls.push(i.image_url);
      }
      if (urls.length) {
        await storageHelpers.deleteFilesByPublicUrls(urls);
      }
      await supabaseHelpers.delete('portfolio', id);
    },
  },

  // Testimonials
  testimonials: {
    getAll: () => supabaseHelpers.getAll('testimonials', 'created_at', false),
    getById: (id) => supabaseHelpers.getById('testimonials', id),
    getFeatured: async () => {
      const all = await supabaseHelpers.getAll('testimonials');
      return all.filter(t => t.is_featured);
    },
    create: (data) => supabaseHelpers.create('testimonials', data),
    update: (id, data) => supabaseHelpers.update('testimonials', id, data),
    delete: (id) => supabaseHelpers.delete('testimonials', id),
  },

  // Client Logos
  clientLogos: {
    getAll: () => supabaseHelpers.getAll('client_logos', 'order', true),
    getById: (id) => supabaseHelpers.getById('client_logos', id),
    create: (data) => supabaseHelpers.create('client_logos', data),
    update: (id, data) => supabaseHelpers.update('client_logos', id, data),
    delete: (id) => supabaseHelpers.delete('client_logos', id),
  },

  // Services
  services: {
    getAll: () => supabaseHelpers.getAll('services', 'order', true),
    getById: (id) => supabaseHelpers.getById('services', id),
    getActive: async () => {
      const all = await supabaseHelpers.getAll('services');
      return all.filter(s => s.is_active);
    },
    create: (data) => supabaseHelpers.create('services', data),
    update: (id, data) => supabaseHelpers.update('services', id, data),
    delete: (id) => supabaseHelpers.delete('services', id),
  },

  // Team Members
  team: {
    getAll: () => supabaseHelpers.getAll('team_members', 'order', true),
    getById: (id) => supabaseHelpers.getById('team_members', id),
    create: (data) => supabaseHelpers.create('team_members', data),
    update: (id, data) => supabaseHelpers.update('team_members', id, data),
    delete: (id) => supabaseHelpers.delete('team_members', id),
  },

  // FAQs
  faqs: {
    getAll: () => supabaseHelpers.getAll('faqs', 'display_order', true),
    getById: (id) => supabaseHelpers.getById('faqs', id),
    getByCategory: (category) => supabaseHelpers.getByKey('faqs', 'category', category),
    create: (data) => supabaseHelpers.create('faqs', data),
    update: (id, data) => supabaseHelpers.update('faqs', id, data),
    delete: (id) => supabaseHelpers.delete('faqs', id),
  },

  // About Page Content
  aboutContent: {
    getAll: () => supabaseHelpers.getAll('about_page_content'),
    getBySection: (key) => supabaseHelpers.getByKey('about_page_content', 'section_key', key),
    create: (data) => supabaseHelpers.create('about_page_content', data),
    update: (id, data) => supabaseHelpers.update('about_page_content', id, data),
    upsert: (data) => supabaseHelpers.upsert('about_page_content', data, 'section_key'),
  },

  // Service Page Content
  servicePageContent: {
    getAll: () => supabaseHelpers.getAll('service_page_content'),
    getByPage: (slug) => supabaseHelpers.getByKey('service_page_content', 'page_slug', slug),
    create: (data) => supabaseHelpers.create('service_page_content', data),
    update: (id, data) => supabaseHelpers.update('service_page_content', id, data),
    upsert: (data) => supabaseHelpers.upsert('service_page_content', data, 'page_slug'),
    delete: (id) => supabaseHelpers.delete('service_page_content', id),
  },

  // Contact Page Content
  contactContent: {
    getAll: () => supabaseHelpers.getAll('contact_page_content'),
    getBySection: (key) => supabaseHelpers.getByKey('contact_page_content', 'section_key', key),
    create: (data) => supabaseHelpers.create('contact_page_content', data),
    update: (id, data) => supabaseHelpers.update('contact_page_content', id, data),
    upsert: (data) => supabaseHelpers.upsert('contact_page_content', data, 'section_key'),
  },

  // Contact Submissions
  contactSubmissions: {
    getAll: () => supabaseHelpers.getAll('contact_submissions', 'created_at', false),
    getById: (id) => supabaseHelpers.getById('contact_submissions', id),
    create: (data) => supabaseHelpers.create('contact_submissions', data),
    submitPublic: async (data, turnstileToken) => {
      if (!turnstileToken) throw new Error('Security verification is required.');
      const { data: result, error } = await supabase.functions.invoke('submit-contact', {
        body: { ...data, turnstileToken }
      });
      if (error) throw new Error('Contact submission failed.');
      return result;
    },
    update: (id, data) => supabaseHelpers.update('contact_submissions', id, data),
    delete: (id) => supabaseHelpers.delete('contact_submissions', id),
  },

  // Tools Page Content
  toolsContent: {
    getAll: () => supabaseHelpers.getAll('tools_page_content'),
    getBySection: (key) => supabaseHelpers.getByKey('tools_page_content', 'section_key', key),
    create: (data) => supabaseHelpers.create('tools_page_content', data),
    update: (id, data) => supabaseHelpers.update('tools_page_content', id, data),
    upsert: (data) => supabaseHelpers.upsert('tools_page_content', data, 'section_key'),
  },

  // Tools
  tools: {
    getAll: () => supabaseHelpers.getAll('tools', 'order', true),
    getById: (id) => supabaseHelpers.getById('tools', id),
    getVisible: async () => {
      const all = await supabaseHelpers.getAll('tools');
      return all.filter(t => t.is_visible).sort((a, b) => (a.order || 0) - (b.order || 0));
    },
    create: (data) => supabaseHelpers.create('tools', data),
    update: (id, data) => supabaseHelpers.update('tools', id, data),
    delete: (id) => supabaseHelpers.delete('tools', id),
  },

  // Pricing Plans
  pricingPlans: {
    getAll: () => supabaseHelpers.getAll('pricing_plans', 'order', true),
    getById: (id) => supabaseHelpers.getById('pricing_plans', id),
    getByCategory: (category) => supabaseHelpers.getByKey('pricing_plans', 'category', category),
    create: (data) => supabaseHelpers.create('pricing_plans', data),
    update: (id, data) => supabaseHelpers.update('pricing_plans', id, data),
    delete: (id) => supabaseHelpers.delete('pricing_plans', id),
  },

  // Page SEO
  pageSEO: {
    getAll: () => supabaseHelpers.getAll('page_seo'),
    getByPage: (page) => supabaseHelpers.getByKey('page_seo', 'page_path', page),
    create: (data) => supabaseHelpers.create('page_seo', data),
    update: (id, data) => supabaseHelpers.update('page_seo', id, data),
    upsert: (data) => supabaseHelpers.upsert('page_seo', data, 'page_path'),
  },

  // Legal Pages (Privacy Policy, Terms, etc.)
  legalPages: {
    getAll: () => supabaseHelpers.getAll('legal_pages', 'updated_at', false),
    getBySlug: (slug) => supabaseHelpers.getByKey('legal_pages', 'slug', slug),
    create: (data) => supabaseHelpers.create('legal_pages', data),
    update: (id, data) => supabaseHelpers.update('legal_pages', id, data),
    upsert: (data) => supabaseHelpers.upsert('legal_pages', data, 'slug'),
  },

  // Analytics
  analytics: {
    create: (data) => supabaseHelpers.create('analytics_events', data),
    getAll: () => supabaseHelpers.getAll('analytics_events', 'created_at', false),
  },

  // Tasks system (extension)
  tasks: {
    getAll: () => supabaseHelpers.getAll('tasks', 'created_at', false),
    getById: (id) => supabaseHelpers.getById('tasks', id),
    create: (data) => supabaseHelpers.create('tasks', data),
    update: (id, data) => supabaseHelpers.update('tasks', id, data),
    delete: (id) => supabaseHelpers.delete('tasks', id),
    async deleteWithFiles(id) {
      const tl = await supabaseHelpers.getByKey('task_timeline', 'task_id', id);
      const urls = [];
      for (const ev of tl || []) {
        if ((ev.event_type === 'attachment_added' || ev.event_type === 'subtask_attachment') && ev.payload?.url) {
          urls.push(ev.payload.url);
        }
      }
      if (urls.length) {
        try {
          await storageHelpers.deleteFilesByPublicUrls(urls);
        } catch (err) {
          console.error('[tasks.deleteWithFiles] storage cleanup failed, proceeding with DB delete:', err);
        }
      }
      await supabaseHelpers.delete('tasks', id);
    },
    async getListWithStats() {
      const { data: tasks, error } = await supabase.from('tasks').select('*');
      if (error) throw error;
      const { data: stats } = await supabase.from('v_task_stats').select('*');
      const byId = Object.fromEntries((stats||[]).map(s => [s.task_id, s]));
      // assignees
      const ids = tasks.map(t => t.id);
      const { data: assigns } = await supabase.from('task_assignees').select('*').in('task_id', ids);
      const grouped = {};
      for (const a of assigns || []) {
        (grouped[a.task_id] ||= []).push(a);
      }
      // hydrate assignees with user profile
      const userIds = Array.from(new Set((assigns||[]).map(a=>a.user_id)));
      let profilesById = {};
      if (userIds.length) {
        const { data: profiles } = await supabase.from('user_profiles').select('id, full_name, avatar_url, email').in('id', userIds);
        profilesById = Object.fromEntries((profiles||[]).map(p=>[p.id,p]));
      }
      return tasks.map(t => ({
        ...t,
        assignees: (grouped[t.id] || []).map(a => ({ ...a, ...(profilesById[a.user_id]||{}) })),
        total_subtasks: byId[t.id]?.total_subtasks || 0,
        completed_subtasks: byId[t.id]?.completed_subtasks || 0,
        last_activity: byId[t.id]?.last_activity || t.updated_at || t.created_at,
      }));
    }
  },
  taskAssignees: {
    listByTask: (taskId) => supabaseHelpers.getByKey('task_assignees', 'task_id', taskId),
    async create(task_id, user_id) {
      const { data: { user } } = await supabase.auth.getUser();
      return supabaseHelpers.create('task_assignees', { task_id, user_id, assigned_by: user?.id || null });
    },
    async remove(task_id, user_id) {
      if (!supabase) throw new Error('Supabase not initialized');
      const { error } = await supabase.from('task_assignees').delete().eq('task_id', task_id).eq('user_id', user_id);
      if (error) throw error;
    },
    async listTasksByAssignee(user_id) {
      if (!supabase) return [];
      const { data, error } = await supabase.from('task_assignees').select('*').eq('user_id', user_id);
      if (error) throw error;
      return data || [];
    },
    async listTasksByMultipleAssignees(user_ids) {
      if (!supabase) return [];
      const { data, error } = await supabase.from('task_assignees').select('*').in('user_id', user_ids);
      if (error) throw error;
      return data || [];
    },
  },
  users: {
    async listAll() {
      const { data, error } = await supabase.from('user_profiles').select('id, full_name, email, avatar_url').order('full_name', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  },
  taskSubtasks: {
    listByTask: (taskId) => supabaseHelpers.getByKey('task_subtasks', 'task_id', taskId),
    create: (data) => supabaseHelpers.create('task_subtasks', data),
    update: (id, data) => supabaseHelpers.update('task_subtasks', id, data),
    delete: (id) => supabaseHelpers.delete('task_subtasks', id),
  },
  taskTimeline: {
    listByTask: (taskId) => supabaseHelpers.getByKey('task_timeline', 'task_id', taskId),
    async create(data) {
      const { data: { user } } = await supabase.auth.getUser();
      let actor_name = null; let actor_email = null;
      try {
        if (user?.id) {
          const { data: prof } = await supabase.from('user_profiles').select('full_name,email').eq('id', user.id).single();
          actor_name = prof?.full_name || null;
          actor_email = prof?.email || null;
        }
      } catch {
        // Timeline creation can proceed without optional profile metadata.
      }
      const payload = { ...(data?.payload || {}), actor_name, actor_email };
      return supabaseHelpers.create('task_timeline', { actor_id: user?.id || null, ...data, payload });
    },
    delete: (id) => supabaseHelpers.delete('task_timeline', id),
    async deleteWithFile(id) {
      const row = await supabaseHelpers.getById('task_timeline', id);
      if (row?.payload?.url) {
        try {
          await storageHelpers.deleteFileByPublicUrl(row.payload.url);
        } catch (err) {
          console.error('[taskTimeline.deleteWithFile] storage deletion failed, proceeding with DB row delete:', err);
        }
      }
      await supabaseHelpers.delete('task_timeline', id);
    },
  },

  // Auth (User)
  auth: {
    getUser: async () => {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },
    isAdmin: async () => {
        if (!supabase) return false;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        const { data, error } = await supabase.rpc('is_admin');
        if (error) {
          console.error('Unable to verify administrator access:', error.message);
          return false;
        }
        return data === true;
    }
  },
  roles: {
    getAll: async () => {
      const { data, error } = await supabase.from('roles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (payload) => {
      const { data, error } = await supabase.from('roles').insert(payload).select('*').single();
      if (error) throw error;
      return data;
    },
    update: async (id, payload) => {
      const { data, error } = await supabase.from('roles').update(payload).eq('id', id).select('*').single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('roles').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // File Upload
  uploadFile: (file, path) => supabaseHelpers.uploadFile(file, path),
};

export default dataLayer;
