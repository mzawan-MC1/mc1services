import { createClient } from '@supabase/supabase-js';
import { sanitizeStoragePath, validateUploadFile } from '../utils/uploadValidation';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const SUPABASE_CLIENT_KEY = '__supabase_client__';
let supabase = null;

if (supabaseUrl && supabasePublishableKey) {
  if (!globalThis[SUPABASE_CLIENT_KEY]) {
    globalThis[SUPABASE_CLIENT_KEY] = createClient(supabaseUrl, supabasePublishableKey);
  }
  supabase = globalThis[SUPABASE_CLIENT_KEY];
} else {
  console.warn('Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local');
}

export { supabase };

// Helper functions for common operations
export const supabaseHelpers = {
  // Generic CRUD operations
  async getAll(table, orderBy = 'created_at', ascending = false) {
    if (!supabase) {
      console.error('Supabase not initialized. Please configure environment variables.');
      return [];
    }
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending });
    
    if (error) {
      if (error.code === '42P01') {
        console.warn(`Supabase table '${table}' does not exist. Returning empty array.`);
        return [];
      }
      if (error.message && error.message.includes('Failed to fetch')) {
        console.error('Network error connecting to Supabase. Please check your internet connection and VITE_SUPABASE_URL in .env.local');
      }
      console.error(`Supabase error fetching ${table}:`, error);
      throw error;
    }
    return data || [];
  },

  async getById(table, id) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === '42P01') {
        console.warn(`Supabase table '${table}' does not exist. Returning null.`);
        return null;
      }
      if (error.message && error.message.includes('Failed to fetch')) {
        console.error('Network error connecting to Supabase. Please check your internet connection and VITE_SUPABASE_URL in .env.local');
      }
      console.error(`Supabase error fetching ${table} by id:`, error);
      throw error;
    }
    return data;
  },

  async getByKey(table, key, value) {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(key, value);
    
    if (error) {
      if (error.code === '42P01') {
        console.warn(`Supabase table '${table}' does not exist. Returning empty array.`);
        return [];
      }
      console.error(`Supabase error fetching ${table} by ${key}:`, error);
      throw error;
    }
    return data || [];
  },

  async create(table, data) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error(`Supabase error creating ${table}:`, error);
      throw error;
    }
    return result;
  },

  async update(table, id, data) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Supabase error updating ${table}:`, error);
      throw error;
    }
    return result;
  },

  async upsert(table, data, onConflict = 'id') {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data: result, error } = await supabase
      .from(table)
      .upsert(data, { onConflict })
      .select();
    
    if (error) {
      console.error(`Supabase error upserting ${table}:`, error);
      throw error;
    }
    return result;
  },

  async delete(table, id) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Supabase error deleting ${table}:`, error);
      throw error;
    }
  },

  async deleteByKey(table, key, value) {
    if (!supabase) throw new Error('Supabase not initialized');
    const { error } = await supabase
      .from(table)
      .delete()
      .eq(key, value);
    if (error) {
      console.error(`Supabase error deleting from ${table} by ${key}:`, error);
      throw error;
    }
  },

  async insertMany(table, rows) {
    if (!supabase) throw new Error('Supabase not initialized');
    const { error } = await supabase
      .from(table)
      .insert(rows);
    if (error) {
      console.error(`Supabase error inserting many into ${table}:`, error);
      throw error;
    }
  },

  async uploadFile(file, path) {
    if (!supabase) throw new Error('Supabase not initialized');

    validateUploadFile(file);
    const safePath = sanitizeStoragePath(path);
    const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'public';
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(safePath, file, { upsert: true, contentType: file.type });
    
    if (error) {
      console.error('Supabase error uploading file:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return { file_url: publicUrl };
  }
};

export const storageHelpers = {
  async deleteFileByPublicUrl(fileUrl) {
    if (!supabase) throw new Error('Supabase not initialized');
    if (!fileUrl) return;
    const m = String(fileUrl).match(/\/object\/([^/]+)\/(.+)$/);
    const bucket = m ? m[1] : (import.meta.env.VITE_SUPABASE_BUCKET || 'public');
    const path = m ? m[2] : null;
    if (!path) return;
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error('Supabase error deleting file:', error);
      throw error;
    }
  },
  async deleteFilesByPublicUrls(urls) {
    if (!Array.isArray(urls) || urls.length === 0) return;
    for (const u of urls) {
      await this.deleteFileByPublicUrl(u);
    }
  }
};

export default supabase;
