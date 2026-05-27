import React from 'react'
import { CalendarIcon, FileTextIcon, DollarSignIcon } from 'lucide-react'

const EmployeeDashboard = ({data}) => {
  const emp = data.employee

  const cards = [
    {
      icon: CalendarIcon,
      value: data.currentMonthAttendace,
      title: "Days Present",
      subtitle: "This month",
    },
    {
      icon: FileTextIcon,
      value: data.pendingLeaves,
      title: "Pending Leaves",
      subtitle: "Awaiting approval",
    },
    {
      icon: DollarSignIcon,
      value: data.latestPayslip ? `$${data.latestPayslip.netSalary?.toLocaleString()}` : "N/A",
      title: "Latest Payslip",
      subtitle: "Most recent payout",
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {emp?.firstName}!</h1>
        <p className="page-subtitle">{emp?.position} - {emp?.department || "No Department"}</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
            <card.icon className="w-6 h-6 text-gray-400" />
            <div>
              <p className="font-semibold">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmployeeDashboard