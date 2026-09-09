import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Copy, Check, Image as ImageIcon, Trash2, Move, Plus, RotateCcw, Type, Palette as PaletteIcon, PenLine, Square } from 'lucide-react';
import { toast } from 'sonner';
import { CopyButton, ResetButton, SavePrefsButton } from './ToolHelpers';
import ShareTool from './ShareTool';
import { jsPDF } from 'jspdf';

// Photo Editor with Filters
export function PhotoEditor() {
  const [image, setImage] = useState(null);
  const [filter, setFilter] = useState('none');
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);
  
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          originalImageRef.current = img;
          setImage(ev.target.result);
          applyFilters(img);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const applyFilters = useCallback((img = originalImageRef.current) => {
    if (!img || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Build filter string
    let filterStr = `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`;
    if (filter === 'grayscale') filterStr += ' grayscale(100%)';
    if (filter === 'sepia') filterStr += ' sepia(100%)';
    if (filter === 'invert') filterStr += ' invert(100%)';
    if (filter === 'blur') filterStr += ' blur(3px)';
    if (filter === 'vintage') filterStr += ' sepia(50%) contrast(90%) brightness(90%)';
    
    ctx.filter = filterStr;
    ctx.drawImage(img, 0, 0);
  }, [filter, brightness, contrast, saturation]);
  
  useEffect(() => {
    if (originalImageRef.current) {
      applyFilters();
    }
  }, [applyFilters]);
  
  const download = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'edited-photo.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Image downloaded!');
    }
  };
  
  const reset = () => {
    setFilter('none');
    setBrightness([100]);
    setContrast([100]);
    setSaturation([100]);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Photo Editor</h3>
        <ShareTool toolId="photo-editor" toolName="Photo Editor" />
      </div>
      
      <div>
        <Label>Upload Image</Label>
        <Input type="file" accept="image/*" onChange={handleUpload} className="mt-2" />
      </div>
      
      {image && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block">Filters</Label>
              <div className="flex flex-wrap gap-2">
                {['none', 'grayscale', 'sepia', 'invert', 'blur', 'vintage'].map(f => (
                  <Button 
                    key={f} 
                    variant={filter === f ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setFilter(f)}
                    className={`capitalize ${filter === f ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Brightness: {brightness[0]}%</Label>
                <Slider value={brightness} onValueChange={setBrightness} min={0} max={200} className="mt-2" />
              </div>
              <div>
                <Label>Contrast: {contrast[0]}%</Label>
                <Slider value={contrast} onValueChange={setContrast} min={0} max={200} className="mt-2" />
              </div>
              <div>
                <Label>Saturation: {saturation[0]}%</Label>
                <Slider value={saturation} onValueChange={setSaturation} min={0} max={200} className="mt-2" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-100 p-4 rounded-xl overflow-auto">
            <canvas ref={canvasRef} className="max-w-full h-auto mx-auto rounded-lg" style={{ maxHeight: 400 }} />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={download} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// GIF Creator
export function GifCreator() {
  const [frames, setFrames] = useState([]);
  const [delay, setDelay] = useState([500]);
  
  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    })).then(images => setFrames(prev => [...prev, ...images]));
  };
  
  const removeFrame = (index) => {
    setFrames(frames.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">GIF Creator</h3>
        <ShareTool toolId="gif-creator" toolName="GIF Creator" />
      </div>
      <p className="text-sm text-slate-500">Upload multiple images to create an animated GIF sequence.</p>
      
      <div>
        <Label>Upload Images (in order)</Label>
        <Input type="file" accept="image/*" multiple onChange={handleUpload} className="mt-2" />
      </div>
      
      <div>
        <Label>Frame Delay: {delay[0]}ms</Label>
        <Slider value={delay} onValueChange={setDelay} min={100} max={2000} step={100} className="mt-2" />
      </div>
      
      {frames.length > 0 && (
        <>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {frames.map((frame, i) => (
              <div key={i} className="relative group">
                <img src={frame} alt={`Frame ${i + 1}`} className="w-full h-20 object-cover rounded-lg border" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button onClick={() => removeFrame(i)} className="text-white">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">{i + 1}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm">
              <strong>Note:</strong> GIF generation requires the gif.js library. For production, include via CDN. 
              This preview shows {frames.length} frames at {delay[0]}ms delay.
            </p>
          </div>
          
          <Button disabled className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
            <Download className="w-4 h-4 mr-2" /> Generate GIF ({frames.length} frames)
          </Button>
        </>
      )}
    </div>
  );
}

// Color Palette Generator
export function ColorPaletteGenerator() {
  const [image, setImage] = useState(null);
  const [colors, setColors] = useState([]);
  const [copied, setCopied] = useState(null);
  const canvasRef = useRef(null);
  
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target.result);
        extractColors(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const extractColors = (imageSrc) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);
      
      const imageData = ctx.getImageData(0, 0, 100, 100).data;
      const colorMap = {};
      
      // Sample pixels and quantize colors
      for (let i = 0; i < imageData.length; i += 16) {
        const r = Math.round(imageData[i] / 32) * 32;
        const g = Math.round(imageData[i + 1] / 32) * 32;
        const b = Math.round(imageData[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }
      
      // Get top 6 colors
      const sortedColors = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([rgb]) => {
          const [r, g, b] = rgb.split(',').map(Number);
          const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
          return { rgb: `rgb(${r}, ${g}, ${b})`, hex };
        });
      
      setColors(sortedColors);
    };
    img.src = imageSrc;
  };
  
  const copyColor = (color, type) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    toast.success('Color copied!');
    setTimeout(() => setCopied(null), 2000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Color Palette Generator</h3>
        <ShareTool toolId="color-palette" toolName="Color Palette Generator" />
      </div>
      <p className="text-sm text-slate-500">Upload an image to extract its dominant colors.</p>
      
      <div>
        <Label>Upload Image</Label>
        <Input type="file" accept="image/*" onChange={handleUpload} className="mt-2" />
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      {image && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-2 block">Source Image</Label>
            <img src={image} alt="Source" className="w-full h-48 object-cover rounded-xl border" />
          </div>
          <div>
            <Label className="mb-2 block">Extracted Palette ({colors.length} colors)</Label>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color, i) => (
                <button
                  key={i}
                  onClick={() => copyColor(color.hex, 'hex')}
                  className="group relative h-16 rounded-lg border-2 border-transparent hover:border-slate-300 transition-all"
                  style={{ backgroundColor: color.hex }}
                >
                  <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                    {copied === color.hex ? 'Copied!' : color.hex}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {colors.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-4">
          <h4 className="font-semibold mb-3">Color Values</h4>
          <div className="space-y-2">
            {colors.map((color, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border" style={{ backgroundColor: color.hex }} />
                <code className="text-sm bg-white px-2 py-1 rounded border">{color.hex}</code>
                <code className="text-sm bg-white px-2 py-1 rounded border">{color.rgb}</code>
                <CopyButton value={color.hex} label="Copy" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced QR Code Generator
export function QRCodeEnhanced() {
  const [qrText, setQrText] = useState('https://example.com');
  const [customText, setCustomText] = useState('');
  const [logo, setLogo] = useState(null);
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const canvasRef = useRef(null);
  
  const generateQR = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 250;
    canvas.width = size;
    canvas.height = size + (customText ? 40 : 0);
    
    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // QR Pattern (simplified)
    ctx.fillStyle = qrColor;
    const hash = qrText.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    const modules = 25;
    const moduleSize = size / modules;
    
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        const isPositionPattern = (i < 7 && j < 7) || (i < 7 && j >= modules - 7) || (i >= modules - 7 && j < 7);
        const shouldFill = isPositionPattern || ((hash + i * j + i + j) % 3 === 0);
        if (shouldFill) {
          ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize - 1, moduleSize - 1);
        }
      }
    }
    
    // Position patterns
    const drawPositionPattern = (x, y) => {
      ctx.fillStyle = qrColor;
      ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
      ctx.fillStyle = bgColor;
      ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
      ctx.fillStyle = qrColor;
      ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };
    
    drawPositionPattern(0, 0);
    drawPositionPattern((modules - 7) * moduleSize, 0);
    drawPositionPattern(0, (modules - 7) * moduleSize);
    
    // Add logo if exists
    if (logo) {
      const img = new window.Image();
      img.onload = () => {
        const logoSize = size * 0.2;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;
        ctx.fillStyle = bgColor;
        ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        addText();
      };
      img.src = logo;
    } else {
      addText();
    }
    
    function addText() {
      if (customText) {
        ctx.fillStyle = qrColor;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(customText, size / 2, size + 25);
      }
    }
  }, [qrText, customText, logo, qrColor, bgColor]);
  
  useEffect(() => {
    generateQR();
  }, [generateQR]);
  
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogo(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  
  const download = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR Code downloaded!');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Enhanced QR Code Generator</h3>
        <ShareTool toolId="qr-code" toolName="QR Code Generator" inputs={{ qrText }} />
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>URL or Text</Label>
          <Input value={qrText} onChange={(e) => setQrText(e.target.value)} className="mt-2" placeholder="https://example.com" />
        </div>
        <div>
          <Label>Text Below QR (optional)</Label>
          <Input value={customText} onChange={(e) => setCustomText(e.target.value)} className="mt-2" placeholder="Scan Me!" />
        </div>
        <div>
          <Label>QR Color</Label>
          <div className="flex gap-2 mt-2">
            <Input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="w-16 h-10" />
            <Input value={qrColor} onChange={(e) => setQrColor(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Background Color</Label>
          <div className="flex gap-2 mt-2">
            <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-16 h-10" />
            <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
          </div>
        </div>
        <div className="md:col-span-2">
          <Label>Add Logo (optional)</Label>
          <Input type="file" accept="image/*" onChange={handleLogoUpload} className="mt-2" />
          {logo && <Button variant="link" size="sm" onClick={() => setLogo(null)}>Remove Logo</Button>}
        </div>
      </div>
      
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <canvas ref={canvasRef} className="mx-auto" />
        </div>
      </div>
      
      <div className="flex justify-center gap-2">
        <Button onClick={download} className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
          <Download className="w-4 h-4 mr-2" /> Download QR Code
        </Button>
        <ResetButton onReset={() => { setQrText('https://example.com'); setCustomText(''); setLogo(null); setQrColor('#000000'); setBgColor('#ffffff'); }} />
      </div>
      
      <p className="text-xs text-slate-500 text-center">Note: This generates a stylized QR-like pattern for demo. Use a proper QR library for production.</p>
    </div>
  );
}

// Enhanced Thumbnail Creator with drag elements
export function ThumbnailCreatorEnhanced() {
  const [bgColor, setBgColor] = useState('#3b82f6');
  const [bgImage, setBgImage] = useState(null);
  const [title, setTitle] = useState('Your Title Here');
  const [titlePos, setTitlePos] = useState({ x: 640, y: 300 });
  const [subtitle, setSubtitle] = useState('Subtitle text');
  const [subtitlePos, setSubtitlePos] = useState({ x: 640, y: 380 });
  const [logo, setLogo] = useState(null);
  const [logoPos, setLogoPos] = useState({ x: 100, y: 100 });
  const [overlayImages, setOverlayImages] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;
    
    const draw = () => {
      // Background
      if (bgImage) {
        const img = new window.Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 1280, 720);
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fillRect(0, 0, 1280, 720);
          drawElements();
        };
        img.src = bgImage;
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 1280, 720);
        drawElements();
      }
    };
    
    const drawElements = () => {
      // Title
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 72px Arial';
      ctx.fillText(title, titlePos.x, titlePos.y);
      
      // Subtitle
      ctx.font = '36px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(subtitle, subtitlePos.x, subtitlePos.y);
      
      // Logo
      if (logo) {
        const logoImg = new window.Image();
        logoImg.onload = () => {
          ctx.drawImage(logoImg, logoPos.x, logoPos.y, 150, 150);
          drawOverlays();
        };
        logoImg.src = logo;
      } else {
        drawOverlays();
      }
    };
    
    const drawOverlays = () => {
      overlayImages.forEach(overlay => {
        const img = new window.Image();
        img.onload = () => {
          ctx.drawImage(img, overlay.x, overlay.y, overlay.width || 200, overlay.height || 200);
        };
        img.src = overlay.src;
      });
    };
    
    draw();
  }, [bgColor, bgImage, title, titlePos, subtitle, subtitlePos, logo, logoPos, overlayImages]);
  
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);
  
  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBgImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogo(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  
  const handleOverlayUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOverlayImages([...overlayImages, { src: ev.target.result, x: 200, y: 200, width: 200, height: 200 }]);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const download = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'thumbnail.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Thumbnail downloaded!');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Enhanced Thumbnail Creator (1280×720)</h3>
        <ShareTool toolId="thumbnail" toolName="Thumbnail Creator" />
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label>Title Text</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" />
        </div>
        <div>
          <Label>Title X: {titlePos.x}</Label>
          <Slider value={[titlePos.x]} onValueChange={([x]) => setTitlePos({ ...titlePos, x })} min={0} max={1280} className="mt-2" />
        </div>
        <div>
          <Label>Title Y: {titlePos.y}</Label>
          <Slider value={[titlePos.y]} onValueChange={([y]) => setTitlePos({ ...titlePos, y })} min={0} max={720} className="mt-2" />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label>Subtitle Text</Label>
          <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="mt-2" />
        </div>
        <div>
          <Label>Subtitle X: {subtitlePos.x}</Label>
          <Slider value={[subtitlePos.x]} onValueChange={([x]) => setSubtitlePos({ ...subtitlePos, x })} min={0} max={1280} className="mt-2" />
        </div>
        <div>
          <Label>Subtitle Y: {subtitlePos.y}</Label>
          <Slider value={[subtitlePos.y]} onValueChange={([y]) => setSubtitlePos({ ...subtitlePos, y })} min={0} max={720} className="mt-2" />
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>Background Color</Label>
          <div className="flex gap-2 mt-2">
            <Input type="color" value={bgColor} onChange={(e) => { setBgColor(e.target.value); setBgImage(null); }} className="w-16 h-10" />
            <div className="flex gap-1">
              {['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#1e293b'].map(color => (
                <button key={color} onClick={() => { setBgColor(color); setBgImage(null); }}
                  className="w-8 h-8 rounded-lg border-2 border-white shadow" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <Label>Background Image</Label>
          <Input type="file" accept="image/*" onChange={handleBgUpload} className="mt-2" />
        </div>
        <div>
          <Label>Add Logo</Label>
          <Input type="file" accept="image/*" onChange={handleLogoUpload} className="mt-2" />
        </div>
      </div>
      
      {logo && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Logo X: {logoPos.x}</Label>
            <Slider value={[logoPos.x]} onValueChange={([x]) => setLogoPos({ ...logoPos, x })} min={0} max={1130} className="mt-2" />
          </div>
          <div>
            <Label>Logo Y: {logoPos.y}</Label>
            <Slider value={[logoPos.y]} onValueChange={([y]) => setLogoPos({ ...logoPos, y })} min={0} max={570} className="mt-2" />
          </div>
        </div>
      )}
      
      <div>
        <Label>Add Overlay Images</Label>
        <Input type="file" accept="image/*" onChange={handleOverlayUpload} className="mt-2" />
        {overlayImages.length > 0 && (
          <div className="flex gap-2 mt-2">
            {overlayImages.map((_, i) => (
              <Button key={i} variant="outline" size="sm" onClick={() => setOverlayImages(overlayImages.filter((_, idx) => idx !== i))}>
                Remove Image {i + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      <div ref={containerRef} className="bg-slate-100 p-4 rounded-xl overflow-hidden">
        <canvas ref={canvasRef} className="w-full max-w-3xl mx-auto rounded-lg shadow-lg" style={{ aspectRatio: '16/9' }} />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={download} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <Download className="w-4 h-4 mr-2" /> Download Thumbnail
        </Button>
        <ResetButton onReset={() => {
          setBgColor('#3b82f6');
          setBgImage(null);
          setTitle('Your Title Here');
          setTitlePos({ x: 640, y: 300 });
          setSubtitle('Subtitle text');
          setSubtitlePos({ x: 640, y: 380 });
          setLogo(null);
          setLogoPos({ x: 100, y: 100 });
          setOverlayImages([]);
        }} />
      </div>
    </div>
  );
}

// Image to PDF with jsPDF
export function ImageToPDF() {
  const [images, setImages] = useState([]);
  const [orientation, setOrientation] = useState('portrait');
  const [generating, setGenerating] = useState(false);
  
  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve({ name: file.name, data: ev.target.result });
        reader.readAsDataURL(file);
      });
    })).then(newImages => setImages(prev => [...prev, ...newImages]));
  };
  
  const generatePDF = async () => {
    if (images.length === 0) return;
    setGenerating(true);
    
    try {
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();
        
        const img = new window.Image();
        img.src = images[i].data;
        
        await new Promise(resolve => {
          img.onload = () => {
            const imgWidth = img.width;
            const imgHeight = img.height;
            const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
            const width = imgWidth * ratio * 0.9;
            const height = imgHeight * ratio * 0.9;
            const x = (pageWidth - width) / 2;
            const y = (pageHeight - height) / 2;
            
            pdf.addImage(images[i].data, 'JPEG', x, y, width, height);
            resolve();
          };
        });
      }
      
      pdf.save('images.pdf');
      toast.success('PDF created successfully!');
    } catch (error) {
      toast.error('Error creating PDF');
    }
    
    setGenerating(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Image to PDF Converter</h3>
        <ShareTool toolId="image-to-pdf" toolName="Image to PDF Converter" />
      </div>
      <p className="text-sm text-slate-500">Upload images to combine into a single PDF document.</p>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Upload Images</Label>
          <Input type="file" accept="image/*" multiple onChange={handleUpload} className="mt-2" />
        </div>
        <div>
          <Label>Page Orientation</Label>
          <Select value={orientation} onValueChange={setOrientation}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {images.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img.data} alt={img.name} className="w-full h-24 object-cover rounded-lg border" />
                <button onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">Page {i + 1}</span>
              </div>
            ))}
          </div>
          
          <Button onClick={generatePDF} disabled={generating} className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <Download className="w-4 h-4 mr-2" />
            {generating ? 'Generating...' : `Generate PDF (${images.length} pages)`}
          </Button>
        </>
      )}
    </div>
  );
}

// Enhanced Background Removal
export function BackgroundRemovalEnhanced() {
  const [image, setImage] = useState(null);
  const [mode, setMode] = useState('color'); // 'color' or 'auto'
  const [bgColor, setBgColor] = useState('#ffffff');
  const [tolerance, setTolerance] = useState([30]);
  const canvasRef = useRef(null);
  const originalRef = useRef(null);
  
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          originalRef.current = img;
          setImage(ev.target.result);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeBackground = () => {
    const img = originalRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    if (mode === 'color') {
      // Remove specific color
      const hex = bgColor.replace('#', '');
      const targetR = parseInt(hex.substr(0, 2), 16);
      const targetG = parseInt(hex.substr(2, 2), 16);
      const targetB = parseInt(hex.substr(4, 2), 16);
      const tol = tolerance[0] * 2.55;
      
      for (let i = 0; i < data.length; i += 4) {
        if (Math.abs(data[i] - targetR) < tol && Math.abs(data[i+1] - targetG) < tol && Math.abs(data[i+2] - targetB) < tol) {
          data[i+3] = 0;
        }
      }
    } else {
      // Auto edge detection - remove similar colors from edges
      const edgeColors = new Set();
      const width = canvas.width;
      const height = canvas.height;
      
      // Sample edge pixels
      for (let x = 0; x < width; x++) {
        const topIdx = x * 4;
        const bottomIdx = ((height - 1) * width + x) * 4;
        edgeColors.add(`${data[topIdx]},${data[topIdx+1]},${data[topIdx+2]}`);
        edgeColors.add(`${data[bottomIdx]},${data[bottomIdx+1]},${data[bottomIdx+2]}`);
      }
      for (let y = 0; y < height; y++) {
        const leftIdx = y * width * 4;
        const rightIdx = (y * width + width - 1) * 4;
        edgeColors.add(`${data[leftIdx]},${data[leftIdx+1]},${data[leftIdx+2]}`);
        edgeColors.add(`${data[rightIdx]},${data[rightIdx+1]},${data[rightIdx+2]}`);
      }
      
      const tol = tolerance[0] * 2.55;
      for (let i = 0; i < data.length; i += 4) {
        for (const colorStr of edgeColors) {
          const [r, g, b] = colorStr.split(',').map(Number);
          if (Math.abs(data[i] - r) < tol && Math.abs(data[i+1] - g) < tol && Math.abs(data[i+2] - b) < tol) {
            data[i+3] = 0;
            break;
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    toast.success('Background removed!');
  };
  
  const download = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'bg-removed.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Image downloaded!');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Background Removal</h3>
        <ShareTool toolId="bg-remove" toolName="Background Removal" />
      </div>
      <p className="text-sm text-slate-500">Remove backgrounds using color selection or automatic edge detection.</p>
      
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList>
          <TabsTrigger value="color" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Color Selection</TabsTrigger>
          <TabsTrigger value="auto" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Auto (Edge Detection)</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Upload Image</Label>
          <Input type="file" accept="image/*" onChange={handleUpload} className="mt-2" />
        </div>
        {mode === 'color' && (
          <div>
            <Label>Color to Remove</Label>
            <div className="flex gap-2 mt-2">
              <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-16 h-10" />
              <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </div>
          </div>
        )}
      </div>
      
      <div>
        <Label>Tolerance: {tolerance[0]}%</Label>
        <Slider value={tolerance} onValueChange={setTolerance} min={0} max={100} className="mt-2" />
      </div>
      
      {image && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Original</Label>
              <img src={image} alt="Original" className="max-w-full h-auto rounded-lg border" style={{ maxHeight: 300 }} />
            </div>
            <div>
              <Label className="mb-2 block">Result</Label>
              <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg border bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAE/xGYp')] bg-repeat" style={{ maxHeight: 300 }} />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={removeBackground} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Remove Background
            </Button>
            <Button variant="outline" onClick={download}>
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        </>
      )}
    </div>
  );
}