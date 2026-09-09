import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, Type, PenLine, Trash2, Plus, Move, Square, Circle, Minus, FileSignature } from 'lucide-react';
import { toast } from 'sonner';
import { CopyButton, ResetButton } from './ToolHelpers';
import ShareTool from './ShareTool';
import { jsPDF } from 'jspdf';

export default function PDFEditor() {
  const [pdfImage, setPdfImage] = useState(null);
  const [activeTab, setActiveTab] = useState('text');
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [signature, setSignature] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // New element form state
  const [newText, setNewText] = useState('');
  const [newTextColor, setNewTextColor] = useState('#000000');
  const [newTextSize, setNewTextSize] = useState([16]);
  const [newTextFont, setNewTextFont] = useState('Arial');
  
  const canvasRef = useRef(null);
  const signatureRef = useRef(null);
  const previewRef = useRef(null);
  const imageRef = useRef(null);
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          imageRef.current = img;
          setPdfImage(ev.target.result);
          setElements([]);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Add text element
  const addTextElement = () => {
    if (!newText.trim()) return;
    const newElement = {
      id: Date.now(),
      type: 'text',
      content: newText,
      x: 100,
      y: 100,
      color: newTextColor,
      size: newTextSize[0],
      font: newTextFont
    };
    setElements([...elements, newElement]);
    setNewText('');
    toast.success('Text added! Drag to position.');
  };
  
  // Add form field
  const addFormField = (fieldType) => {
    const newElement = {
      id: Date.now(),
      type: 'field',
      fieldType: fieldType, // 'checkbox', 'radio', 'textbox'
      x: 100,
      y: 150,
      width: fieldType === 'textbox' ? 200 : 20,
      height: fieldType === 'textbox' ? 30 : 20,
      checked: false,
      value: ''
    };
    setElements([...elements, newElement]);
    toast.success(`${fieldType} field added!`);
  };
  
  // Signature canvas handling
  const startDrawing = (e) => {
    if (activeTab !== 'signature') return;
    setIsDrawing(true);
    const canvas = signatureRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  
  const draw = (e) => {
    if (!isDrawing || activeTab !== 'signature') return;
    const canvas = signatureRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearSignature = () => {
    const canvas = signatureRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };
  
  const saveSignature = () => {
    const canvas = signatureRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    setSignature(dataUrl);
    const newElement = {
      id: Date.now(),
      type: 'signature',
      src: dataUrl,
      x: 100,
      y: 400,
      width: 200,
      height: 80
    };
    setElements([...elements, newElement]);
    toast.success('Signature added to document!');
  };
  
  // Remove element
  const removeElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElement(null);
  };
  
  // Update element position
  const updateElementPosition = (id, x, y) => {
    setElements(elements.map(el => el.id === id ? { ...el, x, y } : el));
  };
  
  // Draw preview
  const drawPreview = useCallback(() => {
    const canvas = previewRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw base image
    ctx.drawImage(img, 0, 0);
    
    // Draw elements
    elements.forEach(el => {
      if (el.type === 'text') {
        ctx.fillStyle = el.color;
        ctx.font = `${el.size}px ${el.font}`;
        ctx.fillText(el.content, el.x, el.y);
      } else if (el.type === 'field') {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        if (el.fieldType === 'checkbox') {
          ctx.strokeRect(el.x, el.y, el.width, el.height);
          if (el.checked) {
            ctx.beginPath();
            ctx.moveTo(el.x + 3, el.y + 10);
            ctx.lineTo(el.x + 8, el.y + 16);
            ctx.lineTo(el.x + 17, el.y + 4);
            ctx.stroke();
          }
        } else if (el.fieldType === 'radio') {
          ctx.beginPath();
          ctx.arc(el.x + 10, el.y + 10, 10, 0, Math.PI * 2);
          ctx.stroke();
          if (el.checked) {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(el.x + 10, el.y + 10, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (el.fieldType === 'textbox') {
          ctx.strokeRect(el.x, el.y, el.width, el.height);
          if (el.value) {
            ctx.fillStyle = '#000000';
            ctx.font = '14px Arial';
            ctx.fillText(el.value, el.x + 5, el.y + 20);
          }
        }
      } else if (el.type === 'signature' && el.src) {
        const sigImg = new window.Image();
        sigImg.src = el.src;
        sigImg.onload = () => {
          ctx.drawImage(sigImg, el.x, el.y, el.width, el.height);
        };
      }
      
      // Highlight selected
      if (selectedElement === el.id) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        const w = el.width || ctx.measureText(el.content || '').width || 100;
        const h = el.height || el.size || 30;
        ctx.strokeRect(el.x - 5, el.y - h, w + 10, h + 10);
        ctx.setLineDash([]);
      }
    });
  }, [elements, selectedElement]);
  
  useEffect(() => {
    if (pdfImage) drawPreview();
  }, [pdfImage, elements, selectedElement, drawPreview]);
  
  // Handle canvas click to select/move elements
  const handleCanvasClick = (e) => {
    const canvas = previewRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Find clicked element
    const clicked = elements.find(el => {
      const elWidth = el.width || 100;
      const elHeight = el.height || el.size || 20;
      return x >= el.x && x <= el.x + elWidth && y >= el.y - elHeight && y <= el.y;
    });
    
    setSelectedElement(clicked?.id || null);
  };
  
  // Toggle field check
  const toggleFieldCheck = (id) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, checked: !el.checked } : el
    ));
  };
  
  // Update field value
  const updateFieldValue = (id, value) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, value } : el
    ));
  };
  
  // Download as PDF
  const downloadPDF = () => {
    const canvas = previewRef.current;
    if (!canvas) return;
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    pdf.save('edited-document.pdf');
    toast.success('PDF downloaded!');
  };
  
  // Download as image
  const downloadImage = () => {
    const canvas = previewRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'edited-document.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Image downloaded!');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">PDF Editor</h3>
        <ShareTool toolId="pdf-edit" toolName="PDF Editor" />
      </div>
      <p className="text-sm text-slate-500">Upload a PDF page (as image) to add text, fill forms, and sign documents.</p>
      
      <div>
        <Label>Upload PDF Page (JPG/PNG)</Label>
        <Input type="file" accept="image/*" onChange={handleImageUpload} className="mt-2" />
      </div>
      
      {pdfImage && (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="text" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Type className="w-4 h-4 mr-1" /> Text
              </TabsTrigger>
              <TabsTrigger value="forms" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Square className="w-4 h-4 mr-1" /> Forms
              </TabsTrigger>
              <TabsTrigger value="signature" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <FileSignature className="w-4 h-4 mr-1" /> Sign
              </TabsTrigger>
              <TabsTrigger value="remove" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label>Text Content</Label>
                  <Input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Enter text to add" className="mt-2" />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input type="color" value={newTextColor} onChange={(e) => setNewTextColor(e.target.value)} className="mt-2 h-10" />
                </div>
                <div>
                  <Label>Size: {newTextSize[0]}px</Label>
                  <Slider value={newTextSize} onValueChange={setNewTextSize} min={8} max={72} className="mt-4" />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={newTextFont} onValueChange={setNewTextFont}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addTextElement}>
                  <Plus className="w-4 h-4 mr-1" /> Add Text
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="forms" className="space-y-4 mt-4">
              <p className="text-sm text-slate-600">Add form fields to fill out the document.</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => addFormField('checkbox')}>
                  <Square className="w-4 h-4 mr-1" /> Checkbox
                </Button>
                <Button variant="outline" onClick={() => addFormField('radio')}>
                  <Circle className="w-4 h-4 mr-1" /> Radio Button
                </Button>
                <Button variant="outline" onClick={() => addFormField('textbox')}>
                  <Minus className="w-4 h-4 mr-1" /> Text Field
                </Button>
              </div>
              
              {elements.filter(el => el.type === 'field').length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <Label>Fill Form Fields</Label>
                  {elements.filter(el => el.type === 'field').map(el => (
                    <div key={el.id} className="flex items-center gap-3">
                      {el.fieldType === 'checkbox' && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={el.checked} 
                            onChange={() => toggleFieldCheck(el.id)}
                            className="w-5 h-5 rounded border-slate-300"
                          />
                          <span className="text-sm">Checkbox {el.id}</span>
                        </label>
                      )}
                      {el.fieldType === 'radio' && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={el.checked} 
                            onChange={() => toggleFieldCheck(el.id)}
                            className="w-5 h-5"
                          />
                          <span className="text-sm">Radio {el.id}</span>
                        </label>
                      )}
                      {el.fieldType === 'textbox' && (
                        <div className="flex-1">
                          <Input 
                            value={el.value} 
                            onChange={(e) => updateFieldValue(el.id, e.target.value)}
                            placeholder={`Text field ${el.id}`}
                          />
                        </div>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => removeElement(el.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="signature" className="space-y-4 mt-4">
              <p className="text-sm text-slate-600">Draw your signature below:</p>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-2 bg-white">
                <canvas
                  ref={signatureRef}
                  width={400}
                  height={150}
                  className="w-full cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    draw({ clientX: touch.clientX, clientY: touch.clientY });
                  }}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearSignature}>Clear</Button>
                <Button onClick={saveSignature}>
                  <FileSignature className="w-4 h-4 mr-1" /> Add Signature to Document
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="remove" className="space-y-4 mt-4">
              <p className="text-sm text-slate-600">Click on elements in the preview to select, then remove them here.</p>
              {elements.length === 0 ? (
                <p className="text-slate-500 text-sm">No elements added yet.</p>
              ) : (
                <div className="space-y-2">
                  {elements.map(el => (
                    <div key={el.id} className={`flex items-center justify-between p-3 rounded-lg border ${selectedElement === el.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                      <span className="text-sm">
                        {el.type === 'text' && `Text: "${el.content.substring(0, 30)}..."`}
                        {el.type === 'field' && `${el.fieldType} field`}
                        {el.type === 'signature' && 'Signature'}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedElement(el.id)}>
                          <Move className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeElement(el.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Position controls for selected element */}
          {selectedElement && (
            <div className="bg-blue-50 rounded-xl p-4">
              <Label className="mb-2 block">Position Selected Element</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>X: {elements.find(e => e.id === selectedElement)?.x || 0}</Label>
                  <Slider 
                    value={[elements.find(e => e.id === selectedElement)?.x || 0]} 
                    onValueChange={([x]) => updateElementPosition(selectedElement, x, elements.find(e => e.id === selectedElement)?.y || 0)}
                    min={0} max={800} className="mt-2"
                  />
                </div>
                <div>
                  <Label>Y: {elements.find(e => e.id === selectedElement)?.y || 0}</Label>
                  <Slider 
                    value={[elements.find(e => e.id === selectedElement)?.y || 0]} 
                    onValueChange={([y]) => updateElementPosition(selectedElement, elements.find(e => e.id === selectedElement)?.x || 0, y)}
                    min={0} max={1200} className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Preview */}
          <div className="bg-slate-100 p-4 rounded-xl overflow-auto">
            <canvas 
              ref={previewRef} 
              onClick={handleCanvasClick}
              className="max-w-full h-auto mx-auto rounded-lg border cursor-pointer" 
              style={{ maxHeight: 500 }} 
            />
          </div>
          
          {/* Download buttons */}
          <div className="flex gap-2">
            <Button onClick={downloadPDF} className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <Download className="w-4 h-4 mr-2" /> Download as PDF
            </Button>
            <Button variant="outline" onClick={downloadImage}>
              <Download className="w-4 h-4 mr-2" /> Download as Image
            </Button>
            <ResetButton onReset={() => { setElements([]); setSelectedElement(null); }} />
          </div>
        </>
      )}
    </div>
  );
}