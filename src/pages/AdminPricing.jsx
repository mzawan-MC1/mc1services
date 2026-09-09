import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminPricing() {
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: () => dataLayer.pricingPlans.getAll()
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingPlan) {
        await dataLayer.pricingPlans.update(editingPlan.id, data);
      } else {
        await dataLayer.pricingPlans.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-plans']);
      setIsDialogOpen(false);
      setEditingPlan(null);
      toast.success('Pricing plan saved');
    },
    onError: () => toast.error('Failed to save plan')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataLayer.pricingPlans.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-plans']);
      toast.success('Plan deleted');
    },
    onError: () => toast.error('Failed to delete plan')
  });

  const devPlans = plans.filter(p => p.category === 'development');
  const mktPlans = plans.filter(p => p.category === 'marketing');

  const renderPlans = (items) => (
    items.length === 0 ? (
      <p className="text-slate-500 text-center py-8">No pricing plans yet</p>
    ) : (
      <div className="grid md:grid-cols-3 gap-6">
        {items.map(plan => (
          <Card key={plan.id} className={plan.is_popular ? 'ring-2 ring-blue-500' : ''}>
            <CardContent className="p-6">
              {plan.is_popular && <Badge className="bg-blue-500 mb-2">Popular</Badge>}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-3xl font-bold text-slate-900">{plan.price}<span className="text-sm text-slate-500 font-normal">{plan.billing_period}</span></p>
              {plan.description && <p className="text-slate-600 text-sm mt-2">{plan.description}</p>}
              <ul className="mt-4 space-y-2">
                {plan.features?.map((f, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />{f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 mt-4">
                <Link to={createPageUrl(`AdminPricingEdit?id=${plan.id}`)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-slate-700 border-slate-300 hover:bg-slate-100"><Pencil className="w-4 h-4 mr-1" />Edit</Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600" onClick={() => deleteMutation.mutate(plan.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  );

  return (
    <AdminLayout currentPage="AdminPricing">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pricing Plans</h1>
            <p className="text-slate-600 mt-1">Manage pricing for development & marketing</p>
          </div>
          <Link to={createPageUrl('AdminPricingEdit')}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Plan</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <Tabs defaultValue="development">
            <TabsList className="mb-6">
              <TabsTrigger value="development">Development ({devPlans.length})</TabsTrigger>
              <TabsTrigger value="marketing">Marketing ({mktPlans.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="development">{renderPlans(devPlans)}</TabsContent>
            <TabsContent value="marketing">{renderPlans(mktPlans)}</TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}