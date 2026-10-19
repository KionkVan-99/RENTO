import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Menu,
  X,
  Heart,
  ArrowUpRight,
} from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="nav-container">

        {/* LOGO */}
        <Link
          to="/"
          className="logo"
          onClick={closeMenu}
        >
          <span className="logo-wordmark">
            RENTO<span>.</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="nav-links">

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/buy"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Buy
          </NavLink>

          <NavLink
            to="/rent"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Rent
          </NavLink>

          <NavLink
            to="/land"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Land
          </NavLink>

          {/* PUBLIC AGENTS */}
          <NavLink
            to="/agents"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Agents
          </NavLink>

        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="nav-actions">

          {/* SAVED */}
          <Link
            to="/saved"
            className="icon-nav-btn"
            aria-label="Saved properties"
          >
            <Heart
              size={17}
              strokeWidth={1.8}
            />
          </Link>

          {/* LOGIN */}
          <Link
            to="/agent/login"
            className="login-btn"
          >
            Login
          </Link>

          {/* LIST PROPERTY */}
          <Link
            to="/list-property"
            className="list-btn"
          >
            List Property
            <ArrowUpRight size={15} />
          </Link>

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X size={23} />
          ) : (
            <Menu size={23} />
          )}
        </button>

      </div>

      {/* MOBILE NAVIGATION */}
      <div
        className={`mobile-nav ${
          menuOpen ? "open" : ""
        }`}
      >

        <NavLink
          to="/"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/buy"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Buy
        </NavLink>

        <NavLink
          to="/rent"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Rent
        </NavLink>

        <NavLink
          to="/land"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Land
        </NavLink>

        {/* PUBLIC AGENTS */}
        <NavLink
          to="/agents"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Agents
        </NavLink>

        {/* MOBILE ACTIONS */}
        <div className="mobile-nav-actions">

          <Link
            to="/saved"
            onClick={closeMenu}
            className="login-btn"
          >
            Saved Properties
          </Link>

          <Link
            to="/agent/login"
            onClick={closeMenu}
            className="login-btn"
          >
            Login
          </Link>

          <Link
            to="/list-property"
            onClick={closeMenu}
            className="list-btn"
          >
            List Property
            <ArrowUpRight size={15} />
          </Link>

        </div>

      </div>
    </header>
  );
};

export default Navbar;