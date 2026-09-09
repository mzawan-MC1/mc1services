import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function initials(n) {
  if (!n) return 'U'
  const p = String(n).trim().split(/\s+/)
  return (p[0]?.[0] || '') + (p[1]?.[0] || p[0]?.[1] || '')
}

export default function AssigneeAvatarGroup({ users = [], max = 3, size = 'md' }) {
  const sizeClass =
    size === 'lg' ? 'h-9 w-9 text-sm'
    : size === 'sm' ? 'h-6 w-6 text-[10px]'
    : 'h-8 w-8 text-xs'
  const plusSizeClass =
    size === 'lg' ? 'h-9 w-9 text-sm'
    : size === 'sm' ? 'h-6 w-6 text-[10px]'
    : 'h-8 w-8 text-[11px]'
  const spaceClass = size === 'sm' ? '-space-x-1.5' : '-space-x-2'
  const borderClass = 'border-2 border-white'
  const visible = users.slice(0, max)
  const remaining = Math.max(users.length - max, 0)
  return (
    <TooltipProvider delayDuration={150}>
      <div className={`flex ${spaceClass} items-center`}>
        {visible.map(u => {
          const name = u.full_name || u.email || 'User'
          return (
            <Tooltip key={u.user_id || u.id}>
              <TooltipTrigger asChild>
                <Avatar className={`${sizeClass} ${borderClass} shadow-sm ring-1 ring-slate-200/50`}>
                  <AvatarImage src={u.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold">
                    {initials(name)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="z-50">
                <div className="font-medium">{name}</div>
                {u.email && u.full_name && (
                  <div className="text-xs text-slate-500 font-normal">{u.email}</div>
                )}
              </TooltipContent>
            </Tooltip>
          )
        })}
        {remaining > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`${plusSizeClass} rounded-full bg-gradient-to-br from-slate-500 to-slate-600 text-white flex items-center justify-center font-semibold ${borderClass} shadow-sm ring-1 ring-slate-300/50`}>
                +{remaining}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              <div className="font-medium">{remaining} more assignee{remaining > 1 ? 's' : ''}</div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

