import { Toaster } from 'react-hot-toast'
import { Route, Routes, Navigate } from 'react-router-dom'
import LoggingLanding from './pages/LoggingLanding'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import Leave from './pages/Leave'
import Payslips from './pages/Payslips'
import Settings from './pages/Settings'
import PrintPayslips from './pages/PrintPayslips'
import LoginForm from './components/LoginForm'

const App = () => (
  <>
    <Toaster />
    <Routes>
      <Route path="/login"          element={<LoggingLanding />} />
      <Route path="/login/admin"    element={<LoginForm portal="admin" />} />
      <Route path="/login/employee" element={<LoginForm portal="employee" />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/payslips" element={<Payslips />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/print/payslips/:id" element={<PrintPayslips />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </>
)

export default App