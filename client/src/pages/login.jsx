import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"; // 👈 Asegúrate de tener el CSS en src/pages/login.css

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://logisticpro.onrender.com/auth/login", {
        email,
        password,
      });

      console.log("🟩 Login response:", res.data);

      const token = res.data.token;
      
      // --- CAMBIO 1: Leer 'isadmin' de la respuesta ---
      // (Usamos '?? false' por si acaso el backend no lo envía)
      const isadmin = res.data.user?.isadmin ?? false;

      // --- CAMBIO 2: Guardar 'isadmin' en localStorage ---
      localStorage.setItem("token", token);
      localStorage.setItem("isadmin", isadmin); // (Usamos 'isadmin' minúscula)

      // --- CAMBIO 3: Actualizar el log ---
      console.log("✅ Token y Admin status guardados:", token, isadmin);

      navigate("/");
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      setError("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🚚 LogisticPro</h1>
          <p>Inicia sesión para continuar</p>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Iniciar sesión</button>
        </form>
        <div className="login-footer">
          <p>¿No tienes una cuenta?</p>
          <button
            className="register-btn"
            type="button"
            onClick={() => navigate("/register")}
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}
