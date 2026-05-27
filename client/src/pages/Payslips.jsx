import { useState, useEffect } from "react"
import { dummyPayslipData } from "../assets/assets"
import { Printer, FileText, FileSpreadsheet } from "lucide-react"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const Payslips = () => {

  const [payslips, setPayslips] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setTimeout(() => {
      setPayslips(dummyPayslipData)
      setLoading(false)
    }, 1000)
  }, [])

  const filtered = payslips.filter(payslip => {
    const monthName = MONTHS[payslip.month - 1].toLowerCase()
    const year = payslip.year.toString()
    const query = search.toLowerCase()
    return monthName.includes(query) || year.includes(query)
  })

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = (payslip) => {
    const content = `
      <html>
        <head>
          <title>Payslip - ${MONTHS[payslip.month - 1]} ${payslip.year}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            p { font-size: 13px; color: #555; margin: 0 0 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { text-align: left; font-size: 12px; color: #888; padding: 8px 12px; border-bottom: 1px solid #eee; }
            td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f3f3f3; }
            .net { font-weight: bold; font-size: 16px; }
            .green { color: green; }
            .red { color: red; }
          </style>
        </head>
        <body>
          <h1>Payslip</h1>
          <p>${MONTHS[payslip.month - 1]} ${payslip.year}</p>
          <table>
            <thead>
              <tr><th>Description</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>Basic Salary</td><td>₹${payslip.basicSalary.toLocaleString()}</td></tr>
              <tr><td>Allowances</td><td class="green">+₹${payslip.allowances.toLocaleString()}</td></tr>
              <tr><td>Deductions</td><td class="red">-₹${payslip.deductions.toLocaleString()}</td></tr>
              <tr><td class="net">Net Salary</td><td class="net">₹${payslip.netSalary.toLocaleString()}</td></tr>
            </tbody>
          </table>
        </body>
      </html>
    `
    const win = window.open('', '_blank')
    win.document.write(content)
    win.document.close()
    win.onload = () => win.print()
  }

  const handleDownloadCSV = (payslip) => {
    const rows = [
      ['Description', 'Amount'],
      ['Month', `${MONTHS[payslip.month - 1]} ${payslip.year}`],
      ['Basic Salary', payslip.basicSalary],
      ['Allowances', payslip.allowances],
      ['Deductions', payslip.deductions],
      ['Net Salary', payslip.netSalary],
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payslip-${MONTHS[payslip.month - 1]}-${payslip.year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in">

      {/* header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Payslips</h1>
          <p className="page-subtitle">View and download your payslips</p>
        </div>
      </div>

      {/* stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Payslips",   value: payslips.length,                                                        color: "text-gray-800"  },
            { label: "Latest Net Pay",   value: `₹${payslips[0]?.netSalary?.toLocaleString() ?? 0}`,                   color: "text-green-700" },
            { label: "Total Deductions", value: `₹${payslips.reduce((a, b) => a + b.deductions, 0).toLocaleString()}`, color: "text-red-700"   },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className={`text-xl font-semibold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* search bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by month or year e.g. January or 2026..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full sm:w-80"
        />
      </div>

      {/* table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Month</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Basic Salary</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Allowances</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Deductions</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Net Salary</th>
              <th className="px-5 py-4 text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400">No payslips found</td>
              </tr>
            ) : (
              filtered.map(payslip => (
                <tr key={payslip._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-700 font-medium">
                    {MONTHS[payslip.month - 1]} {payslip.year}
                  </td>
                  <td className="px-5 py-4 text-gray-700">₹{payslip.basicSalary.toLocaleString()}</td>
                  <td className="px-5 py-4 text-green-700">+₹{payslip.allowances.toLocaleString()}</td>
                  <td className="px-5 py-4 text-red-700">-₹{payslip.deductions.toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">₹{payslip.netSalary.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={handlePrint} title="Print" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                        <Printer size={14} />
                      </button>
                      <button onClick={() => handleDownloadPDF(payslip)} title="Download PDF" className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                        <FileText size={14} />
                      </button>
                      <button onClick={() => handleDownloadCSV(payslip)} title="Download CSV" className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all">
                        <FileSpreadsheet size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default Payslips