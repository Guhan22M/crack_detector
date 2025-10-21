import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
// import History from '../pages/History';
import "../styles/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('userInfo') || 'null');
      setUser(storedUser);
    } catch (err) {
      console.error('Failed to parse userInfo from localStorage:', err);
      setUser(null);
    }
  }, [location]);

  const handleLogoClick = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
      <span className="navbar-brand fw-bold fs-4" style={{ cursor: 'pointer' }} onClick={handleLogoClick}>
        CrackDetectAi
      </span>

      {user && (
        <div className="ms-auto d-flex align-items-center gap-3">
            {/* <span className="fw-semibold">Image Analyser</span> */}
            {/* <span className="fw-semibold">History</span> */}
            <Link to="/home">Image Analyser</Link>
            <Link to="/history">History</Link>
          <span className="fw-semibold">Hi, {user.name} 👋</span>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
