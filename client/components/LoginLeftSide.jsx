import { ShieldIcon, UserIcon, ArrowRightIcon } from "lucide-react"
import { Link } from "react-router-dom"

const LoginPage = () => {
  const portalOptions = [
    {
      to: "/login/admin",
      title: "Admin Portal",
      description: "Manage the organisation, employees, and payroll",
      icon: ShieldIcon,
    },
    {
      to: "/login/employee",
      title: "Employee Portal",
      description: "Access your personal information and manage your leave requests",
      icon: UserIcon,
    },
  ]

  return (
    <div className="flex min-h-screen">

      {/* Left Side */}
      <div className="hidden md:flex w-1/2 bg-indigo-950 relative overflow-hidden border-r border-slate-200">
        <div className="absolute -top-30 -left-30 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col justify-center px-12">
          <h1 className="text-white text-4xl font-bold mb-4">
            Employee <br /> Management <br /> System
          </h1>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            Welcome to our Employee Management System! This platform is designed
            to streamline HR processes, enhance communication, and empower
            employees. With features like attendance tracking, leave management,
            and payroll processing, we aim to create a seamless experience for
            both administrators and staff.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative overflow-y-auto min-h-screen">
        <div className="w-full max-w-md relative z-10">

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Welcome back</h2>
            <p className="text-slate-500 mt-1">Select your portal to securely access your account</p>
          </div>

          {/* Portals list */}
          <div className="space-y-4">
            {portalOptions.map((option) => {
              const Icon = option.icon
              return (
                <Link
                  key={option.to}
                  to={option.to}
                  className="group flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-5 sm:p-6 transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="flex items-center gap-4">
                    <Icon className="w-6 h-6 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {option.title}
                      </h3>
                      <p className="text-sm text-slate-500">{option.description}</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center md:text-left text-sm text-slate-400">
            <p>
              © {new Date().getFullYear()} GreatStack. All rights reserved.
            </p>
           </div>

        </div>
      </div>

    </div>
  )
}

export default LoginPage