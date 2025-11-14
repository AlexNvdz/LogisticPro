// client/src/tests/Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../pages/login'; // Asegúrate que la ruta sea correcta
import { BrowserRouter } from 'react-router-dom';

// --- MOCK 1: Mockeando 'axios' ---
// Le decimos a Vitest que intercepte cualquier llamada a 'axios'
vi.mock('axios', () => ({
  // Mockeamos el 'default' porque así se importa (import axios from 'axios')
  default: {
    // Mockeamos la función 'post'
    post: vi.fn(),
  },
}));

// --- MOCK 2: Mockeando 'react-router-dom' ---
// Necesitamos un "espía" (mock) para 'useNavigate' para saber si fue llamado
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal(); // Importa el original
  return {
    ...actual, // Mantenemos todo lo original (como BrowserRouter)
    useNavigate: () => mockNavigate, // ...pero reemplazamos 'useNavigate'
  };
});

// Agrupamos las pruebas del componente Login
describe('Pruebas del Componente Login', () => {

  // --- PRUEBA UNITARIA 1 ---
  it('Debe renderizar el formulario de login correctamente', () => {
    // Renderizamos el componente (envuelto en BrowserRouter)
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Verificamos que los elementos existan (Usando matchers de testing-library)
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  // --- PRUEBA DE INTEGRACIÓN 1 (CON MOCKS Y PROMESAS) ---
  it('Debe iniciar sesión y navegar al dashboard si las credenciales son correctas', async () => {
    // 1. Preparamos el mock de axios
    // Le decimos a axios.post que cuando sea llamado, devuelva esto:
    const mockResponse = {
      data: {
        token: 'fake-jwt-token-123',
        user: { isadmin: true }
      }
    };
    // Importamos axios DESPUÉS de mockearlo
    const axios = (await import('axios')).default;
    axios.post.mockResolvedValue(mockResponse); // Le decimos que resuelva la promesa

    // 2. Renderizamos el componente
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // 3. Simulamos la interacción del usuario
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const loginButton = screen.getByRole('button', { name: 'Iniciar sesión' });

    await userEvent.type(emailInput, 'admin@test.com');
    await userEvent.type(passwordInput, 'admin123');
    await userEvent.click(loginButton);

    // 4. Verificamos los resultados (Manejo de Promesas)
    // Usamos 'waitFor' para esperar a que todas las promesas (axios, navigate) se resuelvan
    await waitFor(() => {
      // Verificamos que axios.post fue llamado con los datos correctos
      expect(axios.post).toHaveBeenCalledWith(
        'https://logisticpro.onrender.com/auth/login',
        {
          email: 'admin@test.com',
          password: 'admin123',
        }
      );
    });

    // Verificamos que el 'mockNavigate' fue llamado, enviando al usuario a '/'
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});