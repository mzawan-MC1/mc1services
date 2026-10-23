import React from 'react';

// Minimal, safe markdown-to-React renderer for blog content.
// Supports: ## / ### headings, - and 1. lists, > quotes, --- rules,
// **bold**, *italic*, `code`, [text](url). Raw HTML is never injected —
// everything renders as React nodes, so stored content cannot XSS.

const renderInline = (text, keyPrefix) => {
  const tokens = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) tokens.push(text.slice(last, match.index));
    const tok = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (tok.startsWith('**')) tokens.push(<strong key={key} className="font-semibold text-slate-900">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('*')) tokens.push(<em key={key}>{tok.slice(1, -1)}</em>);
    else if (tok.startsWith('`')) tokens.push(<code key={key} className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] text-blue-700">{tok.slice(1, -1)}</code>);
    else {
      const m = tok.match(/\[([^\]]+)\]\(([^)]+)\)/);
      const href = m[2].startsWith('http') || m[2].startsWith('/') || m[2].startsWith('#') ? m[2] : '#';
      tokens.push(<a key={key} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-700">{m[1]}</a>);
    }
    last = match.index + tok.length;
  }
  if (last < text.length) tokens.push(text.slice(last));
  return tokens;
};

export function renderMarkdown(content) {
  if (!content) return null;
  const blocks = content.replace(/\r\n/g, '\n').split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, bi) => {
    const key = `b-${bi}`;
    if (block.startsWith('### ')) return <h3 key={key} className="mt-8 text-xl font-bold text-slate-900">{renderInline(block.slice(4), key)}</h3>;
    if (block.startsWith('## ')) return <h2 key={key} className="mt-10 text-2xl font-bold text-slate-900 md:text-3xl">{renderInline(block.slice(3), key)}</h2>;
    if (block === '---') return <hr key={key} className="my-10 border-slate-200" />;
    if (block.startsWith('> ')) return <blockquote key={key} className="my-6 border-l-4 border-blue-500 bg-blue-50 px-5 py-4 text-lg italic text-slate-700">{renderInline(block.replace(/^> ?/gm, ''), key)}</blockquote>;
    const lines = block.split('\n');
    if (lines.every((l) => /^[-*] /.test(l))) {
      return <ul key={key} className="my-5 list-disc space-y-2 pl-6 text-slate-600">{lines.map((l, li) => <li key={li} className="leading-relaxed">{renderInline(l.slice(2), `${key}-${li}`)}</li>)}</ul>;
    }
    if (lines.every((l) => /^\d+\. /.test(l))) {
      return <ol key={key} className="my-5 list-decimal space-y-2 pl-6 text-slate-600">{lines.map((l, li) => <li key={li} className="leading-relaxed">{renderInline(l.replace(/^\d+\. /, ''), `${key}-${li}`)}</li>)}</ol>;
    }
    return <p key={key} className="my-5 leading-8 text-slate-600">{renderInline(block.replace(/\n/g, ' '), key)}</p>;
  });
}

export const readingTimeMinutes = (content) => {
  const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

export const slugify = (text) => (text || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');
