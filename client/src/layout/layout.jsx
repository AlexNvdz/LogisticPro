import { Outlet } from "react-router-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./layout.css";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 🔐 Rol del usuario
  const role = localStorage.getItem("role") || "user";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 Menú de navegación
  const navigationItems = [
    { path: "/", icon: "📊", text: "Dashboard" },
    { path: "/envios", icon: "📦", text: "Envíos" },
    { path: "/rutas", icon: "🗺️", text: "Rutas" },
    ...(role === "admin"
      ? [
          { path: "/almacenes", icon: "🏭", text: "Almacenes" },
          { path: "/conductores", icon: "🚚", text: "Conductores" },
          { path: "/vehiculos", icon: "🚗", text: "Vehículos" },
          { path: "/usuarios", icon: "👥", text: "Usuarios" },
        ]
      : []),
  ];

  // 📌 Título de página actual
  const getPageTitle = () => {
    const current = navigationItems.find(
      (item) => item.path === location.pathname
    );
    return current ? current.text : "Panel de Control";
  };

  // 🔒 Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="app-container">
      {/* Fondo para móvil cuando el sidebar está abierto */}
      {isMobile && isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 🔹 Sidebar */}
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

        {/* 🔘 Botón de logout */}
        <div className="logout-section">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 {isSidebarOpen && "Cerrar sesión"}
          </button>
        </div>
      </aside>

      {/* 🔹 Contenido principal */}
      <main className="main-content">
        {/* 🔸 Header superior */}
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
            <span className="role-label">
              {role === "admin" ? "Administrador" : "Usuario"}
            </span>
            <button onClick={handleLogout} className="logout-btn-header">
              Cerrar sesión
            </button>
            <img
              src={`https://ui-avatars.com/api/?name=${
                role === "admin" ? "Admin" : "User"
              }&background=1a5d94&color=fff`}
              alt="User Avatar"
              className="user-avatar"
            />
          </div>
        </header>

        {/* 🔸 Contenido dinámico */}
        <div className="content-wrapper">
          <Outlet />
        </div> 
      </main>
    </div>
  );
}
