import { useState, useEffect, useCallback } from "react"
import { dummyEmployeeData, DEPARTMENTS } from "../assets/assets"
import { Plus } from "lucide-react"
import EmployeeCard from "../components/EmployeeCard"
import CreateEmployeeModal from "../components/CreateEmployeeModal"
import EditEmployeeModal from "../components/EditEmployeeModal"

const Employees = () => {

  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setEmployees(dummyEmployeeData)
    setTimeout(()=>{
      setLoading(false)
    },1000)
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const filtered = employees.filter(emp =>
    (`${emp.firstName} ${emp.lastName}`).toLowerCase().includes(search.toLowerCase()) &&
    (selectedDept === '' || emp.department === selectedDept)
  )

  const handleDelete = (id) => {
    if(!window.confirm('Are you sure you want to delete this employee?')) return
    setEmployees(prev => prev.filter(emp => emp._id !== id))
  }

  const handleCreate = (data) => {
    const newEmp = { ...data, _id: Date.now().toString() }
    setEmployees(prev => [...prev, newEmp])
  }

  const handleEdit = (updatedEmp) => {
    setEmployees(prev => prev.map(emp => emp._id === updatedEmp._id ? updatedEmp : emp))
  }

  return (
    <div className="animate-fade-in"> 
      {/*header*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"> 
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage your organization's workforce</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={16} /> Add Employee</button>
      </div>

      {/* search bar*/}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search employee..."
            className="input input-bordered w-full sm:w-64"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </div>
        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="select select-bordered w-full sm:w-auto">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select> 
      </div>

      {/*employee cards*/}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(emp => (
          <EmployeeCard key={emp._id} emp={emp} onEdit={() => setEditingEmployee(emp)} onDelete={() => handleDelete(emp._id)} />
        ))}
      </div>

      {/*create employee modal*/}
      {showCreateModal && (
        <CreateEmployeeModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {/*edit employee modal*/}
      {editingEmployee && (
        <EditEmployeeModal
          emp={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  )
}

export default Employees