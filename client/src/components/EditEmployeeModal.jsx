import { useState } from 'react'
import { X } from 'lucide-react'
import { DEPARTMENTS } from '../assets/assets'

const EditEmployeeModal = ({ emp, onClose, onSubmit }) => {

  const [form, setForm] = useState({
    firstName: emp.firstName || '',
    lastName: emp.lastName || '',
    email: emp.email || '',
    phone: emp.phone || '',
    department: emp.department || '',
    position: emp.position || '',
    basicSalary: emp.basicSalary || '',
    allowances: emp.allowances || '',
    deductions: emp.deductions || '',
    employmentStatus: emp.employmentStatus || 'ACTIVE',
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...emp, ...form })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Employee</h2>
            <p className="text-sm text-gray-500 mt-0.5">Update employee profile</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">

          {/* employee profile */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Employee Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">First Name</label>
                <input name="firstName" type="text" required value={form.firstName} onChange={handleChange} placeholder="John" className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                <input name="lastName" type="text" required value={form.lastName} onChange={handleChange} placeholder="Doe" className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@company.com" className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="9000000000" className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Department</label>
                <select name="department" required value={form.department} onChange={handleChange} className="select select-bordered w-full">
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Position</label>
                <input name="position" type="text" value={form.position} onChange={handleChange} placeholder="Software Developer" className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Employment Status</label>
                <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange} className="select select-bordered w-full">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* salary */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Salary Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Basic Salary</label>
                <input name="basicSalary" type="number" value={form.basicSalary} onChange={handleChange} placeholder="0" className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Allowances</label>
                <input name="allowances" type="number" value={form.allowances} onChange={handleChange} placeholder="0" className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Deductions</label>
                <input name="deductions" type="number" value={form.deductions} onChange={handleChange} placeholder="0" className="input input-bordered w-full" />
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default EditEmployeeModal