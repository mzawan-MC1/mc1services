import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminTeam() {
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['admin-team'],
    queryFn: () => dataLayer.team.getAll()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataLayer.team.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-team'])
  });

  return (
    <AdminLayout currentPage="AdminTeam">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Team Members</h1>
            <p className="text-slate-600 mt-1">Manage your team</p>
          </div>
          <Link to={createPageUrl('AdminTeamEdit')}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : members.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-500 mb-4">No team members yet</p>
              <Link to={createPageUrl('AdminTeamEdit')}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Team Member
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {members.map(member => (
              <Card key={member.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-slate-300" />
                  {member.image_url ? (
                    <img src={member.image_url} alt={member.name} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">{member.name?.[0]}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{member.name}</h3>
                    <p className="text-sm text-blue-600">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={createPageUrl(`AdminTeamEdit?id=${member.id}`)}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600" onClick={() => deleteMutation.mutate(member.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}