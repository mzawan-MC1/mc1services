import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Edit, CheckCircle2, Users, ListPlus, MessageSquare, Trash2 } from 'lucide-react'
import { dataLayer } from '../dataLayer'
import TaskProgressBar from './TaskProgressBar'
import AssigneeAvatarGroup from './AssigneeAvatarGroup'
import { toast } from 'sonner'

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

export default function TaskRow({ task, onAction, onChanged }) {
  const navigate = useNavigate()
  const completed = task.completed_subtasks || 0
  const total = task.total_subtasks || 0
  const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  // Dialog states
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'pending',
    priority: task.priority || 'normal',
    due_date: task.due_date || '',
  })

  const [statusOpen, setStatusOpen] = useState(false)
  const [newStatus, setNewStatus] = useState(task.status || 'pending')

  const [assigneesOpen, setAssigneesOpen] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [selectedAssignees, setSelectedAssignees] = useState([])

  const [subtaskOpen, setSubtaskOpen] = useState(false)
  const [usersLoaded, setUsersLoaded] = useState(false)
  const [subtaskForm, setSubtaskForm] = useState({
    title: '', description: '', priority: 'normal', assignee: '', due_date: '',
  })

  const [updateOpen, setUpdateOpen] = useState(false)
  const [updateText, setUpdateText] = useState('')

  const loadUsers = async () => {
    if (usersLoaded) return
    try {
      const u = await dataLayer.users.listAll()
      setAllUsers(u)
      setSelectedAssignees((task.assignees || []).map(a => a.user_id))
      setUsersLoaded(true)
    } catch (e) {
      console.error('[TaskRow.loadUsers] failed:', e)
    }
  }

  const handleSaveEdit = async () => {
    try {
      await dataLayer.tasks.update(task.id, {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
        priority: editForm.priority,
        due_date: editForm.due_date || null,
      })
      await dataLayer.taskTimeline.create({
        task_id: task.id,
        event_type: 'task_updated',
        payload: { fields: ['title', 'description', 'status', 'priority', 'due_date'] },
      })
      toast.success('Task updated')
      setEditOpen(false)
      onChanged?.()
    } catch (e) {
      console.error('[TaskRow.handleSaveEdit] failed:', e)
      toast.error(e.message || 'Failed to update task')
    }
  }

  const handleStatusChange = async () => {
    try {
      const prev = task.status
      await dataLayer.tasks.update(task.id, { status: newStatus })
      if (newStatus === 'in_progress' && prev !== 'in_progress') {
        await dataLayer.tasks.update(task.id, { started_at: new Date().toISOString() })
        await dataLayer.taskTimeline.create({ task_id: task.id, event_type: 'task_started', payload: {} })
      }
      await dataLayer.taskTimeline.create({
        task_id: task.id, event_type: 'status_changed',
        payload: { from: prev, to: newStatus },
      })
      toast.success('Status updated')
      setStatusOpen(false)
      onChanged?.()
    } catch (e) {
      console.error('[TaskRow.handleStatusChange] failed:', e)
      toast.error(e.message || 'Failed to update status')
    }
  }

  const handleAssigneesSave = async () => {
    try {
      const current = new Set((task.assignees || []).map(a => a.user_id))
      const next = new Set(selectedAssignees)
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
      toast.success('Assignees updated')
      setAssigneesOpen(false)
      onChanged?.()
    } catch (e) {
      console.error('[TaskRow.handleAssigneesSave] failed:', e)
      toast.error(e.message || 'Failed to update assignees')
    }
  }

  const handleCreateSubtask = async () => {
    if (!subtaskForm.title.trim()) return
    try {
      const payload = {
        task_id: task.id,
        title: subtaskForm.title,
        description: subtaskForm.description,
        status: 'pending',
        priority: subtaskForm.priority,
        assignee: subtaskForm.assignee || null,
        due_date: subtaskForm.due_date || null,
      }
      const created = await dataLayer.taskSubtasks.create(payload)
      await dataLayer.taskTimeline.create({
        task_id: task.id, event_type: 'subtask_created',
        payload: { id: created.id, ...payload },
      })
      toast.success('Subtask added')
      setSubtaskOpen(false)
      setSubtaskForm({ title: '', description: '', priority: 'normal', assignee: '', due_date: '' })
      onChanged?.()
    } catch (e) {
      console.error('[TaskRow.handleCreateSubtask] failed:', e)
      toast.error(e.message || 'Failed to add subtask')
    }
  }

  const handlePostUpdate = async () => {
    if (!updateText.trim()) return
    try {
      await dataLayer.taskTimeline.create({
        task_id: task.id, event_type: 'update', payload: { text: updateText },
      })
      toast.success('Update posted')
      setUpdateOpen(false)
      setUpdateText('')
      onChanged?.()
    } catch (e) {
      console.error('[TaskRow.handlePostUpdate] failed:', e)
      toast.error(e.message || 'Failed to post update')
    }
  }

  return (
    <>
      <div className={`grid grid-cols-12 items-center gap-2 py-2.5 px-3 border-b border-slate-100 hover:bg-slate-50 transition-colors group ${overdue ? 'bg-red-50/30' : ''} ${task.status === 'completed' ? 'bg-green-50/30' : ''}`}>
        {/* Task */}
        <div className="col-span-3 min-w-0 pr-1">
          <div
            className={`font-medium truncate cursor-pointer transition-colors ${task.status === 'completed' ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900 hover:text-blue-600'}`}
            onClick={() => navigate(`/admin/tasks/${task.id}`)}
          >
            {task.title}
          </div>
          {task.description && (
            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{task.description}</div>
          )}
        </div>

        {/* Status/Priority */}
        <div className="col-span-2 flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`${statusClass(task.status)} text-[11px] py-0.5 px-2 font-medium h-auto`}>
            {formatStatus(task.status)}
          </Badge>
          <Badge variant="outline" className={`${priorityClass(task.priority)} capitalize text-[11px] py-0.5 px-2 font-semibold h-auto`}>
            {task.priority || 'normal'}
          </Badge>
        </div>

        {/* Due */}
        <div className="col-span-1 text-xs min-w-[72px]">
          {task.due_date ? (
            <div className="flex flex-col">
              <span className={`font-semibold ${overdue ? 'text-red-600' : 'text-slate-700'}`}>
                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              {overdue && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700 bg-red-100/70 px-1.5 py-0.5 rounded w-fit mt-0.5 ring-1 ring-red-200">
                  <span className="h-1 w-1 rounded-full bg-red-600 inline-block" />
                  Overdue
                </span>
              )}
            </div>
          ) : <span className="text-slate-400 text-[11px]">—</span>}
        </div>

        {/* Assignees */}
        <div className="col-span-2 flex items-center">
          {task.assignees && task.assignees.length > 0 ? (
            <AssigneeAvatarGroup users={task.assignees} max={4} size="sm" />
          ) : (
            <span className="text-[11px] text-slate-400 font-medium italic px-1.5 py-0.5 bg-slate-50 rounded border border-slate-100">Unassigned</span>
          )}
        </div>

        {/* Progress - wider column with breathing room */}
        <div className="col-span-3 pr-6 pl-2">
          <TaskProgressBar completed={completed} total={total} status={task.status} compact />
        </div>

        {/* Actions - never touches progress */}
        <div className="col-span-1 flex items-center justify-end gap-1.5 pl-2 border-l border-slate-100/70 ml-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs font-medium shadow-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all"
            onClick={() => navigate(`/admin/tasks/${task.id}`)}
          >
            View
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5 shadow-lg border-slate-200">
              <DropdownMenuLabel className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5">Task Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                className="cursor-pointer rounded-md py-2 px-2 text-sm"
                onClick={() => { setEditForm({ title: task.title || '', description: task.description || '', status: task.status || 'pending', priority: task.priority || 'normal', due_date: task.due_date || '' }); setEditOpen(true) }}
              >
                <Edit className="h-4 w-4 mr-2 text-slate-500" /> Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-md py-2 px-2 text-sm"
                onClick={() => { setNewStatus(task.status || 'pending'); setStatusOpen(true) }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2 text-amber-600" /> Change Status
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-md py-2 px-2 text-sm"
                onClick={() => { loadUsers(); setAssigneesOpen(true) }}
              >
                <Users className="h-4 w-4 mr-2 text-blue-600" /> Manage Assignees
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-md py-2 px-2 text-sm"
                onClick={() => { loadUsers(); setSubtaskOpen(true) }}
              >
                <ListPlus className="h-4 w-4 mr-2 text-indigo-600" /> Add Subtask
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-md py-2 px-2 text-sm"
                onClick={() => setUpdateOpen(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2 text-purple-600" /> Add Update
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-md py-2 px-2 text-sm font-medium"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" /> Delete Task
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-slate-200 shadow-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900">Delete this task?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="pt-2">
                    <AlertDialogCancel className="border-slate-200">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                      onClick={() => onAction?.('Delete', task)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm(p => ({ ...p, status: v }))}>
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
                <Select value={editForm.priority} onValueChange={(v) => setEditForm(p => ({ ...p, priority: v }))}>
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
                <Input type="date" value={editForm.due_date} onChange={(e) => setEditForm(p => ({ ...p, due_date: e.target.value }))} className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white" onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
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
            <Button className="bg-blue-600 text-white" onClick={handleStatusChange}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Assignees Dialog */}
      <Dialog open={assigneesOpen} onOpenChange={setAssigneesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Manage Assignees</DialogTitle></DialogHeader>
          <div className="max-h-72 overflow-auto border rounded p-3 space-y-1">
            {allUsers.map(u => {
              const checked = selectedAssignees.includes(u.id)
              return (
                <label key={u.id} className="flex items-center gap-3 py-2 px-2 rounded hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setSelectedAssignees(prev =>
                        e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id)
                      )
                    }}
                  />
                  <span className="text-sm font-medium">{u.full_name || u.email}</span>
                  {u.email && <span className="text-xs text-slate-500">({u.email})</span>}
                </label>
              )
            })}
            {allUsers.length === 0 && <div className="text-sm text-slate-500">No users found</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssigneesOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white" onClick={handleAssigneesSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subtask Dialog */}
      <Dialog open={subtaskOpen} onOpenChange={setSubtaskOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Add Subtask</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={subtaskForm.title} onChange={(e) => setSubtaskForm(p => ({ ...p, title: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={subtaskForm.description} onChange={(e) => setSubtaskForm(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={subtaskForm.priority} onValueChange={(v) => setSubtaskForm(p => ({ ...p, priority: v }))}>
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
                <Select value={subtaskForm.assignee} onValueChange={(v) => setSubtaskForm(p => ({ ...p, assignee: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    {allUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={subtaskForm.due_date} onChange={(e) => setSubtaskForm(p => ({ ...p, due_date: e.target.value }))} className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubtaskOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white" onClick={handleCreateSubtask}>Add Subtask</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Update Dialog */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Add Update</DialogTitle></DialogHeader>
          <Textarea
            rows={4}
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            placeholder="Write an update or comment on this task..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white" onClick={handlePostUpdate}>Post Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
