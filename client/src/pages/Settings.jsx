import { useState } from "react"
import { dummyProfileData } from "../assets/assets"
import { User, Lock, Bell, Trash2 } from "lucide-react"

const Settings = () => {

  const [profile, setProfile] = useState({
    firstName: dummyProfileData.firstName,
    lastName: dummyProfileData.lastName,
    email: dummyProfileData.email,
  })

  const [password, setPassword] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    leaveUpdates: true,
    payslipAlerts: false,
    attendanceReminders: true,
  })

  const handleProfileChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordChange = (e) => {
    setPassword(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    alert('Profile updated successfully!')
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (password.newPassword !== password.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    alert('Password changed successfully!')
    setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' })
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deleted!')
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl">

      {/* header */}
      <div className="mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* profile */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} className="text-gray-500" />
            <h2 className="text-sm font-medium text-gray-700">Profile</h2>
          </div>

          {/* avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-white text-lg font-semibold">
              {profile.firstName.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-900">{profile.firstName} {profile.lastName}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">First Name</label>
                <input name="firstName" type="text" value={profile.firstName} onChange={handleProfileChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                <input name="lastName" type="text" value={profile.lastName} onChange={handleProfileChange} className="input input-bordered w-full" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input name="email" type="email" value={profile.email} onChange={handleProfileChange} className="input input-bordered w-full" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>

        {/* change password */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={16} className="text-gray-500" />
            <h2 className="text-sm font-medium text-gray-700">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Current Password</label>
              <input name="oldPassword" type="password" required value={password.oldPassword} onChange={handlePasswordChange} placeholder="••••••••" className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">New Password</label>
              <input name="newPassword" type="password" required value={password.newPassword} onChange={handlePasswordChange} placeholder="••••••••" className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
              <input name="confirmPassword" type="password" required value={password.confirmPassword} onChange={handlePasswordChange} placeholder="••••••••" className="input input-bordered w-full" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">Update Password</button>
            </div>
          </form>
        </div>

        {/* notifications */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell size={16} className="text-gray-500" />
            <h2 className="text-sm font-medium text-gray-700">Notifications</h2>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { key: 'emailNotifications',   label: 'Email Notifications',   desc: 'Receive notifications via email'         },
              { key: 'leaveUpdates',          label: 'Leave Updates',          desc: 'Get notified on leave status changes'   },
              { key: 'payslipAlerts',         label: 'Payslip Alerts',         desc: 'Get notified when payslip is generated' },
              { key: 'attendanceReminders',   label: 'Attendance Reminders',   desc: 'Daily check-in and check-out reminders' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                  className="toggle toggle-primary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* danger zone */}
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Trash2 size={16} className="text-red-500" />
            <h2 className="text-sm font-medium text-red-600">Danger Zone</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Delete Account</p>
              <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
            </div>
            <button onClick={handleDeleteAccount} className="btn btn-error btn-sm text-white">Delete Account</button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Settings