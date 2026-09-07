import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import faceIcon from "../../assets/images/Uttam-ghosh-face-icon.jpeg";
import "./Navbar.css";

const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const Navbar = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const goTo = (id) => {
    if (isHome) scrollToSection(id);
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <img src={faceIcon} alt="" className="logo-icon" />
          <p className="logo-tagline">ARTIST • CARTOONIST • PHOTOGRAPHER</p>
        </Link>

        <Link
          to="/"
          className="navbar-name"
          onClick={() => setMenuOpen(false)}
        >
          Uttam Ghosh
        </Link>

        <div className="navbar-end">
          <button
            type="button"
            className={`nav-toggle${menuOpen ? " open" : ""}`}
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav
            id="site-navigation"
            className={`nav-panel${menuOpen ? " open" : ""}`}
          >
          <ul className="nav-links">
            <li>
              {isHome ? (
                <button
                  type="button"
                  className="nav-link-btn active"
                  onClick={() => goTo("top")}
                >
                  HOME
                </button>
              ) : (
                <Link to="/" onClick={() => setMenuOpen(false)}>
                  HOME
                </Link>
              )}
            </li>
            <li>
              {isHome ? (
                <button
                  type="button"
                  className="nav-link-btn"
                  onClick={() => goTo("work")}
                >
                  WORK
                </button>
              ) : (
                <Link to="/#work" onClick={() => setMenuOpen(false)}>
                  WORK
                </Link>
              )}
            </li>
            <li className={pathname === "/about" ? "active" : undefined}>
              <Link to="/about" onClick={() => setMenuOpen(false)}>
                ABOUT
              </Link>
            </li>
            <li>
              {isHome ? (
                <button
                  type="button"
                  className="nav-link-btn"
                  onClick={() => goTo("contact")}
                >
                  CONTACT
                </button>
              ) : (
                <Link to="/#contact" onClick={() => setMenuOpen(false)}>
                  CONTACT
                </Link>
              )}
            </li>
          </ul>
        </nav>
        </div>
      </div>

      {menuOpen ? (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
    </header>
  );
};

export default Navbar;
