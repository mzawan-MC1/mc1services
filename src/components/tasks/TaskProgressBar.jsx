import React from 'react'

export default function TaskProgressBar({ completed = 0, total = 0, status = 'pending', showText = true, compact = false }) {
  let pct = 0
  if (total > 0) pct = Math.round((completed / total) * 100)
  else pct = status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0

  let barColor = 'bg-slate-400'
  let textColor = 'text-slate-600'
  let trackClass = 'bg-slate-200'
  if (status === 'completed' || pct === 100) {
    barColor = 'bg-gradient-to-r from-green-500 to-emerald-500'
    textColor = 'text-green-700'
    trackClass = 'bg-green-100'
  } else if (status === 'in_progress' || pct > 0) {
    barColor = 'bg-gradient-to-r from-blue-500 to-indigo-500'
    textColor = 'text-blue-700'
    trackClass = 'bg-blue-100/50'
  }

  const heightClass = compact ? 'h-1.5' : 'h-2.5'
  const fontWrapper = compact ? 'mb-0.5 text-[10px]' : 'mb-1 text-xs'

  return (
    <div className="w-full">
      {showText && (
        <div className={`flex items-center justify-between ${fontWrapper}`}>
          <span className={`font-bold ${textColor}`}>{pct}%</span>
          <span className="text-slate-500 font-medium">
            {total > 0 ? `${completed}/${total} done` : status === 'completed' ? 'Complete' : status === 'in_progress' ? 'In Progress' : 'Not started'}
          </span>
        </div>
      )}
      <div className={`w-full ${heightClass} ${trackClass} rounded-full overflow-hidden shadow-inner`}>
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out shadow-[0_0_0_1px_rgba(0,0,0,0.04)_inset]`}
          style={{ width: pct + '%' }}
        />
      </div>
    </div>
  )
}
