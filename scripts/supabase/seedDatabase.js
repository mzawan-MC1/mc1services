
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import process from 'node:process';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Seed Data
const services = [
  {
    title: 'Software Development',
    description: 'Custom web apps, mobile applications, and enterprise software built with cutting-edge technologies.',
    full_description: 'We build robust, scalable, and secure software solutions tailored to your business needs. From web applications to mobile apps and enterprise software, our team of experts uses the latest technologies to deliver exceptional results.',
    category: 'development',
    features: ['Web Applications', 'Mobile Apps', 'Custom Software', 'API Development'],
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072',
    icon: 'Code',
    order: 0,
    is_active: true
  },
  {
    title: 'Digital Marketing',
    description: 'Data-driven marketing strategies that amplify your brand and drive measurable growth.',
    full_description: 'Our digital marketing services are designed to increase your online visibility and drive targeted traffic to your website. We use a data-driven approach to create effective marketing campaigns that deliver real results.',
    category: 'marketing',
    features: ['SEO & SEM', 'Social Media', 'Content Marketing', 'Paid Advertising'],
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2015',
    icon: 'Megaphone',
    order: 1,
    is_active: true
  },
  {
    title: 'Automation',
    description: 'Streamline your business and marketing with intelligent automation solutions.',
    full_description: 'Automate repetitive tasks and improve efficiency with our custom automation solutions. We help you streamline your business processes and marketing workflows so you can focus on what matters most.',
    category: 'automation',
    features: ['Business Process', 'Marketing Automation', 'CRM Workflows', 'AI Integration'],
    image_url: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&q=80&w=1974',
    icon: 'Zap',
    order: 2,
    is_active: true
  },
  {
    title: 'IT Solutions',
    description: 'Comprehensive IT infrastructure, cloud services, and managed solutions for your business.',
    full_description: 'We provide end-to-end IT solutions to help you build and maintain a reliable and secure IT infrastructure. From cloud services to cybersecurity and managed support, we have you covered.',
    category: 'it_services',
    features: ['Cloud Services', 'DevOps', 'IT Consulting', 'Cybersecurity'],
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072',
    icon: 'Server',
    order: 3,
    is_active: true
  }
];

const portfolios = [
  {
    title: 'E-Commerce Platform Redesign',
    description: 'A complete overhaul of a major e-commerce platform.',
    full_description: 'We redesigned the user interface and user experience of a leading e-commerce platform to improve conversion rates and customer satisfaction. The new design is modern, responsive, and easy to navigate.',
    category: 'web_development',
    client_name: 'TechRetail Inc.',
    image_url: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&q=80&w=1064',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    project_url: 'https://example.com',
    completion_date: '2023-11-15',
    is_featured: true,
    status: 'published'
  },
  {
    title: 'Fitness Tracking App',
    description: 'A mobile app for tracking workouts and nutrition.',
    full_description: 'We developed a cross-platform mobile app that allows users to track their workouts, monitor their nutrition, and set fitness goals. The app features a user-friendly interface and integrates with popular wearable devices.',
    category: 'app_development',
    client_name: 'FitLife',
    image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1470',
    technologies: ['React Native', 'Firebase', 'Redux'],
    project_url: 'https://example.com',
    completion_date: '2024-01-20',
    is_featured: true,
    status: 'published'
  },
  {
    title: 'Corporate Rebranding',
    description: 'Complete brand identity refresh for a financial firm.',
    full_description: 'We worked with a financial services firm to refresh their brand identity. This included designing a new logo, creating brand guidelines, and updating their marketing materials to reflect their modern and professional image.',
    category: 'branding',
    client_name: 'FinancePro',
    image_url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=2000',
    technologies: ['Adobe Illustrator', 'Photoshop', 'Figma'],
    project_url: 'https://example.com',
    completion_date: '2023-09-10',
    is_featured: false,
    status: 'published'
  },
  {
    title: 'Social Media Campaign',
    description: 'Viral social media campaign for a new product launch.',
    full_description: 'We executed a comprehensive social media campaign to launch a new consumer product. The campaign included influencer partnerships, engaging content, and targeted ads, resulting in a significant increase in brand awareness and sales.',
    category: 'marketing',
    client_name: 'TrendSetters',
    image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1974',
    technologies: ['Instagram', 'TikTok', 'Facebook Ads'],
    project_url: 'https://example.com',
    completion_date: '2023-12-05',
    is_featured: true,
    status: 'published'
  },
  {
    title: 'Cloud Migration Strategy',
    description: 'Migrating legacy systems to AWS cloud infrastructure.',
    full_description: 'We helped a large enterprise migrate their legacy systems to the AWS cloud. This involved assessing their current infrastructure, designing a cloud architecture, and executing the migration with minimal downtime.',
    category: 'it_services',
    client_name: 'GlobalCorp',
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072',
    technologies: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    project_url: 'https://example.com',
    completion_date: '2024-02-15',
    is_featured: false,
    status: 'published'
  }
];

