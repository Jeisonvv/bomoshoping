import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const UserGreeting = () => {
  // Accede al objeto 'user' desde el contexto
  const { user } = useContext(AuthContext);

  // Verifica si el usuario existe y tiene un nombre
  const userName = user && user.username ? user.username : null;

  return userName ? <h2 className='saludo'>Hola, {userName}!</h2> : <h2>Hola, Invitado!</h2>;
};

export default UserGreeting;
