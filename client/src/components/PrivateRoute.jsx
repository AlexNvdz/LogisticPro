// src/components/PrivateRoute.jsx

import { Navigate } from "react-router-dom";

// Este componente REEMPLAZA el que tienes
const PrivateRoute = ({ children }) => {
  // 1. Revisa si hay un token guardado en el navegador
  const token = localStorage.getItem("token");

  // 2. Si NO hay token...
  if (!token) {
    // 3. ...redirige al usuario a la página de login.
    // 'replace' evita que pueda volver con el botón de "atrás".
    return <Navigate to="/login" replace />;
  }

  // 4. Si SÍ hay token, simplemente muestra el contenido que debe proteger
  // (en tu caso, el <Layout />)
  return children;
};

export default PrivateRoute;