import { useState, useEffect } from "react"
import { dummyLeaveData } from "../assets/assets"
import { Plus, X } from "lucide-react"

const STATUS_COLORS = {
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  PENDING: "bg-amber-100 text-amber-700",
}

const TYPE_COLORS = {
  ANNUAL: "bg-blue-100 text-blue-700",
  CASUAL: "bg-purple-100 text-purple-700",
  SICK: "bg-red-100 text-red-700",
}

const Leave = () => {

  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    type: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: '',
  })

  useEffect(() => {
    setTimeout(() => {
      setLeaves(dummyLeaveData)
      setLoading(false)
    }, 1000)
  }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newLeave = {
      _id: Date.now().toString(),
      ...form,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    setLeaves(prev => [newLeave, ...prev])
    setShowModal(false)
    setForm({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' })
  }

  return (
    <div className="animate-fade-in">

      {/* header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Leave</h1>
          <p className="page-subtitle">Manage your leave requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Apply Leave
        </button>
      </div>

      {/* stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total",    value: leaves.length,                                    color: "text-gray-800"  },
            { label: "Approved", value: leaves.filter(l => l.status === 'APPROVED').length, color: "text-green-700" },
            { label: "Pending",  value: leaves.filter(l => l.status === 'PENDING').length,  color: "text-amber-700" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className={`text-xl font-semibold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Type</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Start Date</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">End Date</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Reason</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400">No leave records found</td>
              </tr>
            ) : (
              leaves.map(leave => (
                <tr key={leave._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[leave.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {leave.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {new Date(leave.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {new Date(leave.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-gray-700 max-w-xs truncate">{leave.reason}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[leave.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* apply leave modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">

            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Apply Leave</h2>
                <p className="text-sm text-gray-500 mt-0.5">Submit a new leave request</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Leave Type</label>
                <select name="type" value={form.type} onChange={handleChange} className="select select-bordered w-full">
                  <option value="ANNUAL">Annual</option>
                  <option value="CASUAL">Casual</option>
                  <option value="SICK">Sick</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                <input name="startDate" type="date" required value={form.startDate} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Date</label>
                <input name="endDate" type="date" required value={form.endDate} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Reason</label>
                <textarea name="reason" required value={form.reason} onChange={handleChange} placeholder="Enter reason..." rows={3} className="textarea textarea-bordered w-full" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit</button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}

export default Leave