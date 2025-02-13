import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PropTypes from 'prop-types';



const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);

  // Si el usuario no está autenticado
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si el rol del usuario no está permitido
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />; // Renderiza el contenido protegido
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};
export default ProtectedRoute;
