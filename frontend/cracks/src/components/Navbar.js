import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
// import History from '../pages/History';
// import "../styles/navbar.css";
import "../styles/home.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light px-4">
      <span className="navbar-brand fw-bold fs-4" style={{ cursor: 'pointer' }} onClick={handleLogoClick}>
        CrackDetectAi
      </span>

      {user && (
        <>
          {/* NEW: Mobile toggle button */}
          <button
            className="btn btn-outline-primary d-lg-none"
            onClick={toggleMenu}
            style={{ padding: '6px 12px', fontWeight: 700 }}
          >
            ☰
          </button>

          {/* Links container */}
          <div className={`ms-auto d-flex align-items-center gap-3 flex-column flex-lg-row ${isMenuOpen ? 'd-flex' : 'd-none d-lg-flex'}`}>
            <Link to="/home" onClick={() => setIsMenuOpen(false)}>Image Analyser</Link>
            <Link to="/history" onClick={() => setIsMenuOpen(false)}>History</Link>
            <span className="fw-semibold">Hi, {user.name} 👋</span>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </>
      )}
    </nav>
    
  );
};

export default Navbar;
