import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./layout.css";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigationItems = [
    { path: "/", icon: "📊", text: "Dashboard" },
    { path: "/envios", icon: "📦", text: "Envíos" },
    { path: "/rutas", icon: "🗺️", text: "Rutas" },
    { path: "/almacenes", icon: "🏭", text: "Almacenes" },
    { path: "/conductores", icon: "🚚", text: "Conductores" },
    { path: "/vehiculos", icon: "🚗", text: "Vehículos" },
    { path: "/usuarios", icon: "👥", text: "Usuarios" }
  ];

  // 📌 Cambia el título dinámicamente según la ruta
  const getPageTitle = () => {
    const current = navigationItems.find(item => item.path === location.pathname);
    return current ? current.text : "Panel de Control";
  };

  return (
    <div className="app-container">
      {/* Overlay para móvil */}
      {isMobile && isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-icon">🚚</span>
            {isSidebarOpen && <h1 className="logo-text">LogisticPro</h1>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="nav-menu">
          {navigationItems.map(({ path, icon, text }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">{icon}</span>
              {isSidebarOpen && <span className="nav-text">{text}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            {isMobile && (
              <button
                className="mobile-menu-btn"
                onClick={() => setIsSidebarOpen(true)}
              >
                ☰
              </button>
            )}
            <div className="page-title">
              <h2>{getPageTitle()}</h2>
            </div>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <input type="search" placeholder="Buscar..." />
            </div>
            <div className="user-menu">
              <img
                src="https://ui-avatars.com/api/?name=User"
                alt="User"
                className="user-avatar"
              />
            </div>
          </div>
        </header>
        <div className="content-wrapper">{children}</div>
      </main>
    </div>
  );
}
