import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Navbar.css";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = (event) => {
    event.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    logout();
    navigate("/signin");
  };

  useEffect(() => {
    const closeDropdown = (event) => {
      if (!event.target.closest(".user-info")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-section left">
          <div className="search-box">
            <input type="text" placeholder="Search" />
            <i className="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </i>
          </div>
        </div>

        <Link to="/" className="logo-container">
          <img src={logo} alt="WeFund Logo" className="logo" />
          <span className="logo-text">wefund</span>
        </Link>

        <div className="nav-section right">
          <div className="mobile-menu-btn" onClick={toggleMenu}>
            <span className={`menu-icon ${isMenuOpen ? "open" : ""}`}></span>
          </div>

          <div className={`nav-items ${isMenuOpen ? "active" : ""}`}>
            <Link to="/about" className="nav-link">About us</Link>
            <Link to="/donate" className="nav-link">Donate</Link>
            {user ? (
              <div className="user-info" onClick={toggleDropdown}>
                <span className="user-name">{user.displayName || user.email}</span>
                <div className="user-icon">
                  {user.photoURL ? <img src={user.photoURL} alt="User" /> : <div className="empty-icon"></div>}
                </div>
                <div className={`dropdown-menu ${isDropdownOpen ? "active" : ""}`}>
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <Link to="/your-campaigns" className="dropdown-item">Your Fundraisers</Link>
                  <Link to="/settings" className="dropdown-item">Settings</Link>
                  <button onClick={handleSignOut} className="dropdown-item">Sign Out</button>
                </div>
              </div>
            ) : (
              <Link to="/signin" className="signin">Sign in</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
