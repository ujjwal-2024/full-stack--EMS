import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { dummyProfileData } from '../assets/assets'
import {
  CalendarIcon, ChevronRightIcon, DollarSignIcon,
  LayoutGridIcon, LogOutIcon, MenuIcon, SettingsIcon, UserIcon, XIcon
} from 'lucide-react'

const Sidebar = () => {
  const { pathname } = useLocation()
  const [userName, setUserName] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setUserName(dummyProfileData.firstName + ' ' + dummyProfileData.lastName)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const role = localStorage.getItem('role')?.toUpperCase() || "EMPLOYEE"

  const allNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGridIcon },
    { name: 'Employees', href: '/employees', icon: UserIcon, adminOnly: true },
    { name: 'Attendance', href: '/attendance', icon: CalendarIcon, employeeOnly: true },
    { name: 'Leave', href: '/leave', icon: CalendarIcon },
    { name: 'Payslips', href: '/payslips', icon: DollarSignIcon },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ]

  const handleLogout = () => {
    localStorage.removeItem('role')
    window.location.href = "/login"
  }

  const navItems = allNavItems.filter(item => {
    if (item.adminOnly) return role === 'ADMIN'
    if (item.employeeOnly) return role === 'EMPLOYEE'
    return true
  })

  const sidebarContent = (
    <>
      <div className='px-5 pt-6 pb-5 border-b border-white/10'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <UserIcon className='text-white size-7' />
            <div>
              <p className='font-semibold text-[13px] text-white tracking-wide'>Employee MS</p>
              <p className='text-[11px] text-slate-500 font-medium'>Management System</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className='lg:hidden p-2 bg-slate-900 text-white rounded-lg shadow-lg border border-white/10'>
            <XIcon size={20} />
          </button>
        </div>
      </div>

      {userName && (
        <div className='px-5 py-4 border-b border-white/10'>
          <div className='flex items-center gap-4'>
            <span className='inline-flex items-center justify-center h-10 w-10 rounded-full bg-slate-700 text-white text-sm font-medium'>
              {userName.charAt(0).toUpperCase()}
            </span>
            <div className='flex flex-col'>
              <p className='font-semibold text-[13px] text-white tracking-wide'>{userName}</p>
              <p className='text-[11px] text-slate-500 font-medium'>{role === 'ADMIN' ? 'Administrator' : 'Employee'}</p>
            </div>
          </div>
        </div>
      )}

      <div className='px-5 py-3'>
        <p className='text-[11px] text-slate-500 font-medium'>Navigation</p>
      </div>

      <nav className='flex-1 px-3 space-y-0.5 overflow-y-auto'>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link key={item.name} to={item.href} className={'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ' + (isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300')}>
              {item.icon && <item.icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? 'text-indigo-300' : 'text-slate-400 group-hover:text-slate-300'}`} />}
              <span className='flex-1'>{item.name}</span>
              {isActive && <ChevronRightIcon className='w-3 h-3 shrink-0 text-slate-400' />}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-colors">
          <LogOutIcon className="w-[17px] h-[17px] shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Hamburger — top-right, won't overlap content */}
      <button onClick={() => setMobileOpen(true)}
        className='lg:hidden fixed top-3 right-3 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg border border-white/10'>
        <MenuIcon size={20} />
      </button>

      {mobileOpen && <div onClick={() => setMobileOpen(false)} className='fixed inset-0 bg-black/50 z-40 lg:hidden' />}

      <aside className='hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:fixed lg:top-0 lg:left-0 lg:bg-slate-900 lg:text-white'>
        {sidebarContent}
      </aside>

      <aside className={`lg:hidden fixed top-0 left-0 w-64 h-screen bg-slate-900 text-white z-50 flex flex-col transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        {sidebarContent}
      </aside>
    </>
  )
}

export default Sidebar