import { useState, useEffect } from "react"
import { dummyAttendanceData, getWorkingHoursDisplay, getDayTypeDisplay } from "../assets/assets"

const Attendance = () => {

  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkedIn, setCheckedIn] = useState(false)
  const [todayRecord, setTodayRecord] = useState(null)

  useEffect(() => {
    setTimeout(() => {
      setAttendance(dummyAttendanceData)
      setLoading(false)
    }, 1000)
  }, [])

  const handleCheckIn = () => {
    const newRecord = {
      _id: Date.now().toString(),
      date: new Date().toISOString(),
      checkIn: new Date().toISOString(),
      checkOut: null,
      status: 'PRESENT',
      workingHours: null,
      dayType: null,
    }
    setTodayRecord(newRecord)
    setAttendance(prev => [newRecord, ...prev])
    setCheckedIn(true)
  }

  const handleCheckOut = () => {
    const updated = attendance.map(r =>
      r._id === todayRecord._id
        ? { ...r, checkOut: new Date().toISOString(), workingHours: 8, dayType: 'Full Day' }
        : r
    )
    setAttendance(updated)
    setCheckedIn(false)
    setTodayRecord(null)
  }

  return (
    <div className="animate-fade-in">

      {/* header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track your daily attendance</p>
        </div>
        <button
          onClick={checkedIn ? handleCheckOut : handleCheckIn}
          className={`btn ${checkedIn ? 'btn-error' : 'btn-primary'}`}
        >
          {checkedIn ? 'Check Out' : 'Check In'}
        </button>
      </div>

      {/* today status */}
      {checkedIn && todayRecord && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-sm text-green-700 font-medium">
            You checked in at {new Date(todayRecord.checkIn).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Date</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Check In</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Check Out</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Working Hours</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Status</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Day Type</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : attendance.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400">No attendance records found</td>
              </tr>
            ) : (
              attendance.map(record => {
                const dayType = getDayTypeDisplay(record)
                return (
                  <tr key={record._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-700">
                      {new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {getWorkingHoursDisplay(record)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        {record.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dayType.className}`}>
                        {dayType.label}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Attendance