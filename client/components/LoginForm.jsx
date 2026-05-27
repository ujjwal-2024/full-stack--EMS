import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import LoginLeftSide from './LoginLeftSide'

const LoginForm = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <LoginLeftSide />

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 min-h-screen">
        <div className="w-full max-w-md">
          <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm mb-10 transition-colors">
            <ArrowLeftIcon size={16} /> Back to portals
          </Link>
        </div>
      </div>

    </div>
  )
}

export default LoginForm