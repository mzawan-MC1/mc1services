import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, RotateCcw, Save, Facebook, MessageCircle, Mail, Twitter } from 'lucide-react';
import { toast } from 'sonner';

// Copy to clipboard button
export function CopyButton({ value, label = 'Copy' }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {label}
    </Button>
  );
}

// Reset form button
export function ResetButton({ onReset, label = 'Reset' }) {
  return (
    <Button variant="outline" size="sm" onClick={onReset} className="gap-1">
      <RotateCcw className="w-3 h-3" />
      {label}
    </Button>
  );
}

// Save preferences button
export function SavePrefsButton({ toolId, values, label = 'Save Defaults' }) {
  const handleSave = () => {
    const prefs = JSON.parse(localStorage.getItem('uaeToolsPrefs') || '{}');
    prefs[toolId] = values;
    localStorage.setItem('uaeToolsPrefs', JSON.stringify(prefs));
    toast.success('Preferences saved!');
  };

  return (
    <Button variant="outline" size="sm" onClick={handleSave} className="gap-1">
      <Save className="w-3 h-3" />
      {label}
    </Button>
  );
}

// Load saved preferences
export function loadPrefs(toolId) {
  try {
    const prefs = JSON.parse(localStorage.getItem('uaeToolsPrefs') || '{}');
    return prefs[toolId] || null;
  } catch {
    return null;
  }
}

// Result card with copy button
export function ResultCard({ label, value, color = 'bg-slate-50', textColor = 'text-slate-600', showCopy = true }) {
  return (
    <div className={`${color} rounded-xl p-4 text-center relative group`}>
      <p className={`text-sm ${textColor} mb-1`}>{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {showCopy && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton value={value.toString().replace(/[^\d.-]/g, '')} label="" />
        </div>
      )}
    </div>
  );
}

// Tool action bar with reset & save
export function ToolActions({ onReset, toolId, values }) {
  return (
    <div className="flex gap-2 justify-end pt-4 border-t">
      <ResetButton onReset={onReset} />
      <SavePrefsButton toolId={toolId} values={values} />
    </div>
  );
}

// Quick share buttons (inline version)
export function ShareButtons({ toolId, toolName, results = null, inputs = null }) {
  const [copied, setCopied] = useState(false);

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

  const formatResults = () => {
    if (!results) return '';
    if (typeof results === 'string') return results;
    if (typeof results === 'object') {
      return Object.entries(results).map(([key, value]) => `${key}: ${value}`).join('\n');
    }
    return String(results);
  };

  const shareText = `Check out this ${toolName}! ${results ? '\nResults:\n' + formatResults() : ''}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`Check out this ${toolName}`);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={copyLink} title="Copy Link" className="h-8 w-8">
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={shareWhatsApp} title="WhatsApp" className="h-8 w-8">
        <MessageCircle className="w-4 h-4 text-green-600" />
      </Button>
      <Button variant="ghost" size="icon" onClick={shareFacebook} title="Facebook" className="h-8 w-8">
        <Facebook className="w-4 h-4 text-blue-600" />
      </Button>
      <Button variant="ghost" size="icon" onClick={shareTwitter} title="Twitter" className="h-8 w-8">
        <Twitter className="w-4 h-4 text-sky-500" />
      </Button>
      <Button variant="ghost" size="icon" onClick={shareEmail} title="Email" className="h-8 w-8">
        <Mail className="w-4 h-4 text-slate-600" />
      </Button>
    </div>
  );
}
