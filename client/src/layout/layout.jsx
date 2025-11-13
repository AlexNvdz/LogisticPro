import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import "./layout.css";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isadmin = localStorage.getItem("isadmin") === "true";

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cerrar sidebar al navegar en mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const commonItems = [
    { path: "/", icon: "📊", text: "Dashboard", label: "Inicio" },
    { path: "/envios", icon: "📦", text: "Envíos", label: "Mis Envíos" },
    { path: "/rutas", icon: "🗺️", text: "Rutas", label: "Planificación" },
    { path: "/clientes", icon: "👥", text: "Clientes", label: "Contactos" },
  ];

  const adminItems = [
    { path: "/almacenes", icon: "🏭", text: "Almacenes", label: "Gestión" },
    { path: "/conductores", icon: "🚚", text: "Conductores", label: "Personal" },
    { path: "/vehiculos", icon: "🚗", text: "Vehículos", label: "Flota" },
  ];

  const navigationItems = isadmin ? [...commonItems, ...adminItems] : commonItems;

  const handleLogout = () => {
    localStorage.removeItem("isadmin");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getPageTitle = () => {
    const item = navigationItems.find((item) => item.path === location.pathname);
    return item ? item.text : "Dashboard";
  };

  return (
    <div className={`app-container ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
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
            <div className="logo-icon-box">🚚</div>
            {isSidebarOpen && (
              <div className="logo-text-container">
                <h1 className="logo-text">LogisticPro</h1>
                <span className="logo-subtitle">v1.0</span>
              </div>
            )}
          </div>
          {isSidebarOpen && (
            <button
              className="sidebar-toggle"
              onClick={() => setIsSidebarOpen(false)}
              title="Contraer menú"
            >
              ◀
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <div className="nav-section">
            <span className="nav-section-title">
              {isSidebarOpen ? "MENÚ PRINCIPAL" : ""}
            </span>
            {commonItems.map(({ path, icon, text, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
                title={!isSidebarOpen ? text : ""}
              >
                <span className="nav-icon">{icon}</span>
                {isSidebarOpen && (
                  <div className="nav-text-container">
                    <span className="nav-text">{text}</span>
                    <span className="nav-label">{label}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </div>

          {isadmin && (
            <div className="nav-section">
              <span className="nav-section-title">
                {isSidebarOpen ? "ADMINISTRACIÓN" : ""}
              </span>
              {adminItems.map(({ path, icon, text, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                  title={!isSidebarOpen ? text : ""}
                >
                  <span className="nav-icon">{icon}</span>
                  {isSidebarOpen && (
                    <div className="nav-text-container">
                      <span className="nav-text">{text}</span>
                      <span className="nav-label">{label}</span>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        {/* Logout Section */}
        <div className="sidebar-footer">
          <button 
            className="logout-btn" 
            onClick={handleLogout} 
            title="Cerrar sesión"
          >
            <span className="logout-icon">🔒</span>
            {isSidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            {/* En mobile: mostrar hamburguesa para abrir sidebar */}
            {isMobile && !isSidebarOpen && (
              <button
                className="mobile-menu-btn"
                onClick={() => setIsSidebarOpen(true)}
                title="Abrir menú"
              >
                ☰
              </button>
            )}
            {/* En desktop: mostrar botón expandir cuando sidebar está cerrado */}
            {!isMobile && !isSidebarOpen && (
              <button
                className="expand-sidebar-btn"
                onClick={() => setIsSidebarOpen(true)}
                title="Expandir menú"
              >
                ▶
              </button>
            )}
            <div className="page-title">
              <h2>{getPageTitle()}</h2>
              <span className="breadcrumb">{isadmin ? "Administrador" : "Usuario"}</span>
            </div>
          </div>

          <div className="header-right">
            <div className="search-bar">
              <input
                type="search"
                placeholder="Buscar envíos, rutas..."
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="header-actions">
              <button className="notification-btn" title="Notificaciones">
                🔔
                <span className="notification-badge">3</span>
              </button>

              <div className="user-menu-container">
                <button
                  className="user-profile-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <img
                    src="https://ui-avatars.com/api/?name=Usuario&background=2563eb&color=fff"
                    alt="User"
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <span className="user-name">Usuario</span>
                    <span className="user-role">
                      {isadmin ? "Admin" : "Operador"}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="user-menu-dropdown">
                    <a href="#profile" className="menu-item">
                      👤 Mi Perfil
                    </a>
                    <a href="#settings" className="menu-item">
                      ⚙️ Configuración
                    </a>
                    <hr className="menu-divider" />
                    <button
                      className="menu-item logout-item"
                      onClick={handleLogout}
                    >
                      🚪 Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area - AQUÍ RENDERIZA LAS PÁGINAS */}
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}