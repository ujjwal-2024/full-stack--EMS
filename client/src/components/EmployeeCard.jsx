import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'

const EmployeeCard = ({ emp, onEdit, onDelete }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-4 flex flex-col gap-3 hover:bg-slate-700 hover:shadow-lg transition-all duration-200 cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-sm font-semibold text-white">
          {emp.firstName.charAt(0)}
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <h3 className="text-lg font-semibold text-white">{emp.firstName} {emp.lastName}</h3>
          <p className="text-sm text-slate-400">{emp.position}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600 transition-all duration-150">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-600 transition-all duration-150">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <div className="border-t border-slate-700 pt-2 flex flex-col gap-1">
        <p className="text-xs text-slate-400">📧 {emp.email}</p>
        <p className="text-xs text-slate-400">🏢 {emp.department}</p>
      </div>
    </div>
  )
}

export default EmployeeCard