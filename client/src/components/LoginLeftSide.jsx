const LoginLeftSide = () => (
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
)

export default LoginLeftSide