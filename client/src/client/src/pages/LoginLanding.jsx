import { ArrowRightIcon, ShieldIcon, UserIcon } from "lucide-react"
import { Link } from "react-router-dom"
import LoginLeftSide from "../components/LoginLeftSide"

const LoggingLanding = () => {

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
    }
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      <LoginLeftSide />

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative overflow-y-auto min-h-screen">

        <div className="w-full max-w-md animate-fade-in relative z-10">

          {/* Header */}
          <div>
            <h2 className="text-3xl font-medium text-slate-900 tracking-tight mb-3">
              Welcome Back
            </h2>

            <p className="text-slate-500">
              Select your portal to securely access your account
            </p>
          </div>

          {/* Portals List */}
          <div className="space-y-4 mt-8">

            {portalOptions.map((option) => {

              const Icon = option.icon

              return (
                <Link
                  key={option.to}
                  to={option.to}
                  className="group block bg-slate-50 border border-slate-200 rounded-lg p-5 sm:p-6 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300"
                >

                  <div className="relative z-10 flex items-center justify-between gap-4 sm:gap-5">

                    <div className="flex items-start gap-4">

                      <div className="p-3 rounded-lg bg-indigo-100">
                        <Icon className="w-6 h-6 text-indigo-600" />
                      </div>

                      <div>
                        <h3 className="text-lg text-slate-800 group-hover:text-indigo-600 mb-1 transition-colors">
                          {option.title}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {option.description}
                        </p>
                      </div>

                    </div>

                    <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />

                  </div>

                </Link>
              )
            })}

          </div>

          {/* Footer */}
          <div className="mt-12 text-center md:text-left text-sm text-slate-400">
            <p>©️ {new Date().getFullYear()} GreatStack. All rights reserved.</p>
          </div>

        </div>

      </div>

    </div>
  )
}

export default LoginLanding