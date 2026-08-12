import { NavLink, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Remove all authentication data
    localStorage.removeItem('user')
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('token')

    // Go directly to login
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <div
          className="navbar-logo"
          onClick={() => {
            navigate('/')
          }}
        >
          🚗 Vehicle Booking
        </div>

        {/* Navigation Links */}
        <div className="navbar-links">

          <NavLink
            to="/"
            className="nav-link"
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/vehicles"
            className="nav-link"
          >
            Vehicles
          </NavLink>

          <NavLink
            to="/bookings"
            className="nav-link"
          >
            Bookings
          </NavLink>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="nav-link logout-button"
          >
            Logout
          </button>

        </div>

      </div>
    </nav>
  )
}

export default Navbar