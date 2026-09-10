import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { supabaseHelpers } from './supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, ArrowUp, ArrowDown, Upload } from 'lucide-react';
import {
  inspectMediaFile,
  sanitizeStoragePath,
  validateMediaRequirements,
  validateUploadFile
} from '../utils/uploadValidation';

export default function GalleryUpload({
  value = [],
  onChange,
  label,
  validation,
  accept = 'image/*,video/*',
  storagePath = 'portfolio/gallery'
}) {
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Sync with parent value
  React.useEffect(() => {
    if (value && Array.isArray(value)) {
      setItems(value.map((v, i) => ({ 
        image_url: v.image_url || v,
        caption: v.caption || '',
        caption_ar: v.caption_ar || '',
        alt_text: v.alt_text || '',
        alt_text_ar: v.alt_text_ar || '',
        media_type: v.media_type || (/\.(mp4|webm|ogg)(\?|$)/i.test(v.image_url || v) ? 'video' : 'image'),
        media_role: v.media_role || 'gallery',
        poster_url: v.poster_url || '',
        mime_type: v.mime_type || '',
        width: v.width || null,
        height: v.height || null,
        duration_seconds: v.duration_seconds || null,
        is_featured: v.is_featured || false,
        display_order: v.display_order ?? i
      })));
    }
  }, [value]);

  const sync = (next) => {
    setItems(next);
    onChange && onChange(next);
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setUploading(true);
    const uploaded = [];
    try {
      for (const file of files) {
        validateUploadFile(file, {
          accept,
          maxImageMB: validation?.maxImageMB,
          maxVideoMB: validation?.maxVideoMB
        });
        const metadata = await inspectMediaFile(file);
        validateMediaRequirements(metadata, validation);
        const filename = sanitizeStoragePath(`${storagePath}/${Date.now()}_${file.name}`);
        const { file_url } = await supabaseHelpers.uploadFile(file, filename);
        uploaded.push({
          image_url: file_url,
          caption: '',
          caption_ar: '',
          alt_text: '',
          alt_text_ar: '',
          media_role: 'gallery',
          poster_url: '',
          is_featured: false,
          ...metadata
        });
      }
      sync([...items, ...uploaded].map((item, index) => ({ ...item, display_order: index })));
    } catch (error) {
      console.error('Gallery upload failed');
      if (uploaded.length) {
        sync([...items, ...uploaded].map((item, index) => ({ ...item, display_order: index })));
      }
      window.alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer?.files);
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
      <div
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
      >
        <input type="file" multiple accept={accept} onChange={handleInputChange} className="hidden" id={`gallery-upload-${label || 'default'}`} />
        <label htmlFor={`gallery-upload-${label || 'default'}`} className="cursor-pointer">
          {uploading ? <Loader2 className="mx-auto mb-2 h-7 w-7 animate-spin text-blue-600" /> : <Upload className="mx-auto mb-2 h-7 w-7 text-slate-400" />}
          <span className="block text-sm font-medium text-slate-700">{uploading ? 'Uploading media…' : 'Drag and drop images or videos, or click to browse'}</span>
          <span className="mt-1 block text-xs text-slate-500">
            Recommended {validation?.width || 1600} × {validation?.height || 1000}px{validation?.aspectLabel ? ` (${validation.aspectLabel})` : ''}. Images up to {validation?.maxImageMB || 10}MB; videos up to {validation?.maxVideoMB || 25}MB.
          </span>
          {validation?.note && <span className="mt-1 block text-xs text-slate-500">{validation.note}</span>}
        </label>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <div key={`${item.image_url}-${idx}`} className="flex gap-3 rounded-lg border p-3">
            {item.media_type === 'video' ? (
              <video src={item.image_url} poster={item.poster_url || undefined} className="h-24 w-24 rounded object-cover" muted />
            ) : (
              <img src={item.image_url} alt={item.alt_text || ''} className="h-24 w-24 rounded object-cover" />
            )}
            <div className="flex-1 space-y-2">
              <Input value={item.caption} placeholder="Caption" onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], caption: e.target.value };
                sync(next);
              }} />
              <Input value={item.alt_text || ''} placeholder="Alternative text for accessibility" onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], alt_text: e.target.value };
                sync(next);
              }} />
              <div className="grid grid-cols-2 gap-2">
                <select value={item.media_role || 'gallery'} onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], media_role: e.target.value };
                  sync(next);
                }} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
                  <option value="gallery">Gallery</option>
                  <option value="hero">Hero</option>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="feature">Feature</option>
                  <option value="workflow">Workflow</option>
                  <option value="poster">Poster</option>
                </select>
                <span className="self-center text-xs text-slate-500">{item.width && item.height ? `${item.width}×${item.height}px` : item.media_type}</span>
              </div>
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
  accept: PropTypes.string,
  storagePath: PropTypes.string,
  validation: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
    minWidth: PropTypes.number,
    minHeight: PropTypes.number,
    aspectRatio: PropTypes.number,
    aspectLabel: PropTypes.string,
    tolerance: PropTypes.number,
    maxImageMB: PropTypes.number,
    maxVideoMB: PropTypes.number,
    maxDurationSeconds: PropTypes.number,
    note: PropTypes.string
  })
};
