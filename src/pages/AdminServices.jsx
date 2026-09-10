import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminServices() {
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => dataLayer.services.getAll()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataLayer.services.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-services'])
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => dataLayer.services.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(['admin-services'])
  });

  const preferredGroups = ['Build', 'Scale', 'Create'];
  const groupNames = [
    ...preferredGroups.filter((group) => services.some((service) => service.service_group === group)),
    ...[...new Set(services.map((service) => service.service_group || 'Other'))]
      .filter((group) => !preferredGroups.includes(group))
      .sort()
  ];
  const defaultGroup = groupNames[0] || 'Other';

  const renderServices = (items) => (
    items.length === 0 ? (
      <p className="text-slate-500 text-center py-8">No services yet</p>
    ) : (
      <div className="space-y-4">
        {items.map(service => (
          <Card key={service.id} className={!service.is_active ? 'opacity-50' : ''}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{service.title}</h3>
                  {!service.is_active && <Badge variant="secondary">Inactive</Badge>}
                </div>
                <p className="text-sm text-slate-600 line-clamp-1">{service.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => toggleMutation.mutate({ id: service.id, is_active: !service.is_active })}>
                  {service.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Link to={createPageUrl(`AdminServiceEdit?id=${service.id}`)}><Button variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button></Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-600"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete Service?</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={() => deleteMutation.mutate(service.id)}>Delete</AlertDialogAction></AlertDialogFooter>
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
    <AdminLayout currentPage="AdminServices">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Services</h1>
            <p className="text-slate-600 mt-1">Manage service offerings</p>
          </div>
          <Link to={createPageUrl('AdminServiceEdit')}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Service</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <Tabs key={defaultGroup} defaultValue={defaultGroup}>
            <TabsList className="mb-6 h-auto flex-wrap justify-start">
              {groupNames.map((group) => (
                <TabsTrigger key={group} value={group}>{group} ({services.filter((service) => (service.service_group || 'Other') === group).length})</TabsTrigger>
              ))}
            </TabsList>
            {groupNames.map((group) => (
              <TabsContent key={group} value={group}>{renderServices(services.filter((service) => (service.service_group || 'Other') === group))}</TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}