const testimonials = [
  {
    client_name: 'Sarah Johnson',
    company: 'TechStart Inc.',
    role: 'CEO',
    content: 'MCS Consultancy transformed our digital presence. Their team is professional, creative, and delivered beyond our expectations.',
    image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    is_featured: true
  },
  {
    client_name: 'Michael Chen',
    company: 'Growth Marketing',
    role: 'Marketing Director',
    content: 'The automation solutions provided by MCS have saved us countless hours. Highly recommended for any business looking to scale.',
    image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    is_featured: true
  },
  {
    client_name: 'Emily Davis',
    company: 'Creative Studios',
    role: 'Art Director',
    content: 'A fantastic partner for our technical needs. They understand the creative process and deliver robust solutions.',
    image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    is_featured: true
  }
];

const tools = [
  // Marketing Tools
  { tool_id: 'budget-split', title: 'Marketing Budget Split Calculator', description: 'Allocate testing vs always-on budget across channels', category: 'marketing', icon_name: 'Calculator', is_visible: true, order: 0 },
  { tool_id: 'roas', title: 'ROAS & Profit Calculator', description: 'Calculate return on ad spend and profit margins', category: 'marketing', icon_name: 'TrendingUp', is_visible: true, order: 1 },
  { tool_id: 'cpm-cpc', title: 'CPM/CPC/CTR/CPA Calculator', description: 'Convert between key advertising metrics', category: 'marketing', icon_name: 'Percent', is_visible: true, order: 2 },
  { tool_id: 'engagement', title: 'Social Media Engagement Rate', description: 'Calculate engagement rates for social posts', category: 'marketing', icon_name: 'BarChart3', is_visible: true, order: 3 },
  { tool_id: 'utm', title: 'UTM Link Builder', description: 'Create trackable campaign URLs', category: 'marketing', icon_name: 'Link2', is_visible: true, order: 4 },
  { tool_id: 'ad-sizes', title: 'Ad Size Guide', description: 'Image & video sizes for all platforms', category: 'marketing', icon_name: 'Layout', is_visible: true, order: 5 },

  // Creative Tools
  { tool_id: 'photo-editor', title: 'Photo Editor', description: 'Apply filters and adjust brightness/contrast', category: 'creative', icon_name: 'Sparkles', is_visible: true, order: 0 },
  { tool_id: 'bg-remove', title: 'Background Removal', description: 'Remove backgrounds using color or auto detection', category: 'creative', icon_name: 'Scissors', is_visible: true, order: 1 },
  { tool_id: 'color-palette', title: 'Color Palette Generator', description: 'Extract dominant colors from images', category: 'creative', icon_name: 'Paintbrush', is_visible: true, order: 2 },
  { tool_id: 'gif-creator', title: 'GIF Creator', description: 'Create animated GIFs from images', category: 'creative', icon_name: 'Film', is_visible: true, order: 3 },
  { tool_id: 'image-resize', title: 'Image Resizer', description: 'Resize images to any dimension', category: 'creative', icon_name: 'Maximize2', is_visible: true, order: 4 },
  { tool_id: 'image-convert', title: 'Image Format Converter', description: 'Convert between JPG and PNG', category: 'creative', icon_name: 'RefreshCw', is_visible: true, order: 5 },
  { tool_id: 'image-to-pdf', title: 'Image to PDF', description: 'Combine images into a PDF', category: 'creative', icon_name: 'FilePdf', is_visible: true, order: 6 },
  { tool_id: 'pdf-edit', title: 'PDF Editor', description: 'Add text, forms, signatures to PDFs', category: 'creative', icon_name: 'PenTool', is_visible: true, order: 7 },
  { tool_id: 'qr-code', title: 'QR Code Generator', description: 'Generate QR codes with logo & custom colors', category: 'creative', icon_name: 'QrCode', is_visible: true, order: 8 },
  { tool_id: 'thumbnail', title: 'Thumbnail Creator', description: 'Create thumbnails with movable elements', category: 'creative', icon_name: 'Image', is_visible: true, order: 9 },

  // Finance Tools
  { tool_id: 'utility', title: 'Electricity & Water Bill Estimator', description: 'Estimate your monthly DEWA/SEWA bill', category: 'finance', icon_name: 'Zap', is_visible: true, order: 0 },
  { tool_id: 'living', title: 'Cost of Living Calculator', description: 'Plan your monthly budget in UAE', category: 'finance', icon_name: 'Wallet', is_visible: true, order: 1 },
  { tool_id: 'rent', title: 'Rent Affordability Calculator', description: 'Check if rent fits your salary', category: 'finance', icon_name: 'Building', is_visible: true, order: 2 },
  { tool_id: 'transport', title: 'Taxi vs Own Car Comparison', description: 'Compare transportation costs', category: 'finance', icon_name: 'Car', is_visible: true, order: 3 },
  { tool_id: 'petrol', title: 'Petrol Cost Calculator', description: 'Estimate monthly fuel expenses', category: 'finance', icon_name: 'Fuel', is_visible: true, order: 4 },
  { tool_id: 'gratuity', title: 'UAE Gratuity Calculator', description: 'Calculate end-of-service benefits', category: 'finance', icon_name: 'Award', is_visible: true, order: 5 },
  { tool_id: 'mortgage', title: 'Mortgage Affordability Calculator', description: 'Check how much home you can afford', category: 'finance', icon_name: 'Landmark', is_visible: true, order: 6 },
  { tool_id: 'loan', title: 'Personal Loan Calculator', description: 'Calculate loan eligibility and EMI', category: 'finance', icon_name: 'FileText', is_visible: true, order: 7 },
  { tool_id: 'visa', title: 'Visa Overstay Fine Estimator', description: 'Calculate overstay penalties', category: 'finance', icon_name: 'Plane', is_visible: true, order: 8 },
  { tool_id: 'currency', title: 'AED Currency Converter', description: 'Convert AED to other currencies', category: 'finance', icon_name: 'Globe', is_visible: true, order: 9 },

  // UAE Tools
  { tool_id: 'salik', title: 'Salik Toll Calculator', description: 'Calculate Dubai toll gate costs', category: 'uae', icon_name: 'Car', is_visible: true, order: 0 },
  { tool_id: 'telecom', title: 'Etisalat/du Bill Estimator', description: 'Estimate mobile bill based on usage', category: 'uae', icon_name: 'Phone', is_visible: true, order: 1 },
  { tool_id: 'holidays', title: 'UAE Public Holidays 2025', description: 'Complete holiday calendar with types', category: 'uae', icon_name: 'Calendar', is_visible: true, order: 2 },

  // Visitor Tools
  { tool_id: 'itinerary', title: 'Trip Itinerary Generator', description: 'Plan your Dubai/Abu Dhabi trip', category: 'visitor', icon_name: 'Map', is_visible: true, order: 0 },
  { tool_id: 'tickets', title: 'Attractions Budget Estimator', description: 'Calculate ticket costs for attractions', category: 'visitor', icon_name: 'Ticket', is_visible: true, order: 1 },
  { tool_id: 'transit', title: 'Transport Cost Estimator', description: 'Metro vs Taxi cost comparison', category: 'visitor', icon_name: 'Bus', is_visible: true, order: 2 },
  { tool_id: 'timing', title: 'Best Time to Visit', description: 'Find ideal months for your activities', category: 'visitor', icon_name: 'Sun', is_visible: true, order: 3 },
  { tool_id: 'packing', title: 'Packing Checklist Generator', description: 'Get a customized packing list', category: 'visitor', icon_name: 'Luggage', is_visible: true, order: 4 },
];

