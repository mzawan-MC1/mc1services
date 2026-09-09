import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { ArrowLeft, Loader2, Mail, Phone, Building2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const serviceLabels = {
  web_development: 'Web Development',
  app_development: 'App Development',
  digital_marketing: 'Digital Marketing',
  production: 'Production',
  it_services: 'IT Services',
  other: 'Other'
};

const statusColors = {
  new: 'bg-orange-100 text-orange-700',
  contacted: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-green-100 text-green-700'
};

export default function AdminContacts() {
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState(null);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: () => dataLayer.contactSubmissions.getAll()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => dataLayer.contactSubmissions.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(['admin-contacts'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataLayer.contactSubmissions.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-contacts'])
  });

  return (
    <AdminLayout currentPage="AdminContacts">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Contact Submissions</h1>
          <p className="text-slate-600 mt-1">Manage incoming inquiries</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : contacts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-500">No contact submissions yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {contacts.map(contact => (
              <Card key={contact.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{contact.name}</h3>
                        <Badge className={statusColors[contact.status || 'new']}>
                          {contact.status || 'new'}
                        </Badge>
                        {contact.service_interest && (
                          <Badge variant="outline">
                            {serviceLabels[contact.service_interest] || contact.service_interest}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-blue-600">
                          <Mail className="w-4 h-4" />
                          {contact.email}
                        </a>
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                            <Phone className="w-4 h-4" />
                            {contact.phone}
                          </a>
                        )}
                        {contact.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {contact.company}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-2">
                        {contact.created_date && format(new Date(contact.created_date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={contact.status || 'new'}
                        onValueChange={(status) => updateMutation.mutate({ id: contact.id, status })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedContact(contact)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Submission?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600" onClick={() => deleteMutation.mutate(contact.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Contact Details</DialogTitle>
            </DialogHeader>
            {selectedContact && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <a href={`mailto:${selectedContact.email}`} className="font-medium text-blue-600">
                    {selectedContact.email}
                  </a>
                </div>
                {selectedContact.phone && (
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{selectedContact.phone}</p>
                  </div>
                )}
                {selectedContact.company && (
                  <div>
                    <p className="text-sm text-slate-500">Company</p>
                    <p className="font-medium">{selectedContact.company}</p>
                  </div>
                )}
                {selectedContact.service_interest && (
                  <div>
                    <p className="text-sm text-slate-500">Service Interest</p>
                    <p className="font-medium">{serviceLabels[selectedContact.service_interest]}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-500">Message</p>
                  <p className="font-medium whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Submitted</p>
                  <p className="font-medium">
                    {selectedContact.created_date && format(new Date(selectedContact.created_date), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}