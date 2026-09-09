/**
 * Tool Seeding Script for Supabase
 * 
 * Run this once to populate the tools table with all available tools
 * Usage: node components/seedTools.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import process from 'node:process';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

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

async function seedTools() {
  console.log('🌱 Seeding tools to Supabase...\n');

  try {
    const { data, error } = await supabase
      .from('tools')
      .upsert(tools, { onConflict: 'tool_id' })
      .select();

    if (error) {
      console.error('❌ Error seeding tools:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully seeded ${data.length} tools`);
    console.log('\n📊 Tools by category:');
    const counts = {};
    tools.forEach(t => counts[t.category] = (counts[t.category] || 0) + 1);
    Object.entries(counts).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} tools`);
    });
    console.log('\n✨ Seeding complete!');
  } catch (err) {
    console.error('💥 Seeding failed:', err);
    process.exit(1);
  }
}

seedTools();