const teamMembers = [
  {
    name: 'Alex Morgan',
    role: 'Managing Director',
    bio: 'Over 15 years of experience in digital transformation and strategic consulting.',
    image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    linkedin_url: '#',
    order: 0
  },
  {
    name: 'Sophia Chen',
    role: 'Creative Director',
    bio: 'Award-winning designer with a passion for user-centric experiences.',
    image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    linkedin_url: '#',
    order: 1
  },
  {
    name: 'James Wilson',
    role: 'Lead Developer',
    bio: 'Full-stack expert specializing in scalable cloud architectures.',
    image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    linkedin_url: '#',
    order: 2
  }
];

const siteSettings = [
  { setting_key: 'company_name', setting_value: 'MCS Consultancy', setting_category: 'general' },
  { setting_key: 'contact_phone', setting_value: '+971 50 832 2799', setting_category: 'contact' },
  { setting_key: 'contact_email_primary', setting_value: 'info@mc1services.com', setting_category: 'contact' },
  { setting_key: 'contact_address', setting_value: 'Industrial Area 2\nSharjah, UAE', setting_category: 'contact' },
];

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  // Seed Tools
  try {
    const { error } = await supabase.from('tools').upsert(tools, { onConflict: 'tool_id' });
    if (error) throw error;
    console.log(`✅ Seeded ${tools.length} tools`);
  } catch (err) {
    console.error('❌ Error seeding tools:', err.message);
  }

  // Seed Services
  try {
    // Clean and insert services
    await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error } = await supabase.from('services').insert(services);
    if (error) throw error;
    console.log(`✅ Seeded ${services.length} services`);
  } catch (err) {
    console.error('❌ Error seeding services:', err.message);
  }

  // Seed Portfolio
  try {
    await supabase.from('portfolio').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error } = await supabase.from('portfolio').insert(portfolios);
    if (error) throw error;
    console.log(`✅ Seeded ${portfolios.length} portfolio items`);
  } catch (err) {
    console.error('❌ Error seeding portfolio:', err.message);
  }

  // Seed Testimonials
  try {
    await supabase.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error } = await supabase.from('testimonials').insert(testimonials);
    if (error) throw error;
    console.log(`✅ Seeded ${testimonials.length} testimonials`);
  } catch (err) {
    console.error('❌ Error seeding testimonials:', err.message);
  }

  // Seed Team
  try {
    await supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error } = await supabase.from('team_members').insert(teamMembers);
    if (error) throw error;
    console.log(`✅ Seeded ${teamMembers.length} team members`);
  } catch (err) {
    console.error('❌ Error seeding team:', err.message);
  }

  // Seed Site Settings
  try {
    const { error } = await supabase.from('site_settings').upsert(siteSettings, { onConflict: 'setting_key' });
    if (error) throw error;
    console.log(`✅ Seeded ${siteSettings.length} site settings`);
  } catch (err) {
    console.error('❌ Error seeding settings:', err.message);
  }

  console.log('✨ Database seeding complete!');
  process.exit(0);
}

seedDatabase();
