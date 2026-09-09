import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { supabaseHelpers } from './supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Image as ImageIcon, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { sanitizeStoragePath, validateUploadFile } from '../utils/uploadValidation';

export default function GalleryUpload({ value = [], onChange, label, validation }) {
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Sync with parent value
  React.useEffect(() => {
    if (value && Array.isArray(value)) {
      setItems(value.map((v, i) => ({ 
        image_url: v.image_url || v, 
        caption: v.caption || '', 
        display_order: v.display_order ?? i 
      })));
    }
  }, [value]);

  const sync = (next) => {
    setItems(next);
    onChange && onChange(next);
  };

  const validateImage = (file) => {
    if (!validation) return Promise.resolve(true);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const { width, height } = img;
        
        // Allow 10% variance
        const tolerance = 0.1;
        
        if (validation.width) {
          const minW = validation.width * (1 - tolerance);
          const maxW = validation.width * (1 + tolerance);
          if (width < minW || width > maxW) {
            reject(new Error(`Image width must be approx ${validation.width}px (got ${width}px)`));
            return;
          }
        }
        
        if (validation.height) {
          const minH = validation.height * (1 - tolerance);
          const maxH = validation.height * (1 + tolerance);
          if (height < minH || height > maxH) {
            reject(new Error(`Image height must be approx ${validation.height}px (got ${height}px)`));
            return;
          }
        }
        
        resolve(true);
      };
      img.onerror = () => reject(new Error('Invalid image file'));
    });
  };

  const handleFile = async (file) => {
    if (!file) return;
    
    try {
      validateUploadFile(file, { accept: 'image/*' });
      if (validation) {
        await validateImage(file);
      }
      
      setUploading(true);
      const filename = sanitizeStoragePath(`${Date.now()}_${file.name}`);
      const { file_url } = await supabaseHelpers.uploadFile(file, filename);
      const next = [...items, { image_url: file_url, caption: '', display_order: items.length }];
      sync(next);
    } catch (error) {
      console.error('Gallery upload failed');
      window.alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const removeAt = (idx) => {
    const next = items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, display_order: i }));
    sync(next);
  };

  const move = (idx, dir) => {
    const next = [...items];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    const tmp = next[idx];
    next[idx] = next[swapIdx];
    next[swapIdx] = tmp;
    next.forEach((it, i) => (it.display_order = i));
    sync(next);
  };

  return (
    <div className="space-y-4">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-3">
        <input type="file" accept="image/*" onChange={handleInputChange} className="hidden" id={`gallery-upload-${label || 'default'}`} />
        <label htmlFor={`gallery-upload-${label || 'default'}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-100 text-slate-700 cursor-pointer">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          Add Image
        </label>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="border rounded-lg p-3 flex gap-3">
            <img src={item.image_url} alt="" className="w-24 h-24 object-cover rounded" />
            <div className="flex-1 space-y-2">
              <Input value={item.caption} placeholder="Caption" onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], caption: e.target.value };
                sync(next);
              }} />
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" onClick={() => move(idx, -1)}><ArrowUp className="w-4 h-4" /></Button>
                <Button type="button" variant="outline" size="icon" onClick={() => move(idx, 1)}><ArrowDown className="w-4 h-4" /></Button>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeAt(idx)} className="ml-auto"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

GalleryUpload.propTypes = {
  value: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      image_url: PropTypes.string,
      caption: PropTypes.string,
      display_order: PropTypes.number
    })
  ])),
  onChange: PropTypes.func,
  label: PropTypes.string,
  validation: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  })
};
