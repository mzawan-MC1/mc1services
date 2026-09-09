-- Add Arabic columns to tables

-- Portfolio
ALTER TABLE portfolio 
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS full_description_ar TEXT,
ADD COLUMN IF NOT EXISTS category_ar TEXT,
ADD COLUMN IF NOT EXISTS challenges_ar TEXT,
ADD COLUMN IF NOT EXISTS solutions_ar TEXT,
ADD COLUMN IF NOT EXISTS results_ar TEXT;

-- Services
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS full_description_ar TEXT,
ADD COLUMN IF NOT EXISTS category_ar TEXT,
ADD COLUMN IF NOT EXISTS features_ar TEXT[];

-- Team Members
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS name_ar TEXT,
ADD COLUMN IF NOT EXISTS role_ar TEXT,
ADD COLUMN IF NOT EXISTS bio_ar TEXT;

-- Testimonials
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS client_name_ar TEXT,
ADD COLUMN IF NOT EXISTS company_ar TEXT,
ADD COLUMN IF NOT EXISTS role_ar TEXT,
ADD COLUMN IF NOT EXISTS content_ar TEXT;

-- FAQs
ALTER TABLE faqs 
ADD COLUMN IF NOT EXISTS question_ar TEXT,
ADD COLUMN IF NOT EXISTS answer_ar TEXT,
ADD COLUMN IF NOT EXISTS category_ar TEXT;

-- Tools
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS category_ar TEXT;

-- Pricing Plans
ALTER TABLE pricing_plans 
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS features_ar TEXT[],
ADD COLUMN IF NOT EXISTS category_ar TEXT,
ADD COLUMN IF NOT EXISTS period_ar TEXT;

-- Site Settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS setting_value_ar TEXT;

-- Header/Footer Settings
ALTER TABLE header_footer_settings 
ADD COLUMN IF NOT EXISTS cta_button_text_ar TEXT,
ADD COLUMN IF NOT EXISTS footer_text_ar TEXT,
ADD COLUMN IF NOT EXISTS copyright_text_ar TEXT;

-- Home Page Content
ALTER TABLE home_page_content 
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS subtitle_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS button_text_ar TEXT,
ADD COLUMN IF NOT EXISTS button_text_secondary_ar TEXT;

-- About Page Content
ALTER TABLE about_page_content 
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS subtitle_ar TEXT,
ADD COLUMN IF NOT EXISTS content_ar TEXT;

-- Contact Page Content
ALTER TABLE contact_page_content 
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS subtitle_ar TEXT,
ADD COLUMN IF NOT EXISTS address_ar TEXT,
ADD COLUMN IF NOT EXISTS button_text_ar TEXT;

-- Service Page Content
ALTER TABLE service_page_content 
ADD COLUMN IF NOT EXISTS hero_title_ar TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle_ar TEXT,
ADD COLUMN IF NOT EXISTS hero_description_ar TEXT,
ADD COLUMN IF NOT EXISTS cta_text_ar TEXT;

-- Tools Page Content
ALTER TABLE tools_page_content 
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- Page SEO
ALTER TABLE page_seo 
ADD COLUMN IF NOT EXISTS meta_title_ar TEXT,
ADD COLUMN IF NOT EXISTS meta_description_ar TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords_ar TEXT,
ADD COLUMN IF NOT EXISTS og_title_ar TEXT,
ADD COLUMN IF NOT EXISTS og_description_ar TEXT;
