import { useCallback, useEffect, useState, useMemo } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import AdminRoute from '../components/AdminRoute'
import { useParams, useNavigate } from 'react-router-dom'
import { dataLayer } from '../components/dataLayer'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import FileUpload from '../components/FileUpload'
import TaskProgressBar from '../components/tasks/TaskProgressBar'
import AssigneeAvatarGroup from '../components/tasks/AssigneeAvatarGroup'
import { toast } from 'sonner'

import {
  ArrowLeft, MoreHorizontal, Edit, Trash2, Plus, Paperclip, Send,
  CheckCircle2, XCircle, Clock, User, Calendar, FileText, MessageSquare,
  Activity, FolderOpen, Download, Trash as TrashIcon, Pencil, Save, Flag, Check, ListPlus, Users, RotateCcw,
} from 'lucide-react'

// ===== Helpers =====

function statusClass(status) {
  switch ((status || '').toLowerCase()) {
    case 'completed': return 'bg-green-50 text-green-700 border-green-200 ring-1 ring-green-100'
    case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100'
    case 'cancelled': return 'bg-slate-100 text-slate-600 border-slate-200 ring-1 ring-slate-200'
    default: return 'bg-slate-50 text-slate-700 border-slate-200 ring-1 ring-slate-100'
  }
}

function priorityClass(priority) {
  switch ((priority || '').toLowerCase()) {
    case 'high': return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100'
    case 'normal': return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100'
    case 'low': return 'bg-slate-50 text-slate-600 border-slate-200 ring-1 ring-slate-100'
    default: return 'bg-slate-50 text-slate-600 border-slate-200 ring-1 ring-slate-100'
  }
}
function formatStatus(s) {
  if (!s) return ''
  return String(s).replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
}
function initials(n) {
  if (!n) return 'U'
  const p = String(n).trim().split(/\s+/)
  return (p[0]?.[0] || '') + (p[1]?.[0] || '')
}
function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return '—' }
}
function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '—' }
}
function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days < 30) return `${days}d ago`
  return formatDate(dateStr)
}
function getFileName(url) {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/')
    return decodeURIComponent(parts[parts.length - 1] || 'file')
  } catch {
    return url?.split('/').pop() || 'file'
  }
}
function isImage(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url || '')
}

// ===== Page =====

