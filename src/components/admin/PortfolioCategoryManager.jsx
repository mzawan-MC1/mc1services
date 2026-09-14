import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Tags, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { dataLayer } from '../dataLayer';
import { toPortfolioCategoryKey } from '../../config/portfolioCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function PortfolioCategoryManager({ categories = [], portfolios = [] }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState([]);
  const usedValues = useMemo(() => new Set(portfolios.map((project) => project.category).filter(Boolean)), [portfolios]);

  useEffect(() => {
    if (open) setDraft(categories.map((category) => ({ ...category })));
  }, [open, categories]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const normalized = draft.map((category, index) => ({
        ...category,
        value: toPortfolioCategoryKey(category.value),
        label: category.label.trim(),
        label_ar: category.label_ar.trim(),
        display_order: index
      }));
      if (!normalized.length) throw new Error('Add at least one category.');
      if (normalized.some((category) => !category.value || !category.label)) throw new Error('Every category needs an English label and key.');
      if (new Set(normalized.map((category) => category.value)).size !== normalized.length) throw new Error('Category keys must be unique.');
      if (!normalized.some((category) => category.is_active)) throw new Error('Keep at least one category active.');
      return dataLayer.portfolioCategories.save(normalized);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-categories'] });
      toast.success('Portfolio categories saved');
      setOpen(false);
    },
    onError: (error) => toast.error(error.message || 'Failed to save portfolio categories')
  });

  const updateCategory = (index, changes) => setDraft((current) => current.map((category, categoryIndex) => categoryIndex === index ? { ...category, ...changes } : category));
  const moveCategory = (index, direction) => setDraft((current) => {
    const destination = index + direction;
    if (destination < 0 || destination >= current.length) return current;
    const next = [...current];
    [next[index], next[destination]] = [next[destination], next[index]];
    return next;
  });
  const addCategory = () => {
    const existing = new Set(draft.map((category) => category.value));
    let suffix = draft.length + 1;
    let value = `new_category_${suffix}`;
    while (existing.has(value)) value = `new_category_${++suffix}`;
    setDraft((current) => [...current, { value, label: 'New Category', label_ar: '', is_active: true, display_order: current.length }]);
  };
  const removeCategory = (index) => {
    const category = draft[index];
    if (usedValues.has(category.value)) {
      toast.error('This category is assigned to a project. Make it inactive instead of deleting it.');
      return;
    }
    setDraft((current) => current.filter((_, categoryIndex) => categoryIndex !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline"><Tags className="mr-2 h-4 w-4" />Manage Categories</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Portfolio Categories</DialogTitle>
          <DialogDescription>Manage the single primary category list. Project Type, Industries and Related Services remain separate classifications.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {draft.map((category, index) => {
            const isUsed = usedValues.has(category.value);
            return (
              <div key={`${category.value}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.2fr_1fr_1fr_auto]">
                <div><Label>English Label</Label><Input className="mt-1 bg-white" value={category.label} onChange={(event) => updateCategory(index, { label: event.target.value })} /></div>
                <div dir="rtl"><Label>Arabic Label</Label><Input className="mt-1 bg-white" value={category.label_ar} onChange={(event) => updateCategory(index, { label_ar: event.target.value })} /></div>
                <div><Label>Category Key</Label><Input className="mt-1 bg-white" value={category.value} disabled={isUsed} onChange={(event) => updateCategory(index, { value: toPortfolioCategoryKey(event.target.value) })} /><p className="mt-1 text-[11px] text-slate-500">{isUsed ? 'Locked because projects use this key.' : 'Lowercase system identifier.'}</p></div>
                <div className="flex items-center gap-1 md:flex-col md:justify-center">
                  <label className="mr-2 flex items-center gap-2 text-xs font-medium md:mb-1 md:mr-0"><input type="checkbox" checked={category.is_active} onChange={(event) => updateCategory(index, { is_active: event.target.checked })} />Active</label>
                  <div className="flex gap-1"><Button type="button" size="icon" variant="ghost" disabled={index === 0} onClick={() => moveCategory(index, -1)}><ArrowUp className="h-4 w-4" /></Button><Button type="button" size="icon" variant="ghost" disabled={index === draft.length - 1} onClick={() => moveCategory(index, 1)}><ArrowDown className="h-4 w-4" /></Button><Button type="button" size="icon" variant="ghost" className="text-red-600" disabled={isUsed} onClick={() => removeCategory(index)}><Trash2 className="h-4 w-4" /></Button></div>
                </div>
              </div>
            );
          })}
          <Button type="button" variant="outline" onClick={addCategory}><Plus className="mr-2 h-4 w-4" />Add Category</Button>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>{saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Categories</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
