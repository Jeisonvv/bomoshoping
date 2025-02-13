import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';


const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado para controlar la carga
 

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Si existe un usuario guardado, se establece en el estado
    }
    setLoading(false); // Termina la carga después de verificar localStorage
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('numPhone');
  };

  // Si el estado de carga aún está activo, no renderices el resto de la app
  if (loading) {
    return <div>Loading...</div>;  // Puedes mostrar un spinner o algo similar mientras se carga
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { AuthContext, AuthProvider };