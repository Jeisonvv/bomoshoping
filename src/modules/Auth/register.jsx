import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Ajusta el path si es necesario
import { ClipLoader } from 'react-spinners'; // Importa el spinner de react-spinners
import './form.css'

const Register = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    userName: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Usamos el contexto para la autenticación

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar cualquier error previo
    setLoading(true); // Mostrar el spinner cuando está cargando

    if (!formData.phoneNumber || !formData.userName || !formData.password) {
      setError('Todos los campos son obligatorios.');
      setLoading(false); // Detener el spinner si hay error
      return;
    }

    try {
      const url = import.meta.env.VITE_BACKEND_URL // url de la api 
      const response = await fetch(`${url}/users/register-User`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numPhone: formData.phoneNumber,
          username: formData.userName,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const url = import.meta.env.VITE_BACKEND_URL
        const loginResponse = await fetch(`${url}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.userName,
            password: formData.password,
          }),
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          const userData = {
            token: data.token,
            role: data.user.role,
            numPhone: data.user.numPhone,
            username: data.user.username

          };

          localStorage.setItem('user', JSON.stringify(userData)); // Guardar el usuario completo
          localStorage.setItem('token', data.token); // Guardar solo el token

          login(userData); // Aquí estamos utilizando la función `login`

          // Redirigir al usuario según su rol
          if (data.user.role === 'comprador') {
            navigate('/store');
          } else if (data.user.role === 'trabajador') {
            navigate('/worker-dashboard');
          } else if (data.user.role === 'admin') {
            navigate('/admin-dashboard');
          }
        } else {
          const loginError = await loginResponse.json();
          setError(loginError.message || 'Error en el inicio de sesión');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error en el registro');
      }
    } catch (error) {
      setError('Hubo un error en el registro o inicio de sesión.');
      console.error('Error:', error);
    } finally {
      setLoading(false); // Detener el spinner
    }
  };

  return (
    <div className="container">
      <div className="login-form-container">
        <h2 className='login-form-title'>Registro de Usuario</h2>
        {error && <p className="error-message">{error}</p>}
        {loading && <ClipLoader size={50} color="#3498db" />} {/* Spinner de react-spinners */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
             <label className='text-white'>Número de Teléfono    con el código de país:</label>
             <input
               type="tel"
               name="phoneNumber"
               value={formData.phoneNumber}
               onChange={handleChange}
               placeholder="Ejemplo: 573015252525"
               className='input-field'
               required
             />
          </div>
          <div>
          <label className='text-white'>Nombre de Usuario:</label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="Ingrese su nombre de usuario"
            className='input-field'
          />
          
          </div>
          <div>
          <label className='text-white'>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Ingrese su contraseña"
            required
            autoComplete="password"
            className='input-field'
          />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className='submit-button'
          >
            
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
