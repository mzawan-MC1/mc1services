import { useEffect, useState } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import AdminRoute from '../components/AdminRoute'
import { dataLayer } from '../components/dataLayer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import TaskRow from '../components/tasks/TaskRow'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Search, RefreshCw } from 'lucide-react'

export default function AdminTaskListPage() {
  const [tasks, setTasks] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', status: 'pending', priority: 'normal', due_date: '' })
  const [users, setUsers] = useState([])
  const [assignees, setAssignees] = useState([])

  const load = async () => {
    try {
      const rows = await dataLayer.tasks.getListWithStats()
      setTasks(rows)
    } catch (e) {
      console.error('[AdminTaskListPage.load] failed:', e)
      toast.error(e.message || 'Failed to load tasks')
    }
  }

  useEffect(() => {
    load()
    ;(async () => {
      try { setUsers(await dataLayer.users.listAll()) } catch (_) { /* ignore */ }
    })()
  }, [])

  const filtered = tasks.filter(t => {
    const q = query.trim().toLowerCase()
    if (q && !(t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))) return false
    if (status !== 'all' && t.status !== status) return false
    if (priority !== 'all' && (t.priority || 'normal') !== priority) return false
    return true
  })

  // Stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length

  return (
    <AdminRoute>
      <AdminLayout currentPage="AdminTaskListPage">
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
              <p className="text-slate-600 mt-1">Track progress, assign work, and keep projects on schedule</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={load} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
              <Button onClick={() => setAddOpen(true)} className="bg-blue-600 text-white gap-2">
                <Plus className="h-4 w-4" /> New Task
              </Button>
            </div>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-slate-500">Total Tasks</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{totalTasks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-slate-500">In Progress</div>
                <div className="text-2xl font-bold text-yellow-600 mt-1">{inProgressTasks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-slate-500">Completed</div>
                <div className="text-2xl font-bold text-green-600 mt-1">{completedTasks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-slate-500">Overdue</div>
                <div className="text-2xl font-bold text-red-600 mt-1">{overdueTasks}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search tasks by title or description"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task List Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Task List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table header - matches TaskRow columns */}
              <div className="grid grid-cols-12 items-center gap-3 py-3 px-4 border-b bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <div className="col-span-3">Task</div>
                <div className="col-span-2">Status / Priority</div>
                <div className="col-span-1">Due</div>
                <div className="col-span-2">Assignees</div>
                <div className="col-span-3 pr-4">Progress</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {filtered.length > 0 ? (
                <div>
                  {filtered.map(t => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      onChanged={load}
                      onAction={async (action, task) => {
                        if (action === 'Delete') {
                          try {
                            await dataLayer.taskTimeline.create({
                              task_id: task.id,
                              event_type: 'task_deleted',
                              payload: {},
                            })
                            await dataLayer.tasks.deleteWithFiles(task.id)
                            toast.success('Task deleted')
                            load()
                          } catch (e) {
                            console.error('[AdminTaskListPage.onAction.Delete] failed:', e)
                            toast.error(e.message || 'Failed to delete task')
                          }
                        }
                        if (action === 'Start') {
                          try {
                            await dataLayer.tasks.update(task.id, {
                              status: 'in_progress',
                              started_at: new Date().toISOString(),
                            })
                            await dataLayer.taskTimeline.create({
                              task_id: task.id,
                              event_type: 'task_started',
                              payload: {},
                            })
                            toast.success('Task started')
                            load()
                          } catch (e) {
                            console.error('[AdminTaskListPage.onAction.Start] failed:', e)
                            toast.error(e.message || 'Failed to start task')
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="text-slate-400 mb-2">📋</div>
                  <div className="text-slate-500 font-medium">No tasks found</div>
                  <div className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create Task Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                  className="mt-1"
                  placeholder="What needs to be done?"
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  className="mt-1"
                  rows={4}
                  placeholder="Add more details about this task..."
                />
              </div>
              <div>
                <Label>Assignees</Label>
                <div className="mt-2 border rounded-lg p-3 max-h-56 overflow-auto space-y-1">
                  {users.map(u => (
                    <label key={u.id} className="flex items-center gap-3 py-2 px-2 rounded hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignees.includes(u.id)}
                        onChange={(e) => {
                          setAssignees(prev =>
                            e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id)
                          )
                        }}
                      />
                      <span className="text-sm font-medium">{u.full_name || u.email}</span>
                      {u.email && (u.full_name !== u.email) && (
                        <span className="text-xs text-slate-500">({u.email})</span>
                      )}
                    </label>
                  ))}
                  {users.length === 0 && <div className="text-xs text-slate-500">No users found</div>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: v }))}>
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
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm(p => ({ ...p, due_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button
                className="bg-blue-600 text-white"
                onClick={async () => {
                  if (!form.title.trim()) {
                    toast.error('Please enter a task title')
                    return
                  }
                  try {
                    const created = await dataLayer.tasks.create({ ...form })
                    for (const uid of assignees) {
                      await dataLayer.taskAssignees.create(created.id, uid)
                      await dataLayer.taskTimeline.create({
                        task_id: created.id,
                        event_type: 'assignee_added',
                        payload: { user_id: uid },
                      })
                    }
                    toast.success('Task created successfully')
                    setAddOpen(false)
                    setForm({ title: '', description: '', status: 'pending', priority: 'normal', due_date: '' })
                    setAssignees([])
                    load()
                  } catch (e) {
                    console.error('[AdminTaskListPage.CreateTask] failed:', e)
                    toast.error(e.message || 'Failed to create task')
                  }
                }}
              >
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminRoute>
  )
}
