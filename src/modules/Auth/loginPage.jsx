import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Ajusta el path si es necesario
import './form.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext); // Usar el contexto
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Por favor, ingresa tu nombre de usuario y contraseña');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const url = import.meta.env.VITE_BACKEND_URL
      const userData = { username, password };
      const response = await fetch(`${url}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          token: data.token,
          role: data.user.role,
          numPhone: data.user.numPhone,
          username: data.user.username
        };

        localStorage.setItem('user', JSON.stringify(userData)); // Aquí se guarda todo el usuario
        localStorage.setItem('token', data.token); // Aquí solo el token

        // Guardar token y rol en el contexto y localStorage
        login(userData);

        localStorage.setItem('token', data.token);

        // Redirección basada en rol
        if (data.user.role === 'comprador') {
          navigate('/store');
        } else if (data.user.role === 'trabajador') {
          navigate('/create-products');
        } else if (data.user.role === 'administrador') {
          navigate('/usersapp');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error en el inicio de sesión');
      }
    } catch (error) {
      setError('Error de conexión o servidor', );
      console.error('Error en la solicitud:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-form-container">
        <h2 className="login-form-title">Iniciar Sesión</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="text-white">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-white">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              autoComplete="password"
            />
          </div>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
        <p className="register-link">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-500">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
