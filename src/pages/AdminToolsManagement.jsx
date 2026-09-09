import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GripVertical, Save, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import AdminLayout from '../components/admin/AdminLayout';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const categories = [
  { id: 'marketing', name: 'Digital Marketing & Ad Tools' },
  { id: 'creative', name: 'Creative & Productivity Tools' },
  { id: 'finance', name: 'UAE Life & Finance Tools' },
  { id: 'uae', name: 'UAE Residents Tools' },
  { id: 'visitor', name: 'Dubai & Abu Dhabi Visitor Tools' },
];

export default function AdminToolsManagement() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('marketing');

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['admin-tools'],
    queryFn: () => dataLayer.tools.getAll()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => dataLayer.tools.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-tools']);
      toast.success('Tool updated!');
    }
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (toolsToUpdate) => {
      await Promise.all(
        toolsToUpdate.map(({ id, data }) => 
          dataLayer.tools.update(id, data)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-tools']);
      toast.success('Tools reordered!');
    }
  });

  const categoryTools = tools
    .filter(t => t.category === activeCategory)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const toggleVisibility = (tool) => {
    updateMutation.mutate({
      id: tool.id,
      data: { is_visible: !tool.is_visible }
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(categoryTools);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updates = reordered.map((tool, index) => ({
      id: tool.id,
      data: { order: index }
    }));

    bulkUpdateMutation.mutate(updates);
  };

  const visibleCount = categoryTools.filter(t => t.is_visible).length;

  if (isLoading) {
    return (
      <AdminLayout currentPage="AdminToolsManagement">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="AdminToolsManagement">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Tools Visibility Control</h1>
          <p className="text-slate-600 mt-1">Show/hide tools and manage display order</p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
              <span className="ml-2 text-xs opacity-75">
                ({tools.filter(t => t.category === cat.id && t.is_visible).length}/{tools.filter(t => t.category === cat.id).length})
              </span>
            </button>
          ))}
        </div>

        {/* Tools List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="capitalize">{activeCategory} Tools</CardTitle>
              <div className="text-sm text-slate-600">
                {visibleCount} of {categoryTools.length} visible on frontend
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {categoryTools.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>No tools in this category yet.</p>
                <p className="text-sm mt-2">Tools will be auto-created when you visit the Tools page.</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="tools">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {categoryTools.map((tool, index) => (
                        <Draggable key={tool.id} draggableId={tool.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                                snapshot.isDragging
                                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                                  : tool.is_visible
                                  ? 'border-slate-200 bg-white'
                                  : 'border-slate-200 bg-slate-50 opacity-60'
                              }`}
                            >
                              {/* Drag Handle */}
                              <div {...provided.dragHandleProps} className="cursor-move text-slate-400 hover:text-slate-600">
                                <GripVertical className="w-5 h-5" />
                              </div>

                              {/* Tool Info */}
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">{tool.title}</h3>
                                <p className="text-sm text-slate-600">{tool.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-slate-500">ID: {tool.tool_id}</span>
                                  <span className="text-xs text-slate-400">•</span>
                                  <span className="text-xs text-slate-500">Order: {tool.order || 0}</span>
                                </div>
                              </div>

                              {/* Visibility Toggle */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleVisibility(tool)}
                                  disabled={updateMutation.isPending}
                                  className={`p-2 rounded-lg transition-all border-2 ${
                                    tool.is_visible
                                      ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300'
                                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                                  } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
                                  title={tool.is_visible ? 'Hide from frontend' : 'Show on frontend'}
                                >
                                  {tool.is_visible ? (
                                    <Eye className="w-5 h-5" />
                                  ) : (
                                    <EyeOff className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Toggle the switch to show/hide tools on the frontend</li>
            <li>• Drag and drop to reorder tools (order applies on frontend)</li>
            <li>• Hidden tools (switch OFF) will NOT appear on the public Tools page</li>
            <li>• Changes take effect immediately - no page reload needed</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}