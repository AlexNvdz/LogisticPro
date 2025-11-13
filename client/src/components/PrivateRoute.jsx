import React from 'react';
import { Navigate } from 'react-router-dom';

// Este componente protege tus rutas
const PrivateRoute = ({ children }) => {
  
  // 1. Revisa si hay un token guardado en el localStorage
  const token = localStorage.getItem('token');

  // 2. Si NO hay token...
  if (!token) {
    // 3. ...redirige al usuario a la página de login.
    // 'replace' evita que pueda volver a esta página con el botón "atrás"
    return <Navigate to="/login" replace />;
  }

  // 4. Si SÍ hay token, simplemente muestra el contenido que debe proteger
  // (en tu caso, el <Layout />)
  return children;
};

export default PrivateRoute;