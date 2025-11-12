import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, allowedRoles = ["admin", "user"] }) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState({ token: null, role: null });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setAuth({ token, role });
    setLoading(false);
  }, []);

  if (loading) {
    // 🌀 Mostrar un pequeño loader temporal mientras verifica el token
    return <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "1.5rem"
    }}>Cargando...</div>;
  }

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(auth.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