export default function AdminTaskDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [task, setTask] = useState(null)
  const [assignees, setAssignees] = useState([]) // [{user_id, full_name, email, avatar_url, ...}]
  const [users, setUsers] = useState([]) // all users for dropdowns
  const [subtasks, setSubtasks] = useState([])
  const [timeline, setTimeline] = useState([])

  const load = useCallback(async () => {
    try {
      const [t, a, s, tl] = await Promise.all([
        dataLayer.tasks.getById(id),
        dataLayer.taskAssignees.listByTask(id),
        dataLayer.taskSubtasks.listByTask(id),
        dataLayer.taskTimeline.listByTask(id),
      ])
      setTask(t)
      try {
        const allU = await dataLayer.users.listAll()
        setUsers(allU)
        const byId = Object.fromEntries(allU.map(u => [u.id, u]))
        setAssignees((a || []).map(x => ({ ...x, ...(byId[x.user_id] || {}) })))
      } catch (e) {
        console.error('[load] hydrate users failed:', e)
        setAssignees(a || [])
      }
      setSubtasks(s || [])
      setTimeline(tl || [])
    } catch (e) {
      console.error('[load] failed:', e)
      toast.error(e.message || 'Failed to load task')
    }
  }, [id])

  useEffect(() => { load() }, [load])

  // Derived
  const completedSubtasks = subtasks.filter(s => s.status === 'completed').length
  const totalSubtasks = subtasks.length
  const overdue = task?.due_date && new Date(task.due_date) < new Date() && task?.status !== 'completed'

  const usersById = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users])
  const createdByUser = task?.created_by ? usersById[task.created_by] : null

  // Collect files from timeline (task + subtask attachments)
  const files = useMemo(() => {
    const list = []
    for (const ev of timeline) {
      if (ev.event_type === 'attachment_added' && ev.payload?.url) {
        list.push({
          id: ev.id,
          url: ev.payload.url,
          title: ev.payload.title || null,
          uploaded_by_id: ev.actor_id,
          uploaded_by_name: ev.payload?.actor_name || usersById[ev.actor_id]?.full_name || 'User',
          uploaded_at: ev.created_at,
          source: 'Task',
          sourceId: task?.id,
          sourceTitle: task?.title || 'Task',
          delete_event_id: ev.id,
        })
      }
      if (ev.event_type === 'subtask_attachment' && ev.payload?.url) {
        const st = subtasks.find(s => s.id === ev.payload.id)
        list.push({
          id: ev.id,
          url: ev.payload.url,
          title: ev.payload.title || null,
          uploaded_by_id: ev.actor_id,
          uploaded_by_name: ev.payload?.actor_name || usersById[ev.actor_id]?.full_name || 'User',
          uploaded_at: ev.created_at,
          source: 'Subtask',
          sourceId: ev.payload.id,
          sourceTitle: st?.title || 'Subtask',
          delete_event_id: ev.id,
        })
      }
    }
    return list.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
  }, [timeline, usersById, subtasks, task?.id, task?.title])

  // Updates (conversation) - task-level updates + subtask comments
  const updates = useMemo(() => {
    const list = []
    for (const ev of timeline) {
      if (ev.event_type === 'update' && ev.payload?.text) {
        list.push({
          id: ev.id,
          kind: 'task',
          actor_id: ev.actor_id,
          actor_name: ev.payload?.actor_name || usersById[ev.actor_id]?.full_name || 'User',
          actor_email: ev.payload?.actor_email || usersById[ev.actor_id]?.email,
          avatar_url: usersById[ev.actor_id]?.avatar_url,
          text: ev.payload.text,
          created_at: ev.created_at,
          attachment_url: null,
          related_to: null,
          related_title: null,
        })
      }
      if (ev.event_type === 'subtask_comment' && ev.payload?.text) {
        const st = subtasks.find(s => s.id === ev.payload.id)
        list.push({
          id: ev.id,
          kind: 'subtask',
          actor_id: ev.actor_id,
          actor_name: ev.payload?.actor_name || usersById[ev.actor_id]?.full_name || 'User',
          actor_email: ev.payload?.actor_email || usersById[ev.actor_id]?.email,
          avatar_url: usersById[ev.actor_id]?.avatar_url,
          text: ev.payload.text,
          created_at: ev.created_at,
          attachment_url: null,
          related_to: ev.payload.id,
          related_title: st?.title || null,
        })
      }
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [timeline, usersById, subtasks])

  // Activity feed events
  const activityEvents = useMemo(() => formatActivity(timeline, usersById, subtasks), [timeline, usersById, subtasks])

  // ====== Quick edit handlers (Overview tab) ======
  const quickUpdate = async (patch, eventType, eventPayload = {}) => {
    try {
      await dataLayer.tasks.update(id, patch)
      if (eventType) {
        await dataLayer.taskTimeline.create({
          task_id: id, event_type: eventType, payload: eventPayload,
        })
      }
      toast.success('Updated')
      load()
    } catch (e) {
      console.error('[quickUpdate] failed:', e)
      toast.error(e.message || 'Update failed')
    }
  }

  const toggleAssignee = async (uid, checked) => {
    try {
      if (checked) {
        await dataLayer.taskAssignees.create(id, uid)
        await dataLayer.taskTimeline.create({
          task_id: id, event_type: 'assignee_added', payload: { user_id: uid },
        })
      } else {
        await dataLayer.taskAssignees.remove(id, uid)
        await dataLayer.taskTimeline.create({
          task_id: id, event_type: 'assignee_removed', payload: { user_id: uid },
        })
      }
      toast.success('Assignees updated')
      load()
    } catch (e) {
      console.error('[toggleAssignee] failed:', e)
      toast.error(e.message || 'Failed to update assignees')
    }
  }

  // ====== Composer (Updates tab) ======
  const [updateText, setUpdateText] = useState('')
  const [taskAttachTitle, setTaskAttachTitle] = useState('')
  const postUpdate = async () => {
    if (!updateText.trim()) return
    try {
      await dataLayer.taskTimeline.create({
        task_id: id, event_type: 'update', payload: { text: updateText },
      })
      setUpdateText('')
      toast.success('Update posted')
      load()
    } catch (e) {
      console.error('[postUpdate] failed:', e)
      toast.error(e.message || 'Failed to post update')
    }
  }
  const onTaskAttachment = async (url) => {
    try {
      await dataLayer.taskTimeline.create({
        task_id: id, event_type: 'attachment_added',
        payload: { url, title: taskAttachTitle || null },
      })
      setTaskAttachTitle('')
      toast.success('File attached')
      load()
    } catch (e) {
      console.error('[onTaskAttachment] failed:', e)
      toast.error(e.message || 'Failed to attach file')
    }
  }
  const onDeleteFile = async (file) => {
    try {
      await dataLayer.taskTimeline.deleteWithFile(file.delete_event_id || file.id)
      toast.success('File deleted')
      load()
    } catch (e) {
      console.error('[onDeleteFile] failed:', e)
      toast.error(e.message || 'Failed to delete file')
    }
  }

  if (!task) {
    return (
      <AdminRoute><AdminLayout currentPage="AdminTaskListPage">
        <div className="p-8 text-slate-500">Loading task...</div>
      </AdminLayout></AdminRoute>
    )
  }

  return (
    <AdminRoute>
      <AdminLayout currentPage="AdminTaskListPage">
        <div className="p-3 md:p-5 lg:p-8 space-y-5 max-w-[1400px] mx-auto">
          {/* Top nav */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/admin/tasks')} className="gap-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" /> Back to Tasks
            </Button>
            <div className="flex items-center gap-2">
              {task.status !== 'in_progress' && task.status !== 'completed' && (
                <Button
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm"
                  onClick={() => quickUpdate(
                    { status: 'in_progress', started_at: new Date().toISOString() },
                    'task_started',
                  )}
                >
                  <Clock className="h-4 w-4 mr-2" /> Start Task
                </Button>
              )}
              <TaskRowActionsMenu
                task={task}
                users={users}
                assignees={assignees}
                onChanged={load}
                onDeleted={() => navigate('/admin/tasks')}
              />
            </div>
          </div>

          {/* ====== HEADER: Task Summary ====== */}
          <Card className={`overflow-hidden shadow-sm border-slate-200 ${task.status === 'completed' ? 'ring-1 ring-green-200 bg-gradient-to-b from-green-50/40 to-white' : overdue ? 'ring-1 ring-red-200 bg-gradient-to-b from-red-50/30 to-white' : 'bg-gradient-to-b from-slate-50/60 to-white'}`}>
            <CardContent className="p-5 md:p-7 space-y-6">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Badge variant="outline" className={`${statusClass(task.status)} px-2.5 py-1 text-xs font-semibold rounded-md h-auto`}>
                        {formatStatus(task.status)}
                      </Badge>
                      <Badge variant="outline" className={`${priorityClass(task.priority)} capitalize px-2.5 py-1 text-xs font-semibold rounded-md h-auto`}>
                        {task.priority || 'normal'} Priority
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md h-auto ${
                          overdue
                            ? 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100'
                            : task.status === 'completed'
                              ? 'bg-green-50 text-green-700 border-green-200 ring-1 ring-green-100'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Calendar className="h-3 w-3 inline mr-1.5" />
                        {overdue ? 'Overdue ·' : task.status === 'completed' ? 'Completed ·' : 'Due ·'} {formatDate(task.due_date)}
                      </Badge>
                    </div>
                    <h1 className={`text-xl md:text-2xl font-bold leading-tight ${task.status === 'completed' ? 'text-slate-600' : 'text-slate-900'}`}>
                      {task.title}
                    </h1>
                  </div>
                </div>
                {task.description && (
                  <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed max-w-3xl">
                    {task.description}
                  </p>
                )}
              </div>

              <Separator className="border-slate-200/70" />

              {/* Summary grid: Progress + Assignees + Created by */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Progress block */}
                <div className="md:col-span-5 bg-slate-50/70 rounded-xl border border-slate-200/60 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Progress</div>
                    <div className="text-xs text-slate-500 font-medium">
                      {totalSubtasks > 0 ? `${completedSubtasks} of ${totalSubtasks} subtasks` : task.status === 'completed' ? 'Task complete' : task.status === 'in_progress' ? 'In progress' : 'Not started'}
                    </div>
                  </div>
                  <TaskProgressBar
                    completed={completedSubtasks}
                    total={totalSubtasks}
                    status={task.status}
                  />
                  {totalSubtasks > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-green-100/60 overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${completedSubtasks ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-green-700 whitespace-nowrap">{completedSubtasks} done · {totalSubtasks - completedSubtasks} left</span>
                    </div>
                  )}
                </div>

                {/* Assignees block */}
                <div className="md:col-span-4 bg-indigo-50/40 rounded-xl border border-indigo-100/70 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-indigo-700/80 uppercase tracking-wider font-bold">Assignees</div>
                    <div className="text-[11px] font-semibold text-indigo-600/80">{assignees.length} assigned</div>
                  </div>
                  <div className="flex items-center">
                    {assignees.length > 0 ? (
                      <AssigneeAvatarGroup
                        users={assignees.map(a => ({
                          user_id: a.user_id,
                          full_name: a.full_name,
                          email: a.email,
                          avatar_url: a.avatar_url,
                        }))}
                        max={6}
                        size="lg"
                      />
                    ) : (
                      <span className="text-sm text-slate-400 italic">Unassigned — click Overview to add assignees</span>
                    )}
                  </div>
                </div>

                {/* Meta block */}
                <div className="md:col-span-3 bg-white rounded-xl border border-slate-200/70 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3">Task Info</div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-slate-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Created by</div>
                        <div className="font-semibold text-slate-700 truncate">
                          {createdByUser?.full_name || createdByUser?.email || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3 w-3 text-slate-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Created</div>
                        <div className="font-semibold text-slate-700 truncate">{formatDateTime(task.created_at)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="h-6 w-6 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Activity className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Last activity</div>
                        <div className="font-semibold text-slate-700 truncate">
                          {timeAgo(task.last_activity || task.updated_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ====== TABS ====== */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl mb-6">
              <TabsTrigger value="overview" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Overview</TabsTrigger>
              <TabsTrigger value="subtasks" className="gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Subtasks <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{totalSubtasks}</Badge></TabsTrigger>
              <TabsTrigger value="updates" className="gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Updates <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{updates.length}</Badge></TabsTrigger>
              <TabsTrigger value="files" className="gap-1.5"><FolderOpen className="h-3.5 w-3.5" /> Files <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{files.length}</Badge></TabsTrigger>
              <TabsTrigger value="activity" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Activity</TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview">
              <OverviewTab
                task={task}
                assignees={assignees}
                users={users}
                subtasks={subtasks}
                completedSubtasks={completedSubtasks}
                totalSubtasks={totalSubtasks}
                overdue={overdue}
                onQuickUpdate={quickUpdate}
                onToggleAssignee={toggleAssignee}
              />
            </TabsContent>

            {/* SUBTASKS */}
            <TabsContent value="subtasks">
              <SubtasksTab
                subtasks={subtasks}
                users={users}
                taskId={id}
                onChanged={load}
                files={files.filter(f => f.source === 'Subtask')}
              />
            </TabsContent>

            {/* UPDATES */}
            <TabsContent value="updates">
              <UpdatesTab
                updates={updates}
                updateText={updateText}
                setUpdateText={setUpdateText}
                onPost={postUpdate}
                taskAttachTitle={taskAttachTitle}
                setTaskAttachTitle={setTaskAttachTitle}
                onAttachment={onTaskAttachment}
              />
            </TabsContent>

            {/* FILES */}
            <TabsContent value="files">
              <FilesTab
                files={files}
                taskAttachTitle={taskAttachTitle}
                setTaskAttachTitle={setTaskAttachTitle}
                onAttachment={onTaskAttachment}
                onChanged={load}
                onDeleteFile={onDeleteFile}
              />
            </TabsContent>

            {/* ACTIVITY */}
            <TabsContent value="activity">
              <ActivityTab events={activityEvents} />
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminRoute>
  )
}

// ====== Activity formatter ======
function formatActivity(timeline, usersById, subtasks) {
  const stById = Object.fromEntries((subtasks || []).map(s => [s.id, s]))
  return (timeline || [])
    .map(ev => {
      const actorName = ev.payload?.actor_name || usersById[ev.actor_id]?.full_name || 'User'
      const avatarUrl = usersById[ev.actor_id]?.avatar_url
      let icon = Activity
      let color = 'text-slate-500 bg-slate-100'
      let title = actorName
      let detail = ev.event_type
      let meta = null
      switch (ev.event_type) {
        case 'task_created':
          icon = FileText; color = 'text-blue-600 bg-blue-100'
          detail = 'created this task'
          break
        case 'task_updated':
          icon = Pencil; color = 'text-slate-600 bg-slate-100'
          detail = 'updated task details'
          break
        case 'task_started':
          icon = Clock; color = 'text-yellow-600 bg-yellow-100'
          detail = 'started the task'
          break
        case 'status_changed': {
          icon = CheckCircle2
          const to = ev.payload?.to || ''
          if (to === 'completed') color = 'text-green-600 bg-green-100'
          else if (to === 'in_progress') color = 'text-yellow-600 bg-yellow-100'
          else color = 'text-slate-500 bg-slate-100'
          detail = `changed status from ${formatStatus(ev.payload?.from)} to ${formatStatus(to)}`
          break
        }
        case 'assignee_added': {
          icon = User; color = 'text-indigo-600 bg-indigo-100'
          const added = usersById[ev.payload?.user_id]
          detail = `assigned ${added?.full_name || added?.email || 'a user'}`
          break
        }
        case 'assignee_removed': {
          icon = User; color = 'text-slate-500 bg-slate-100'
          const rem = usersById[ev.payload?.user_id]
          detail = `removed ${rem?.full_name || rem?.email || 'a user'} from assignees`
          break
        }
        case 'subtask_created':
          icon = Plus; color = 'text-blue-600 bg-blue-100'
          detail = `created subtask: ${ev.payload?.title || 'New subtask'}`
          meta = stById[ev.payload?.id] ? null : null
          break
        case 'subtask_updated':
          icon = Pencil; color = 'text-slate-600 bg-slate-100'
          detail = `updated subtask: ${stById[ev.payload?.id]?.title || 'a subtask'}`
          break
        case 'subtask_started':
          icon = Clock; color = 'text-yellow-600 bg-yellow-100'
          detail = `started subtask: ${stById[ev.payload?.id]?.title || 'a subtask'}`
          break
        case 'subtask_completed':
          icon = CheckCircle2; color = 'text-green-600 bg-green-100'
          detail = `completed subtask: ${stById[ev.payload?.id]?.title || 'a subtask'}`
          break
        case 'subtask_reopened':
          icon = Activity; color = 'text-yellow-600 bg-yellow-100'
          detail = `reopened subtask: ${stById[ev.payload?.id]?.title || 'a subtask'}`
          break
        case 'subtask_deleted':
          icon = Trash2; color = 'text-red-600 bg-red-100'
          detail = 'deleted a subtask'
          break
        case 'subtask_comment':
          icon = MessageSquare; color = 'text-purple-600 bg-purple-100'
          detail = `commented on subtask: ${stById[ev.payload?.id]?.title || 'a subtask'}`
          meta = <p className="text-sm text-slate-600 mt-1">{ev.payload?.text}</p>
          break
        case 'update':
          icon = MessageSquare; color = 'text-blue-600 bg-blue-100'
          detail = 'posted an update'
          meta = <p className="text-sm text-slate-600 mt-1">{ev.payload?.text}</p>
          break
        case 'attachment_added':
          icon = Paperclip; color = 'text-emerald-600 bg-emerald-100'
          detail = 'attached a file to the task'
          break
        case 'subtask_attachment':
          icon = Paperclip; color = 'text-emerald-600 bg-emerald-100'
          detail = `attached a file to subtask: ${stById[ev.payload?.id]?.title || 'a subtask'}`
          break
        case 'task_deleted':
          icon = Trash2; color = 'text-red-600 bg-red-100'
          detail = 'deleted this task'
          break
        default:
          icon = Activity
          detail = ev.event_type.replace(/_/g, ' ')
      }
      return {
        id: ev.id,
        created_at: ev.created_at,
        actorName,
        avatarUrl,
        icon,
        color,
        title,
        detail,
        meta,
      }
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

// ====== Overview Tab ======
function OverviewTab({ task, assignees, users, subtasks, completedSubtasks, totalSubtasks, overdue, onQuickUpdate, onToggleAssignee }) {
  const [editField, setEditField] = useState(null) // 'title' | 'description' | null
  const [draft, setDraft] = useState({})

  const saveTitleDesc = async () => {
    const patch = {}
    if (draft.title !== undefined) patch.title = draft.title
    if (draft.description !== undefined) patch.description = draft.description
    if (Object.keys(patch).length === 0) { setEditField(null); return }
    await onQuickUpdate(patch, 'task_updated', { fields: Object.keys(patch) })
    setEditField(null)
    setDraft({})
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left: main info */}
      <div className="lg:col-span-2 space-y-5">
        <Card className={`shadow-sm border-slate-200 ${task.status === 'completed' ? 'bg-green-50/40 border-green-200/70' : 'bg-white'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                <FileText className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">Description</CardTitle>
            </div>
            {editField !== null ? (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setEditField(null); setDraft({}) }} className="text-slate-600 hover:text-slate-900 h-8">Cancel</Button>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm h-8" onClick={saveTitleDesc}>
                  <Save className="h-3.5 w-3.5 mr-1.5" /> Save
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => { setEditField('both'); setDraft({ title: task.title, description: task.description || '' }) }} className="gap-1 h-8 text-slate-500 hover:text-slate-900">
                <Edit className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editField !== null ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</Label>
                  <Input value={draft.title || ''} onChange={(e) => setDraft(p => ({ ...p, title: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</Label>
                  <Textarea rows={5} value={draft.description || ''} onChange={(e) => setDraft(p => ({ ...p, description: e.target.value }))} className="mt-1" />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <h2 className="text-lg font-semibold text-slate-900 leading-snug">{task.title}</h2>
                <div className="rounded-lg bg-white/80 border border-slate-200/60 p-4">
                  <p className="text-[14.5px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {task.description || <span className="text-slate-400 italic">No description provided — click Edit to add one.</span>}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-gradient-to-b from-white to-slate-50/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${completedSubtasks === totalSubtasks && totalSubtasks > 0 ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-700'}`}>
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Subtask Summary</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {totalSubtasks === 0 ? 'No subtasks added yet' : `${completedSubtasks}/${totalSubtasks} complete · ${Math.round(totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0)}%`}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-white border border-slate-200/70 p-3.5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="text-slate-600 flex items-center gap-2">
                  <span className="font-bold text-[18px] text-slate-900 leading-none">{completedSubtasks}</span>
                  <span className="text-slate-400 font-medium">/</span>
                  <span className="font-bold text-[18px] text-slate-900 leading-none">{totalSubtasks}</span>
                  <span className="ml-1 text-slate-500">subtasks completed</span>
                </div>
                <Badge className={`text-xs px-2 py-1 rounded-md h-auto ${completedSubtasks === totalSubtasks && totalSubtasks > 0 ? 'bg-green-500 text-white hover:bg-green-500 shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-100'}`}>
                  {totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0}%
                </Badge>
              </div>
              <TaskProgressBar completed={completedSubtasks} total={totalSubtasks} status={task.status} showText={false} />
            </div>

            {subtasks.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {subtasks.slice(0, 8).map(st => {
                  const isDone = st.status === 'completed'
                  const isProgress = st.status === 'in_progress'
                  return (
                    <div
                      key={st.id}
                      className={`flex items-center gap-3 py-2 px-3 rounded-lg border transition-all ${
                        isDone
                          ? 'bg-green-50/70 border-green-100 hover:bg-green-50'
                          : isProgress
                            ? 'bg-amber-50/40 border-amber-100 hover:bg-amber-50'
                            : 'bg-white border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isDone
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-green-500 shadow-sm shadow-green-200'
                          : isProgress
                            ? 'bg-gradient-to-br from-amber-400 to-orange-400 border-amber-400 shadow-sm shadow-amber-100'
                            : 'border-slate-300 bg-white'
                      }`}>
                        {isDone && <Check className="h-3 w-3 text-white font-bold" strokeWidth={3} />}
                        {isProgress && <Clock className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[13px] truncate font-medium ${
                          isDone ? 'text-slate-500 line-through decoration-slate-400/70' :
                          isProgress ? 'text-amber-900' : 'text-slate-700'
                        }`}>
                          {st.title}
                        </div>
                      </div>
                      <Badge variant="outline" className={`${statusClass(st.status)} text-[10px] px-1.5 py-0.5 h-auto rounded font-semibold`}>
                        {formatStatus(st.status)}
                      </Badge>
                    </div>
                  )
                })}
                {subtasks.length > 8 && <div className="text-xs text-slate-400 text-center py-2.5 font-medium">+ {subtasks.length - 8} more subtasks — see Subtasks tab</div>}
              </div>
            )}
            {subtasks.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-lg bg-white/60">
                <div className="text-slate-300 mb-1.5"><ListPlus className="h-6 w-6 mx-auto" /></div>
                No subtasks yet — head to the Subtasks tab to add some.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: Quick info cards */}
      <div className="space-y-5">
        {/* Status */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-md flex items-center justify-center ${
                task.status === 'completed' ? 'bg-green-100 text-green-700' :
                task.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
              }`}>
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="text-sm font-semibold">Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              value={task.status || 'pending'}
              onValueChange={(v) => {
                const from = task.status
                const patch = { status: v }
                if (v === 'in_progress' && from !== 'in_progress') patch.started_at = new Date().toISOString()
                onQuickUpdate(patch, 'status_changed', { from, to: v })
              }}
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Priority */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-md flex items-center justify-center ${
                (task.priority || 'normal') === 'high' ? 'bg-red-100 text-red-700' :
                (task.priority || 'normal') === 'normal' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
              }`}>
                <Flag className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="text-sm font-semibold">Priority</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              value={task.priority || 'normal'}
              onValueChange={(v) => onQuickUpdate({ priority: v }, 'task_updated', { fields: ['priority'] })}
            >
              <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Due date */}
        <Card className={`shadow-sm border-slate-200 ${overdue ? 'ring-1 ring-red-200 bg-gradient-to-b from-red-50/30 to-white' : ''}`}>
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-md flex items-center justify-center ${
                overdue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
              }`}>
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="text-sm font-semibold">Due Date</CardTitle>
            </div>
            {overdue && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 text-[10px] h-5 px-2 rounded-md">Overdue</Badge>}
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={task.due_date ? task.due_date.slice(0, 10) : ''}
              onChange={(e) => onQuickUpdate(
                { due_date: e.target.value || null },
                'task_updated',
                { fields: ['due_date'] },
              )}
              className="border-slate-200"
            />
          </CardContent>
        </Card>

        {/* Assignees */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Users className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="text-sm font-semibold">Assignees ({assignees.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-56 overflow-auto pr-1 -mr-1">
              {users.map(u => {
                const checked = !!assignees.find(a => a.user_id === u.id)
                return (
                  <label key={u.id} className={`flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-slate-50 cursor-pointer transition-colors ${checked ? 'bg-indigo-50/60 ring-1 ring-indigo-100' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => onToggleAssignee(u.id, e.target.checked)}
                      className="accent-indigo-600"
                    />
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={u.avatar_url} />
                      <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold">{initials(u.full_name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-700 truncate">{u.full_name || u.email}</span>
                  </label>
                )
              })}
              {users.length === 0 && <div className="text-xs text-slate-500">No users</div>}
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card className="shadow-sm border-slate-200 bg-gradient-to-b from-white to-slate-50/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="text-sm font-semibold">Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 text-xs font-medium">Created</span>
              <span className="font-semibold text-slate-700 text-[13px]">{formatDateTime(task.created_at)}</span>
            </div>
            <Separator className="border-slate-100" />
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 text-xs font-medium">Updated</span>
              <span className="font-semibold text-slate-700 text-[13px]">{formatDateTime(task.updated_at)}</span>
            </div>
            <Separator className="border-slate-100" />
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 text-xs font-medium">Last activity</span>
              <span className="font-semibold text-slate-700 text-[13px]">{formatDateTime(task.last_activity || task.updated_at)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ====== Subtasks Tab ======
function SubtasksTab({ subtasks, users, taskId, onChanged, files }) {
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'normal', assignee: '', due_date: '' })
  const [commentFor, setCommentFor] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [editFor, setEditFor] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [subAttachTitle, setSubAttachTitle] = useState('')
  const [attachFor, setAttachFor] = useState(null)

  const createSubtask = async () => {
    if (!form.title.trim()) return
    try {
      const payload = {
        task_id: taskId, title: form.title, description: form.description,
        status: 'pending', priority: form.priority,
        assignee: form.assignee || null, due_date: form.due_date || null,
      }
      const created = await dataLayer.taskSubtasks.create(payload)
      await dataLayer.taskTimeline.create({
        task_id: taskId, event_type: 'subtask_created',
        payload: { id: created.id, ...payload },
      })
      toast.success('Subtask added')
      setAddOpen(false)
      setForm({ title: '', description: '', priority: 'normal', assignee: '', due_date: '' })
      onChanged()
    } catch (e) {
      console.error('[SubtasksTab.createSubtask] failed:', e)
      toast.error(e.message || 'Failed to add subtask')
    }
  }

  const quickToggleDone = async (st) => {
    const done = st.status !== 'completed'
    try {
      await dataLayer.taskSubtasks.update(st.id, { status: done ? 'completed' : 'in_progress' })
      await dataLayer.taskTimeline.create({
        task_id: taskId,
        event_type: done ? 'subtask_completed' : 'subtask_reopened',
        payload: { id: st.id },
      })
      toast.success(done ? 'Marked done' : 'Reopened')
      onChanged()
    } catch (e) {
      console.error('[SubtasksTab.quickToggleDone] failed:', e)
      toast.error(e.message || 'Failed to update subtask')
    }
  }

  const quickStatus = async (st, newStatus) => {
    try {
      const prev = st.status
      await dataLayer.taskSubtasks.update(st.id, { status: newStatus })
      if (newStatus === 'in_progress' && prev !== 'in_progress') {
        await dataLayer.taskTimeline.create({
          task_id: taskId, event_type: 'subtask_started', payload: { id: st.id },
        })
      }
      await dataLayer.taskTimeline.create({
        task_id: taskId, event_type: 'subtask_updated', payload: { id: st.id },
      })
      onChanged()
    } catch (e) {
      console.error('[SubtasksTab.quickStatus] failed:', e)
      toast.error(e.message || 'Failed to update status')
    }
  }

  const saveEdit = async () => {
    try {
      await dataLayer.taskSubtasks.update(editFor, {
        title: editForm.title, description: editForm.description,
        priority: editForm.priority, assignee: editForm.assignee || null,
        due_date: editForm.due_date || null,
      })
      await dataLayer.taskTimeline.create({
        task_id: taskId, event_type: 'subtask_updated', payload: { id: editFor },
      })
      setEditFor(null); onChanged(); toast.success('Saved')
    } catch (e) {
      console.error('[SubtasksTab.saveEdit] failed:', e)
      toast.error(e.message || 'Failed to save')
    }
  }

  const deleteSubtask = async (sid) => {
    try {
      await dataLayer.taskTimeline.create({
        task_id: taskId, event_type: 'subtask_deleted', payload: { id: sid },
      })
      await dataLayer.taskSubtasks.delete(sid)
      toast.success('Deleted')
      onChanged()
    } catch (e) {
      console.error('[SubtasksTab.deleteSubtask] failed:', e)
      toast.error(e.message || 'Failed to delete')
    }
  }

  const postSubComment = async () => {
    if (!commentText.trim() || !commentFor) return
    try {
      await dataLayer.taskTimeline.create({
        task_id: taskId, event_type: 'subtask_comment',
        payload: { id: commentFor, text: commentText },
      })
      setCommentFor(null); setCommentText(''); onChanged(); toast.success('Posted')
    } catch (e) {
      console.error('[SubtasksTab.postSubComment] failed:', e)
      toast.error(e.message || 'Failed to post comment')
    }
  }

  const stFilesById = useMemo(() => {
    const m = {}
    for (const f of files) { (m[f.sourceId] ||= []).push(f) }
    return m
  }, [files])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">
              <span className="text-lg font-bold leading-none">{subtasks.length}</span> subtasks
            </div>
            {subtasks.length > 0 && (
              <div className="text-[11px] text-slate-500 mt-0.5">
                {subtasks.filter(s => s.status === 'completed').length} done · {subtasks.filter(s => s.status === 'in_progress').length} in progress · {subtasks.filter(s => s.status === 'pending').length} pending
              </div>
            )}
          </div>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" /> Add Subtask
        </Button>
      </div>

      <Card className="overflow-hidden shadow-sm border-slate-200">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-2 py-3 px-4 border-b border-slate-200/70 bg-gradient-to-r from-slate-50/90 to-slate-50/50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          <div className="col-span-4 pl-1">Subtask</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-1">Due</div>
          <div className="col-span-1">Files</div>
          <div className="col-span-2 text-right pr-1">Actions</div>
        </div>

        <div className="divide-y divide-slate-100">
          {subtasks.length === 0 ? (
            <div className="py-16 text-center bg-gradient-to-b from-white to-slate-50/40">
              <div className="text-slate-200 mb-3">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                  <ListPlus className="h-8 w-8 text-slate-400" />
                </div>
              </div>
              <div className="text-slate-600 font-semibold">No subtasks yet</div>
              <div className="text-slate-400 text-sm mt-1">Click <span className="font-semibold text-indigo-600">Add Subtask</span> to break this task down</div>
            </div>
          ) : (
            subtasks.map(st => {
              const stFiles = stFilesById[st.id] || []
              const isDone = st.status === 'completed'
              const isProgress = st.status === 'in_progress'
              const isCancelled = st.status === 'cancelled'
              const overdueSub = !!(st.due_date && new Date(st.due_date) < new Date() && st.status !== 'completed')
              if (editFor === st.id) {
                return (
                  <div key={st.id} className="py-4 px-4 bg-blue-50/40 border-b border-blue-100/50">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                      <div className="md:col-span-4 space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title</Label>
                        <Input value={editForm.title || ''} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} className="border-slate-300" />
                      </div>
                      <div className="md:col-span-4 space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</Label>
                        <Input value={editForm.description || ''} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} className="border-slate-300" />
                      </div>
                      <div className="md:col-span-1 space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority</Label>
                        <Select value={editForm.priority || 'normal'} onValueChange={(v) => setEditForm(p => ({ ...p, priority: v }))}>
                          <SelectTrigger className="h-9 border-slate-300"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assignee</Label>
                        <Select value={editForm.assignee || ''} onValueChange={(v) => setEditForm(p => ({ ...p, assignee: v }))}>
                          <SelectTrigger className="h-9 border-slate-300"><SelectValue placeholder="None" /></SelectTrigger>
                          <SelectContent>
                            {users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-1 space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Due</Label>
                        <Input type="date" value={editForm.due_date || ''} onChange={(e) => setEditForm(p => ({ ...p, due_date: e.target.value }))} className="border-slate-300 h-9" />
                      </div>
                      <div className="md:col-span-2 flex gap-1.5 justify-end pt-1 md:pt-0">
                        <Button variant="outline" size="sm" onClick={() => setEditFor(null)} className="h-9 border-slate-300 text-slate-600">Cancel</Button>
                        <Button size="sm" className="h-9 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm" onClick={saveEdit}>Save</Button>
                      </div>
                    </div>
                  </div>
                )
              }
              return (
                <div
                  key={st.id}
                  className={`py-3 px-3 md:px-4 grid grid-cols-1 md:grid-cols-12 gap-2 items-center transition-all group ${
                    isDone ? 'bg-green-50/60 hover:bg-green-50/80' :
                    isCancelled ? 'bg-slate-100/50 hover:bg-slate-100' :
                    isProgress ? 'bg-amber-50/30 hover:bg-amber-50/60' :
                    overdueSub ? 'bg-red-50/20 hover:bg-red-50/40' :
                    'bg-white hover:bg-slate-50/70'
                  }`}
                >
                  {/* Subtask name + desc */}
                  <div className="md:col-span-4 min-w-0">
                    <div className="flex items-start gap-2.5">
                      <button
                        className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isDone
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.12)]'
                            : isCancelled
                              ? 'bg-slate-200 border-slate-300'
                              : 'border-slate-300 hover:border-indigo-500 hover:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] bg-white'
                        }`}
                        onClick={() => quickToggleDone(st)}
                        title={isDone ? 'Reopen subtask' : 'Mark subtask done'}
                        disabled={isCancelled}
                      >
                        {isDone && <Check className="h-3 w-3 text-white font-bold" strokeWidth={3.5} />}
                        {isCancelled && <XCircle className="h-3 w-3 text-slate-500" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-semibold truncate ${
                          isDone ? 'text-slate-500 line-through decoration-slate-400/70' :
                          isCancelled ? 'text-slate-400 line-through' :
                          'text-slate-800'
                        }`}>
                          {st.title}
                        </div>
                        {st.description && (
                          <div className="text-[11.5px] text-slate-500 truncate mt-0.5 leading-relaxed">{st.description}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status (quick select) */}
                  <div className="md:col-span-1">
                    <div className="md:hidden inline-flex mr-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</div>
                    <Select
                      value={st.status || 'pending'}
                      onValueChange={(v) => quickStatus(st, v)}
                    >
                      <SelectTrigger className={`h-8 text-[11.5px] font-medium ${
                        isDone ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' :
                        isProgress ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' :
                        isCancelled ? 'bg-slate-50 border-slate-200 text-slate-500' :
                        'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="md:col-span-1">
                    <div className="md:hidden inline-flex mr-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority:</div>
                    <Badge variant="outline" className={`${priorityClass(st.priority)} capitalize text-[11px] py-0.5 px-2 h-auto font-semibold rounded-md`}>
                      {st.priority || 'normal'}
                    </Badge>
                  </div>

                  {/* Assignee — AVATAR ONLY (tooltip shows name) */}
                  <div className="md:col-span-2">
                    {st.assignee ? (
                      users[st.assignee] ? (
                        <AssigneeAvatarGroup users={[{
                          user_id: st.assignee,
                          full_name: users[st.assignee].full_name,
                          email: users[st.assignee].email,
                          avatar_url: users[st.assignee].avatar_url,
                        }]} max={1} size="sm" />
                      ) : (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold">?</AvatarFallback>
                        </Avatar>
                      )
                    ) : <span className="text-[11px] text-slate-400 italic">—</span>}
                  </div>

                  {/* Due */}
                  <div className="md:col-span-1">
                    <div className="md:hidden inline-flex mr-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due:</div>
                    {st.due_date ? (
                      <div className="flex flex-col">
                        <span className={`text-[12px] font-semibold ${overdueSub ? 'text-red-600' : 'text-slate-700'}`}>
                          {formatDate(st.due_date)}
                        </span>
                        {overdueSub && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700 bg-red-100/70 px-1.5 py-0.5 rounded w-fit ring-1 ring-red-200">
                            <span className="h-1 w-1 rounded-full bg-red-600 inline-block" />
                            Overdue
                          </span>
                        )}
                      </div>
                    ) : <span className="text-[11px] text-slate-400 italic">—</span>}
                  </div>

                  {/* Files */}
                  <div className="md:col-span-1">
                    {stFiles.length > 0 ? (
                      <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md font-medium">
                        <Paperclip className="h-3.5 w-3.5 text-slate-500" /> {stFiles.length}
                      </div>
                    ) : <span className="text-[11px] text-slate-400 italic">—</span>}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex items-center justify-end gap-1 pt-1 md:pt-0 pl-4 md:pl-0 border-t md:border-t-0 border-slate-100 mt-2 md:mt-0">
                    {/* Mark Done/Reopen primary action */}
                    {!isCancelled && (
                      <Button
                        size="sm"
                        onClick={() => quickToggleDone(st)}
                        className={`h-8 px-2.5 text-xs font-semibold transition-all gap-1.5 ${
                          isDone
                            ? 'bg-white border border-green-200 text-green-700 hover:bg-green-50'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm'
                        }`}
                      >
                        {isDone ? (<><RotateCcw className="h-3.5 w-3.5" /> Reopen</>) : (<><Check className="h-3.5 w-3.5" /> Done</>)}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                      onClick={() => { setCommentFor(st.id); setCommentText('') }}
                      title="Add comment"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-1.5 shadow-lg border-slate-200">
                        <DropdownMenuLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">Subtask Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem
                          className="cursor-pointer rounded-md py-2 px-2 text-sm"
                          onClick={() => {
                            setEditFor(st.id)
                            setEditForm({
                              title: st.title || '', description: st.description || '',
                              priority: st.priority || 'normal', assignee: st.assignee || '',
                              due_date: st.due_date ? st.due_date.slice(0, 10) : '',
                            })
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2 text-slate-500" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer rounded-md py-2 px-2 text-sm"
                          onClick={() => { setAttachFor(st.id); setSubAttachTitle('') }}
                        >
                          <Paperclip className="h-4 w-4 mr-2 text-indigo-600" /> Attach File
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-md py-2 px-2 text-sm font-semibold"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4 mr-2 text-red-500" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="border-slate-200 shadow-xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this subtask?</AlertDialogTitle>
                              <p className="text-sm text-slate-500 pt-2">The subtask &quot;<strong>{st.title}</strong>&quot; will be permanently deleted.</p>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="pt-2">
                              <AlertDialogCancel className="border-slate-200">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                                onClick={() => deleteSubtask(st.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                {/* Subtask attachment row (inline, scoped to this st) */}
                {attachFor === st.id && (
                  <div className="md:col-span-12 mt-0.5 ml-0 md:ml-8 p-3 border border-indigo-100 rounded-lg bg-indigo-50/30 space-y-2">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attach file to this subtask</Label>
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <Input
                        placeholder="File title (optional)"
                        value={subAttachTitle}
                        onChange={(e) => setSubAttachTitle(e.target.value)}
                        className="sm:max-w-xs border-slate-300 text-sm h-9"
                      />
                      <FileUpload
                        compact
                        onUploadComplete={async (url) => {
                          try {
                            await dataLayer.taskTimeline.create({
                              task_id: taskId, event_type: 'subtask_attachment',
                              payload: { id: st.id, url, title: subAttachTitle || null },
                            })
                            setAttachFor(null); setSubAttachTitle('')
                            toast.success('File attached'); onChanged()
                          } catch (e) {
                            console.error('[SubtasksTab.subtaskAttachment] failed:', e)
                            toast.error(e.message || 'Failed to attach file')
                          }
                        }}
                      />
                      <Button variant="ghost" size="sm" onClick={() => setAttachFor(null)} className="h-9 text-slate-600 border border-slate-200">Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Subtask files preview (inline, scoped to this st) */}
                {stFiles.length > 0 && editFor !== st.id && (
                  <div className="md:col-span-12 mt-0.5 ml-0 md:ml-8 flex flex-wrap gap-2">
                    {stFiles.slice(0, 4).map(f => (
                      <a key={f.id} href={f.url} target="_blank" rel="noreferrer" className="block group">
                        {isImage(f.url) ? (
                          <img src={f.url} alt={f.title || getFileName(f.url)} className="h-14 w-20 object-cover rounded border border-slate-200 group-hover:ring-2 ring-indigo-400 transition shadow-sm" />
                        ) : (
                          <div className="h-14 w-20 rounded border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center group-hover:ring-2 ring-indigo-400 transition shadow-sm">
                            <Paperclip className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                      </a>
                    ))}
                    {stFiles.length > 4 && (
                      <div className="h-14 w-20 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-semibold text-slate-500 shadow-sm">
                        +{stFiles.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
              )
            })
          )}
        </div>
      </Card>

      {/* Add Subtask Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Add Subtask</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1" placeholder="Subtask title" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assignee</Label>
                <Select value={form.assignee} onValueChange={(v) => setForm(p => ({ ...p, assignee: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm(p => ({ ...p, due_date: e.target.value }))} className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white" onClick={createSubtask}>Add Subtask</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subtask Comment Dialog */}
      <Dialog open={!!commentFor} onOpenChange={(o) => { if (!o) setCommentFor(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Add Comment</DialogTitle></DialogHeader>
          <Textarea rows={4} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment on this subtask..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentFor(null)}>Cancel</Button>
            <Button className="bg-blue-600 text-white" onClick={postSubComment}>Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ====== Updates Tab ======
function UpdatesTab({ updates, updateText, setUpdateText, onPost, taskAttachTitle, setTaskAttachTitle, onAttachment }) {
  return (
    <div className="space-y-5">
      {/* Composer */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Textarea
            rows={3}
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            placeholder="Write an update about this task..."
            className="resize-none"
          />
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <Input
                placeholder="File title (optional)"
                value={taskAttachTitle}
                onChange={(e) => setTaskAttachTitle(e.target.value)}
                className="sm:max-w-xs"
              />
              <div className="flex items-center gap-2">
                <FileUpload compact onUploadComplete={onAttachment} />
                <span className="text-xs text-slate-500">Attach file</span>
              </div>
            </div>
            <Button onClick={onPost} className="bg-blue-600 text-white gap-1.5 self-end sm:self-auto">
              <Send className="h-3.5 w-3.5" /> Post Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      <div className="space-y-3">
        {updates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <div className="text-slate-500 font-medium">No updates yet</div>
              <div className="text-slate-400 text-sm mt-1">Post the first update to start the conversation</div>
            </CardContent>
          </Card>
        ) : (
          updates.map(u => (
            <Card key={u.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={u.avatar_url} />
                    <AvatarFallback className="text-xs">{initials(u.actor_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold text-slate-900 text-sm">{u.actor_name}</span>
                      {u.kind === 'subtask' && u.related_title && (
                        <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 px-1.5 py-0">
                          on: {u.related_title}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400" title={formatDateTime(u.created_at)}>
                        {timeAgo(u.created_at)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {u.text}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// ====== Files Tab ======
function FilesTab({ files, taskAttachTitle, setTaskAttachTitle, onAttachment, onChanged, onDeleteFile }) {
  return (
    <div className="space-y-4">
      {/* Upload */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <Label className="text-sm">Add attachment to task</Label>
              <Input
                placeholder="File title (optional)"
                value={taskAttachTitle}
                onChange={(e) => setTaskAttachTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <FileUpload onUploadComplete={onAttachment} />
              <Button variant="outline" onClick={onChanged}>
                <RefreshCwAlias className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="h-4 w-4" /> All Attachments
            <Badge variant="secondary" className="ml-1">{files.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="py-14 text-center">
              <FolderOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <div className="text-slate-500 font-medium">No files attached yet</div>
              <div className="text-slate-400 text-sm mt-1">Use the upload area above to attach files</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {files.map(f => (
                <div key={f.id} className="group border rounded-lg overflow-hidden hover:shadow-sm transition">
                  <a href={f.url} target="_blank" rel="noreferrer" className="block">
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      {isImage(f.url) ? (
                        <img src={f.url} alt={f.title || getFileName(f.url)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="h-10 w-10 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </a>
                  <div className="p-3 space-y-2">
                    <div className="font-medium text-sm text-slate-800 truncate" title={f.title || getFileName(f.url)}>
                      {f.title || getFileName(f.url)}
                    </div>
                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center justify-between">
                        <span>Uploaded by</span>
                        <span className="font-medium text-slate-600 truncate max-w-[50%]">{f.uploaded_by_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Date</span>
                        <span className="font-medium text-slate-600">{formatDate(f.uploaded_at)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Attached to</span>
                        <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-600">
                          {f.source}
                        </Badge>
                      </div>
                      <div className="text-slate-400 truncate" title={f.sourceTitle}>{f.sourceTitle}</div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between pt-1">
                      <a href={f.url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Download className="h-3.5 w-3.5" /> View
                        </Button>
                      </a>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1 h-8"
                            onClick={(e) => e.preventDefault()}
                          >
                            <TrashIcon className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this attachment?</AlertDialogTitle>
                            <p className="text-sm text-slate-500 pt-2">
                              The file <strong>{f.title || getFileName(f.url)}</strong> will be permanently removed from storage and the attachment record deleted. This action cannot be undone.
                            </p>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => onDeleteFile && onDeleteFile(f)}
                            >
                              Delete Permanently
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function RefreshCwAlias(props) { return <Clock {...props} /> }

// ====== Activity Tab ======
function ActivityTab({ events }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" /> Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {events.length === 0 ? (
          <div className="py-14 text-center">
            <Activity className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <div className="text-slate-500 font-medium">No activity yet</div>
          </div>
        ) : (
          <div className="relative pl-8 pr-4 py-4">
            <div className="absolute left-[22px] top-4 bottom-4 w-px bg-slate-200" />
            <div className="space-y-5">
              {events.map(ev => {
                const Icon = ev.icon
                return (
                  <div key={ev.id} className="relative">
                    <div className={`absolute -left-5 mt-0.5 h-7 w-7 rounded-full ${ev.color} flex items-center justify-center ring-4 ring-white`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="pt-0.5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-semibold text-sm text-slate-900">{ev.actorName}</span>
                        <span className="text-sm text-slate-600">{ev.detail}</span>
                      </div>
                      {ev.meta}
                      <div className="text-xs text-slate-400 mt-1" title={formatDateTime(ev.created_at)}>
                        {timeAgo(ev.created_at)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ====== Row-level actions menu (top-right of task details) ======
function TaskRowActionsMenu({ task, users, assignees, onChanged, onDeleted }) {
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [statusOpen, setStatusOpen] = useState(false)
  const [newStatus, setNewStatus] = useState(task?.status || 'pending')
  const [assigneesOpen, setAssigneesOpen] = useState(false)
  const [selected, setSelected] = useState([])

  const loadAssignees = () => setSelected((assignees || []).map(a => a.user_id))

  const saveEdit = async () => {
    try {
      await dataLayer.tasks.update(task.id, editForm)
      await dataLayer.taskTimeline.create({
        task_id: task.id, event_type: 'task_updated',
        payload: { fields: Object.keys(editForm) },
      })
      toast.success('Saved'); setEditOpen(false); onChanged()
    } catch (e) {
      console.error('[ActionsMenu.saveEdit] failed:', e)
      toast.error(e.message || 'Failed to save')
    }
  }

  const saveStatus = async () => {
    try {
      const patch = { status: newStatus }
      if (newStatus === 'in_progress' && task.status !== 'in_progress') {
        patch.started_at = new Date().toISOString()
      }
      await dataLayer.tasks.update(task.id, patch)
      await dataLayer.taskTimeline.create({
        task_id: task.id, event_type: 'status_changed',
        payload: { from: task.status, to: newStatus },
      })
      toast.success('Status updated'); setStatusOpen(false); onChanged()
    } catch (e) {
      console.error('[ActionsMenu.saveStatus] failed:', e)
      toast.error(e.message || 'Failed to update status')
    }
  }

  const saveAssignees = async () => {
    try {
      const current = new Set((assignees || []).map(a => a.user_id))
      const next = new Set(selected)
      for (const uid of next) {
        if (!current.has(uid)) {
          await dataLayer.taskAssignees.create(task.id, uid)
          await dataLayer.taskTimeline.create({
            task_id: task.id, event_type: 'assignee_added', payload: { user_id: uid },
          })
        }
      }
      for (const uid of current) {
        if (!next.has(uid)) {
          await dataLayer.taskAssignees.remove(task.id, uid)
          await dataLayer.taskTimeline.create({
            task_id: task.id, event_type: 'assignee_removed', payload: { user_id: uid },
          })
        }
      }
      toast.success('Updated'); setAssigneesOpen(false); onChanged()
    } catch (e) {
      console.error('[ActionsMenu.saveAssignees] failed:', e)
      toast.error(e.message || 'Failed to update')
    }
  }

  const handleDelete = async () => {
    try {
      await dataLayer.taskTimeline.create({
        task_id: task.id, event_type: 'task_deleted', payload: {},
      })
      await dataLayer.tasks.deleteWithFiles(task.id)
      toast.success('Task deleted')
      onDeleted()
    } catch (e) {
      console.error('[ActionsMenu.handleDelete] failed:', e)
      toast.error(e.message || 'Failed to delete task')
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <MoreHorizontal className="h-4 w-4" /> Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              setEditForm({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'pending',
                priority: task.priority || 'normal',
                due_date: task.due_date ? task.due_date.slice(0, 10) : '',
              })
              setEditOpen(true)
            }}
          >
            <Edit className="h-4 w-4 mr-2" /> Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => { setNewStatus(task.status || 'pending'); setStatusOpen(true) }}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" /> Change Status
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => { loadAssignees(); setAssigneesOpen(true) }}
          >
            <UsersAlias className="h-4 w-4 mr-2" /> Manage Assignees
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Task
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this task?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={editForm.title || ''} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={editForm.description || ''} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} className="mt-1" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={editForm.status || 'pending'} onValueChange={(v) => setEditForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={editForm.priority || 'normal'} onValueChange={(v) => setEditForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={editForm.due_date || ''} onChange={(e) => setEditForm(p => ({ ...p, due_date: e.target.value }))} className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white" onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Change Status</DialogTitle></DialogHeader>
          <div className="py-2">
            <Label>New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white" onClick={saveStatus}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignees */}
      <Dialog open={assigneesOpen} onOpenChange={setAssigneesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Manage Assignees</DialogTitle></DialogHeader>
          <div className="max-h-72 overflow-auto border rounded p-2 space-y-1">
            {users.map(u => {
              const checked = selected.includes(u.id)
              return (
                <label key={u.id} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setSelected(prev =>
                        e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id)
                      )
                    }}
                  />
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={u.avatar_url} />
                    <AvatarFallback className="text-[10px]">{initials(u.full_name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{u.full_name || u.email}</span>
                </label>
              )
            })}
            {users.length === 0 && <div className="text-sm text-slate-500">No users</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssigneesOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white" onClick={saveAssignees}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function UsersAlias(props) { return <User {...props} /> }
