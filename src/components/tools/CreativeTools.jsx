import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreativeTools({ activeTool }) {
  // Image Background Removal
  const [bgImage, setBgImage] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [tolerance, setTolerance] = useState([30]);
  const bgCanvasRef = useRef(null);

  // Image Resizer
  const [resizeImage, setResizeImage] = useState(null);
  const [resizeWidth, setResizeWidth] = useState('800');
  const [resizeHeight, setResizeHeight] = useState('600');
  const [keepAspect, setKeepAspect] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 });
  const resizeCanvasRef = useRef(null);

  // Image Format Converter
  const [convertImage, setConvertImage] = useState(null);
  const [targetFormat, setTargetFormat] = useState('png');
  const convertCanvasRef = useRef(null);

  // QR Code Generator
  const [qrText, setQrText] = useState('https://example.com');
  const qrCanvasRef = useRef(null);

  // Thumbnail Creator
  const [thumbBgColor, setThumbBgColor] = useState('#3b82f6');
  const [thumbTitle, setThumbTitle] = useState('Your Title Here');
  const [thumbSubtitle, setThumbSubtitle] = useState('Subtitle text');
  const [thumbBgImage, setThumbBgImage] = useState(null);
  const thumbCanvasRef = useRef(null);

  // PDF to Image state
  const [pdfFile, setPdfFile] = useState(null);


  // Image to PDF state
  const [pdfImages, setPdfImages] = useState([]);

  // Simple PDF Editor state
  const [editPdfImage, setEditPdfImage] = useState(null);
  const [overlayText, setOverlayText] = useState('');
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(50);
  const editCanvasRef = useRef(null);

  const handleImageUpload = (e, setter, dimensionSetter = null) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          if (dimensionSetter) {
            dimensionSetter({ w: img.width, h: img.height });
            setResizeWidth(img.width.toString());
            setResizeHeight(img.height.toString());
          }
        };
        img.src = event.target.result;
        setter(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadCanvas = (canvasRef, filename) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Image downloaded!');
    }
  };

  // QR Code generation using simple algorithm
  const generateQRCode = useCallback(() => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // Simple QR-like pattern (for demo - real QR needs library)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';

    // Generate pattern based on text hash
    const hash = qrText.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    const modules = 21;
    const moduleSize = size / modules;

    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        // Position patterns (corners)
        const isPositionPattern = (i < 7 && j < 7) || (i < 7 && j >= modules - 7) || (i >= modules - 7 && j < 7);
        // Random fill based on hash
        const shouldFill = isPositionPattern || ((hash + i * j) % 3 === 0);
        if (shouldFill) {
          ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize - 1, moduleSize - 1);
        }
      }
    }

    // Draw position patterns properly
    const drawPositionPattern = (x, y) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };

    drawPositionPattern(0, 0);
    drawPositionPattern((modules - 7) * moduleSize, 0);
    drawPositionPattern(0, (modules - 7) * moduleSize);
  }, [qrText]);

  useEffect(() => {
    if (activeTool === 'qr-code' && qrText) {
      generateQRCode();
    }
  }, [activeTool, qrText, generateQRCode]);

  // Thumbnail creator
  useEffect(() => {
    if (activeTool === 'thumbnail') {
      const canvas = thumbCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = 1280;
      canvas.height = 720;

      // Background
      if (thumbBgImage) {
        const img = new window.Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 1280, 720);
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(0, 0, 1280, 720);
          drawText();
        };
        img.src = thumbBgImage;
      } else {
        ctx.fillStyle = thumbBgColor;
        ctx.fillRect(0, 0, 1280, 720);
        drawText();
      }

      function drawText() {
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 72px Arial';
        ctx.fillText(thumbTitle, 640, 320);
        ctx.font = '36px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(thumbSubtitle, 640, 400);
      }
    }
  }, [activeTool, thumbBgColor, thumbTitle, thumbSubtitle, thumbBgImage]);

  if (activeTool === 'bg-remove') {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Image Background Removal (Simple)</h3>
        <p className="text-sm text-slate-500">Upload an image and select a color to make transparent. Works best with solid color backgrounds.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Upload Image</Label>
            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setBgImage)} className="mt-2" />
          </div>
          <div>
            <Label>Color to Remove</Label>
            <div className="flex gap-2 mt-2">
              <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-20 h-10" />
              <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} placeholder="#ffffff" />
            </div>
          </div>
          <div className="md:col-span-2">
            <Label>Tolerance: {tolerance[0]}%</Label>
            <Slider value={tolerance} onValueChange={setTolerance} min={0} max={100} className="mt-2" />
          </div>
        </div>

        {bgImage && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Original</Label>
                <img src={bgImage} alt="Original" className="max-w-full h-auto rounded-lg border" style={{ maxHeight: 300 }} />
              </div>
              <div>
                <Label className="mb-2 block">Preview</Label>
                <canvas ref={bgCanvasRef} className="max-w-full h-auto rounded-lg border bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAE/xGYp')] bg-repeat" style={{ maxHeight: 300 }} />
              </div>
            </div>
            <Button onClick={() => {
              const canvas = bgCanvasRef.current;
              const ctx = canvas.getContext('2d');
              const img = new window.Image();
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
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
                ctx.putImageData(imageData, 0, 0);
              };
              img.src = bgImage;
              toast.success('Background removed!');
            }} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Remove Background
            </Button>
            <Button variant="outline" onClick={() => downloadCanvas(bgCanvasRef, 'bg-removed.png')}>
              <Download className="w-4 h-4 mr-2" /> Download Result
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (activeTool === 'image-resize') {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Image Resizer</h3>

        <div>
          <Label>Upload Image</Label>
          <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setResizeImage, setOriginalDimensions)} className="mt-2" />
        </div>

        {resizeImage && (
          <>
            <div className="bg-slate-50 rounded-lg p-3 text-sm">
              Original size: {originalDimensions.w} × {originalDimensions.h} px
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Width (px)</Label>
                <Input type="number" value={resizeWidth} onChange={(e) => {
                  setResizeWidth(e.target.value);
                  if (keepAspect && originalDimensions.w > 0) {
                    const ratio = originalDimensions.h / originalDimensions.w;
                    setResizeHeight(Math.round(parseInt(e.target.value) * ratio).toString());
                  }
                }} className="mt-2" />
              </div>
              <div>
                <Label>Height (px)</Label>
                <Input type="number" value={resizeHeight} onChange={(e) => {
                  setResizeHeight(e.target.value);
                  if (keepAspect && originalDimensions.h > 0) {
                    const ratio = originalDimensions.w / originalDimensions.h;
                    setResizeWidth(Math.round(parseInt(e.target.value) * ratio).toString());
                  }
                }} className="mt-2" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={keepAspect} onCheckedChange={setKeepAspect} />
                  <span className="text-sm">Keep aspect ratio</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              {[{ w: 1920, h: 1080, label: '1080p' }, { w: 1280, h: 720, label: '720p' }, { w: 800, h: 600, label: '800×600' }, { w: 400, h: 400, label: '400×400' }].map(preset => (
                <Button key={preset.label} variant="outline" size="sm" onClick={() => { setResizeWidth(preset.w.toString()); setResizeHeight(preset.h.toString()); }}>
                  {preset.label}
                </Button>
              ))}
            </div>

            <canvas ref={resizeCanvasRef} className="hidden" />

            <Button onClick={() => {
              const canvas = resizeCanvasRef.current;
              const ctx = canvas.getContext('2d');
              canvas.width = parseInt(resizeWidth);
              canvas.height = parseInt(resizeHeight);
              const img = new window.Image();
              img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                downloadCanvas(resizeCanvasRef, `resized-${resizeWidth}x${resizeHeight}.png`);
              };
              img.src = resizeImage;
            }} className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
              <Download className="w-4 h-4 mr-2" /> Resize & Download
            </Button>
          </>
        )}
      </div>
    );
  }

  if (activeTool === 'image-convert') {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Image Format Converter</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Upload Image (JPG or PNG)</Label>
            <Input type="file" accept="image/jpeg,image/png" onChange={(e) => handleImageUpload(e, setConvertImage)} className="mt-2" />
          </div>
          <div>
            <Label>Convert To</Label>
            <Select value={targetFormat} onValueChange={setTargetFormat}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG (Lossless, supports transparency)</SelectItem>
                <SelectItem value="jpeg">JPEG (Smaller file size)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {convertImage && (
          <>
            <div className="bg-slate-50 rounded-lg p-4">
              <img src={convertImage} alt="Preview" className="max-w-full h-auto rounded" style={{ maxHeight: 300 }} />
            </div>
            <canvas ref={convertCanvasRef} className="hidden" />
            <Button onClick={() => {
              const canvas = convertCanvasRef.current;
              const ctx = canvas.getContext('2d');
              const img = new window.Image();
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                if (targetFormat === 'jpeg') {
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0);
                const link = document.createElement('a');
                link.download = `converted.${targetFormat}`;
                link.href = canvas.toDataURL(`image/${targetFormat}`, 0.9);
                link.click();
                toast.success('Image converted!');
              };
              img.src = convertImage;
            }} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <Download className="w-4 h-4 mr-2" /> Convert & Download {targetFormat.toUpperCase()}
            </Button>
          </>
        )}
      </div>
    );
  }

  if (activeTool === 'pdf-to-image') {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">PDF to Image Converter</h3>
        <p className="text-sm text-slate-500">Upload a PDF to convert the first page to an image. (Requires PDF.js library)</p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 text-sm">
            ⚠️ <strong>Note:</strong> This feature requires the PDF.js library. For a production implementation,
            include the library via CDN. This demo shows the interface design.
          </p>
        </div>

        <div>
          <Label>Upload PDF</Label>
          <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} className="mt-2" />
        </div>

        {pdfFile && (
          <div className="bg-slate-50 rounded-xl p-6 text-center">
            <FileText className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <p className="font-medium">{pdfFile.name}</p>
            <p className="text-sm text-slate-500">{(pdfFile.size / 1024).toFixed(1)} KB</p>
            <Button className="mt-4" disabled>
              Convert to Image (Requires PDF.js)
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (activeTool === 'image-to-pdf') {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Image to PDF Converter</h3>
        <p className="text-sm text-slate-500">Upload images to combine into a single PDF document.</p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 text-sm">
            ⚠️ <strong>Note:</strong> This feature requires jsPDF library. For production, include via CDN.
            This demo shows the interface design.
          </p>
        </div>

        <div>
          <Label>Upload Images</Label>
          <Input type="file" accept="image/*" multiple onChange={(e) => {
            const files = Array.from(e.target.files);
            Promise.all(files.map(file => {
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve({ name: file.name, data: ev.target.result });
                reader.readAsDataURL(file);
              });
            })).then(images => setPdfImages(images));
          }} className="mt-2" />
        </div>

        {pdfImages.length > 0 && (
          <>
            <div className="grid grid-cols-4 gap-3">
              {pdfImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img.data} alt={img.name} className="w-full h-24 object-cover rounded-lg border" />
                  <button onClick={() => setPdfImages(pdfImages.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <Button disabled>
              Generate PDF ({pdfImages.length} pages) - Requires jsPDF
            </Button>
          </>
        )}
      </div>
    );
  }

  if (activeTool === 'pdf-edit') {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Simple PDF Editor</h3>
        <p className="text-sm text-slate-500">Upload a PDF page image and add text overlay.</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Upload PDF Page (as image)</Label>
            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setEditPdfImage)} className="mt-2" />
          </div>
          <div>
            <Label>Overlay Text</Label>
            <Input value={overlayText} onChange={(e) => setOverlayText(e.target.value)} placeholder="Enter text to overlay" className="mt-2" />
          </div>
          <div>
            <Label>Text X Position: {textX}%</Label>
            <Slider value={[textX]} onValueChange={(v) => setTextX(v[0])} min={0} max={100} className="mt-2" />
          </div>
          <div>
            <Label>Text Y Position: {textY}%</Label>
            <Slider value={[textY]} onValueChange={(v) => setTextY(v[0])} min={0} max={100} className="mt-2" />
          </div>
        </div>

        {editPdfImage && (
          <>
            <div className="relative">
              <img src={editPdfImage} alt="PDF Page" className="max-w-full rounded-lg border" />
              {overlayText && (
                <div className="absolute text-red-500 font-bold text-xl pointer-events-none"
                  style={{ left: `${textX}%`, top: `${textY}%`, transform: 'translate(-50%, -50%)' }}>
                  {overlayText}
                </div>
              )}
            </div>
            <canvas ref={editCanvasRef} className="hidden" />
            <Button onClick={() => {
              const canvas = editCanvasRef.current;
              const ctx = canvas.getContext('2d');
              const img = new window.Image();
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                if (overlayText) {
                  ctx.fillStyle = '#ef4444';
                  ctx.font = 'bold 24px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText(overlayText, (textX / 100) * canvas.width, (textY / 100) * canvas.height);
                }
                downloadCanvas(editCanvasRef, 'edited-pdf.png');
              };
              img.src = editPdfImage;
            }} className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <Download className="w-4 h-4 mr-2" /> Download Edited Image
            </Button>
          </>
        )}
      </div>
    );
  }

  if (activeTool === 'qr-code') {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">QR Code Generator</h3>

        <div>
          <Label>Text or URL</Label>
          <Input value={qrText} onChange={(e) => setQrText(e.target.value)} placeholder="https://example.com" className="mt-2" />
        </div>

        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <canvas ref={qrCanvasRef} width={200} height={200} className="mx-auto" />
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <Button onClick={() => downloadCanvas(qrCanvasRef, 'qrcode.png')} className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
            <Download className="w-4 h-4 mr-2" /> Download QR Code
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center">Note: This generates a stylized QR-like pattern for demo. Use a proper QR library for production.</p>
      </div>
    );
  }

  if (activeTool === 'thumbnail') {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Thumbnail Creator (1280×720)</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Title Text</Label>
            <Input value={thumbTitle} onChange={(e) => setThumbTitle(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label>Subtitle Text</Label>
            <Input value={thumbSubtitle} onChange={(e) => setThumbSubtitle(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label>Background Color</Label>
            <div className="flex gap-2 mt-2">
              <Input type="color" value={thumbBgColor} onChange={(e) => setThumbBgColor(e.target.value)} className="w-20 h-10" />
              <Input value={thumbBgColor} onChange={(e) => setThumbBgColor(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Or Upload Background Image</Label>
            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setThumbBgImage)} className="mt-2" />
          </div>
        </div>

        <div className="flex gap-2">
          {['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#1e293b'].map(color => (
            <button key={color} onClick={() => { setThumbBgColor(color); setThumbBgImage(null); }}
              className="w-8 h-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: color }} />
          ))}
        </div>

        <div className="bg-slate-100 p-4 rounded-xl">
          <canvas ref={thumbCanvasRef} className="w-full max-w-2xl mx-auto rounded-lg shadow-lg" style={{ aspectRatio: '16/9' }} />
        </div>

        <Button onClick={() => downloadCanvas(thumbCanvasRef, 'thumbnail.png')} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <Download className="w-4 h-4 mr-2" /> Download Thumbnail
        </Button>
      </div>
    );
  }

  return null;
}
