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



const App = () => {
  return (
    <>
      <Toaster />

      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoggingLanding />} />
       
       
      <Route path="/login/admin" element={<LoginForm role="admin" title="Admin Portal" subtitle="Sign in to manage the organisation" />} />
      <Route path="/login/employee" element={<LoginForm role="employee" title="Employee Portal" subtitle="Sign in to access account" />} />


        {/* Layout Wrapper */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/payslips" element={<Payslips />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Other Routes */}
        <Route path="/print/payslips/:id" element={<PrintPayslips />} />

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

export default App