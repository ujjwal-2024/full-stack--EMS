import { useState, useEffect } from 'react'
import { dummyEmployeeDashboardData } from '../assets/assets'
import Loading from '../components/Loading'
import EmployeeDashboard from '../components/EmployeeDashboard'
const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const role = localStorage.getItem('role')?.toUpperCase()

  useEffect(() => {
    setData(dummyAdminDashboardData)
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) return <Loading />
  if (!data) return <p className="text-center text-slate-500 py-12">Failed to load dashboard data</p>

  if (role === 'ADMIN') return <div>admin dashboard</div>

  return <EmployeeDashboard data={data} />
}

export default Dashboard