import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/login.css"; // Usa el mismo estilo del login

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://logisticpro.onrender.com/auth/register", {
        name,
        email,
        password,
      });
      navigate("/login");
    } catch (err) {
      setError("Error al registrar el usuario");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🚚 LogisticPro</h1>
          <p>Crear una nueva cuenta</p>
        </div>
        <form onSubmit={handleRegister} className="login-form">
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <button type="submit">Registrarse</button>
        </form>
        <div className="login-footer">
          <p>¿Ya tienes una cuenta?</p>
          <button className="register-btn" onClick={() => navigate("/login")}>
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
