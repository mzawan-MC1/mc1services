-- Create legal_pages table
CREATE TABLE IF NOT EXISTS legal_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  content TEXT,
  title_ar TEXT,
  content_ar TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access" ON legal_pages FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON legal_pages FOR ALL USING (auth.role() = 'authenticated'); -- Adjust if you have specific admin check

-- Insert default pages if they don't exist
INSERT INTO legal_pages (slug, title, title_ar, content, content_ar)
VALUES 
  ('privacy-policy', 'Privacy Policy', 'سياسة الخصوصية', '<h1>Privacy Policy</h1><p>Content coming soon...</p>', '<h1>سياسة الخصوصية</h1><p>المحتوى قادم قريبا...</p>'),
  ('terms-of-service', 'Terms of Service', 'شروط الخدمة', '<h1>Terms of Service</h1><p>Content coming soon...</p>', '<h1>شروط الخدمة</h1><p>المحتوى قادم قريبا...</p>')
ON CONFLICT (slug) DO NOTHING;
