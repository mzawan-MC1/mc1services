import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Facebook, MessageCircle, Mail, Link2, Copy, Check, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ShareTool({ toolId, toolName, results = null, inputs = null }) {
  const [copied, setCopied] = useState(false);
  
  // Build share URL with inputs
  const buildShareUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('tool', toolId);
    if (inputs) {
      Object.entries(inputs).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.set(key, String(value));
        }
      });
    }
    return `${baseUrl}?${params.toString()}`;
  };
  
  const shareUrl = buildShareUrl();
  
  // Format results for text sharing
  const formatResults = () => {
    if (!results) return '';
    if (typeof results === 'string') return results;
    if (typeof results === 'object') {
      return Object.entries(results)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }
    return String(results);
  };
  
  const shareText = `Check out this ${toolName} tool! ${results ? '\n\nResults:\n' + formatResults() : ''}`;
  
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  
  const copyResults = () => {
    const text = `${toolName}\n\n${formatResults()}\n\n${shareUrl}`;
    navigator.clipboard.writeText(text);
    toast.success('Results copied!');
  };
  
  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_blank');
  };
  
  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
  };
  
  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  
  const shareEmail = () => {
    const subject = encodeURIComponent(`Check out this ${toolName} tool`);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {toolName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Share URL */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Share Link</label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="text-sm" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Social Share Buttons */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Share via</label>
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" onClick={shareWhatsApp} className="flex flex-col items-center gap-1 h-auto py-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              <Button variant="outline" onClick={shareFacebook} className="flex flex-col items-center gap-1 h-auto py-3">
                <Facebook className="w-5 h-5 text-blue-600" />
                <span className="text-xs">Facebook</span>
              </Button>
              <Button variant="outline" onClick={shareTwitter} className="flex flex-col items-center gap-1 h-auto py-3">
                <Twitter className="w-5 h-5 text-sky-500" />
                <span className="text-xs">Twitter</span>
              </Button>
              <Button variant="outline" onClick={shareEmail} className="flex flex-col items-center gap-1 h-auto py-3">
                <Mail className="w-5 h-5 text-slate-600" />
                <span className="text-xs">Email</span>
              </Button>
            </div>
          </div>
          
          {/* Copy Results */}
          {results && (
            <Button onClick={copyResults} className="w-full">
              <Copy className="w-4 h-4 mr-2" />
              Copy Results with Link
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}