import { useState } from 'react';
import PropTypes from 'prop-types';
import { supabaseHelpers } from './supabaseClient';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { sanitizeStoragePath, validateUploadFile } from '../utils/uploadValidation';

export default function FileUpload({ value, onChange, currentFile, onUploadComplete, label, accept = "image/*", validation, compact = false }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Handle prop aliases for backward compatibility
  const displayValue = value || currentFile;
  const updateValue = onChange || onUploadComplete;
  const allowsVideo = accept.includes('video/');

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
      validateUploadFile(file, { accept });
      if (validation) {
        await validateImage(file);
      }

      setUploading(true);
      const timestamp = Date.now();
      const filename = sanitizeStoragePath(`${timestamp}_${file.name}`);
      const { file_url } = await supabaseHelpers.uploadFile(file, filename);
      
      if (updateValue) {
        updateValue(file_url);
      }
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    if (updateValue) {
      updateValue('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const inputId = `file-upload-${label || Math.random().toString(36).slice(2)}`;
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input type="file" accept={accept} onChange={handleChange} className="hidden" id={inputId} />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading}
          className="flex items-center gap-1"
          onClick={() => {
            const el = document.getElementById(inputId);
            if (el) el.click();
          }}
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Upload className="w-3 h-3"/>}
          {uploading ? 'Uploading' : 'Upload'}
        </Button>
        {displayValue && (
          <div className="relative">
            {/\.(mp4|webm|ogg)$/i.test(displayValue) ? (
              <video src={displayValue} className="h-10 w-16 object-cover rounded" />
            ) : (
              <img src={displayValue} alt="Uploaded" className="h-10 w-16 object-cover rounded border" />
            )}
            <button type="button" onClick={handleClear} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
      {displayValue ? (
        <div className="relative">
          <div className="border-2 border-slate-200 rounded-lg p-4 bg-slate-50">
            {/\.(mp4|webm|ogg)$/i.test(displayValue) ? (
              <video src={displayValue} controls className="max-h-40 mx-auto rounded" />
            ) : (
              <img src={displayValue} alt="Uploaded" className="max-h-32 mx-auto rounded" />
            )}
          </div>
          <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleClear}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div onDragEnter={() => setDragActive(true)} onDragLeave={() => setDragActive(false)} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className={`border-2 border-dashed rounded-lg p-8 text-center transition ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}>
          <input type="file" accept={accept} onChange={handleChange} className="hidden" id={inputId} />
          <label htmlFor={inputId} className="cursor-pointer">
            {uploading ? (<Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />) : (<ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />)}
            <p className="text-sm text-slate-600 mb-1">{uploading ? 'Uploading...' : 'Drag & drop or click to upload'}</p>
            <p className="text-xs text-slate-500">
              {allowsVideo ? 'Images up to 10MB; MP4, WebM or OGG up to 25MB' : 'JPG, PNG, WebP, GIF, AVIF or ICO up to 10MB'}
            </p>
          </label>
        </div>
      )}
    </div>
  )
}

FileUpload.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  currentFile: PropTypes.string,
  onUploadComplete: PropTypes.func,
  label: PropTypes.string,
  accept: PropTypes.string,
  validation: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  }),
  compact: PropTypes.bool
};
