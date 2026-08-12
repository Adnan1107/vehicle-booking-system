import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Car,
  Menu,
  X,
  LayoutDashboard,
  Car as CarIcon,
  ClipboardList,
  LogOut,
} from 'lucide-react'

const LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehicles', label: 'Vehicles', icon: CarIcon },
  { to: '/bookings', label: 'Bookings', icon: ClipboardList },
]

function NavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'text-white'
            : 'text-neutral-400 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="w-4 h-4" strokeWidth={2} />
          {label}

          {isActive && (
            <span className="absolute -bottom-[13px] left-3 right-3 h-0.5 bg-red-600 rounded-full" />
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    // Remove authentication data
    localStorage.removeItem('token')
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')

    // Close mobile menu
    setOpen(false)

    // Go to login page
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group"
          >
            <span className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center group-hover:bg-red-500 transition-colors">
              <Car
                className="w-5 h-5 text-white"
                strokeWidth={2.2}
              />
            </span>

            <span className="text-white font-bold tracking-tight text-[15px] hidden sm:block">
              Vehicle Booking System
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {LINKS.map((link) => (
              <NavItem
                key={link.to}
                {...link}
              />
            ))}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="ml-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <LogOut
                className="w-4 h-4"
                strokeWidth={2}
              />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-neutral-300 hover:text-white p-2 -mr-2"
            aria-label="Toggle menu"
          >
            {open ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="md:hidden border-t border-neutral-800 px-4 py-3 flex flex-col gap-1 bg-neutral-950">

          {LINKS.map((link) => (
            <NavItem
              key={link.to}
              {...link}
              onClick={() => setOpen(false)}
            />
          ))}

          {/* Mobile Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-left"
          >
            <LogOut
              className="w-4 h-4"
              strokeWidth={2}
            />
            Logout
          </button>

        </div>
      )}
    </nav>
  )
}