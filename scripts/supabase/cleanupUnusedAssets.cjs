/* Cleanup unused storage assets and stale home content (ESM-compatible via .cjs) */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const process = require('node:process');

// Load .env.local manually if process env missing
(() => {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2];
      }
    }
  }
})();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const bucket = process.env.VITE_SUPABASE_BUCKET || 'public';

if (!url || !key) {
  console.error('Missing Supabase env. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

const TABLES_TO_SCAN = [
  'portfolio',
  'project_images',
  'client_logos',
  'user_profiles',
  'site_settings',
  'home_page_content',
  'service_page_content',
  'testimonials',
  'tools',
];

function extractObjectPath(publicUrl) {
  if (!publicUrl || typeof publicUrl !== 'string') return null;
  const m = publicUrl.match(/\/object\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return { bucket: m[1], path: m[2] };
}

async function collectReferencedPaths() {
  const referenced = new Set();
  for (const table of TABLES_TO_SCAN) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) continue;
    for (const row of data || []) {
      for (const v of Object.values(row)) {
        if (typeof v === 'string') {
          const obj = extractObjectPath(v);
          if (obj && obj.bucket) referenced.add(`${obj.bucket}:${obj.path}`);
        }
      }
    }
  }
  return referenced;
}

async function listBucketObjects(bkt) {
  const { data, error } = await supabase.storage.from(bkt).list('', { limit: 10000 });
  if (error) {
    console.error('List error', bkt, error.message);
    return [];
  }
  return data.map(o => o.name).filter(Boolean);
}

async function deleteUnusedStorage(referenced) {
  const buckets = [bucket, 'avatars'];
  for (const bkt of buckets) {
    const names = await listBucketObjects(bkt);
    const toDelete = names.filter(name => !referenced.has(`${bkt}:${name}`));
    if (toDelete.length) {
      const { error } = await supabase.storage.from(bkt).remove(toDelete);
      if (error) console.error('Remove error', bkt, error.message);
      else console.log(`Deleted ${toDelete.length} unused files from '${bkt}'`);
    } else {
      console.log(`No unused files found in '${bkt}'`);
    }
  }
}

async function pruneHomeContent() {
  const usedSections = new Set(['hero','services','process','stats','video','cta']);
  const { data, error } = await supabase.from('home_page_content').select('*');
  if (error || !Array.isArray(data)) return;
  const bySec = data.reduce((acc, row) => {
    const k = row.section_key || 'unknown';
    (acc[k] ||= []).push(row);
    return acc;
  }, {});
  const deletes = [];
  for (const [sec, rows] of Object.entries(bySec)) {
    if (!usedSections.has(sec)) {
      for (const r of rows) deletes.push(r.id);
      continue;
    }
    rows.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    for (let i = 1; i < rows.length; i++) deletes.push(rows[i].id);
  }
  if (deletes.length) {
    const { error: delErr } = await supabase.from('home_page_content').delete().in('id', deletes);
    if (delErr) console.error('Failed to prune home_page_content:', delErr.message);
    else console.log(`Pruned ${deletes.length} stale home_page_content rows`);
  } else {
    console.log('No stale home_page_content rows to prune');
  }
}

(async function main(){
  try {
    const referenced = await collectReferencedPaths();
    await deleteUnusedStorage(referenced);
    await pruneHomeContent();
    console.log('Cleanup complete');
  } catch (e) {
    console.error('Cleanup failed', e);
    process.exit(1);
  }
})();

