import { Link, useNavigate } from "react-router-dom"; // Importa Link para navegar entre rutas sin recargar la página.
import { useContext, useState } from "react"; // Importa hooks para el manejo de estado y contexto.
import { AuthContext } from "../../context/AuthContext"; // Contexto para manejar la autenticación del usuario.
import BurgerButton from "./burgerButom"; // Componente personalizado para el botón de hamburguesa del menú.
import "./menu.css"; // Archivo de estilos CSS.

const Navbar = () => {
  const { user, logout } = useContext(AuthContext); // Obtiene el estado del usuario y la función de logout desde el contexto.
  const [clicked, setClicked] = useState(false); // Estado para controlar si el menú hamburguesa está abierto o cerrado.
  const navigate = useNavigate(); // Hook para navegación programática.

  // Alterna el estado del menú hamburguesa.
  const handleClick = () => {
    setClicked(!clicked);
  };

  // Cierra el menú hamburguesa.
  const closeMenu = () => setClicked(false);

  // Maneja el cierre de sesión y redirige al home.
  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/"); // Redirige a la página de inicio.
  };

  // Constantes para roles y rutas
  const roles = {
    COMPRADOR: "comprador",
    TRABAJADOR: "trabajador",
    ADMINISTRADOR: "administrador",
  };

  const routes = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    STORE: "/store",
    COMPRAS: "/compras",
    CREATE_PRODUCTS: "/create-products",
    PRODUCTS: "/products",
    USERS: "/usersapp",
    PROFILE: "/profile",
    QR:"/qr"
  };

  return (
    <nav className="navbar">
      <div>
        <p className="nav_logo">BomoShoping</p>
      </div>

      <div className={`nav_items ${clicked ? "active" : ""}`}>
        {!user && ( // Si el usuario no está autenticado, muestra las opciones de inicio de sesión y registro.
          <>
            <Link onClick={closeMenu} to={routes.HOME} className="nav_items_a">
              <p>Inicio</p>
            </Link>
            <Link onClick={closeMenu} to={routes.LOGIN} className="nav_items_a">
              <p>Login</p>
            </Link>
            <Link
              onClick={closeMenu}
              to={routes.REGISTER}
              className="nav_items_a"
            >
              <p>Registrarse</p>
            </Link>
          </>
        )}

        {user &&
          user.role === roles.COMPRADOR && ( // Opciones exclusivas para usuarios con el rol de "comprador".
            <>
              <Link
                onClick={closeMenu}
                to={routes.STORE}
                className="nav_items_a"
              >
                <p>Tienda</p>
              </Link>
              <Link
                onClick={closeMenu}
                to={routes.COMPRAS}
                className="nav_items_a"
              >
                <p>Tus compras</p>
              </Link>
            </>
          )}

        {user &&
          (user.role === roles.TRABAJADOR ||
            user.role === roles.ADMINISTRADOR) && ( // Opciones exclusivas para usuarios con el rol de "trabajador" o "administrador".
            <>
              <Link
                onClick={closeMenu}
                to={routes.CREATE_PRODUCTS}
                className="nav_items_a"
              >
                <p>Crear producto</p>
              </Link>
              <Link
                onClick={closeMenu}
                to={routes.PRODUCTS}
                className="nav_items_a"
              >
                <p>Productos</p>
              </Link>
            </>
          )}

        {user &&
          user.role === roles.ADMINISTRADOR && ( // Opciones exclusivas para usuarios con el rol de "administrador".
            <>
            <Link onClick={closeMenu} to={routes.USERS} className="nav_items_a">
              <p>Usuarios</p>
            </Link>
            </>
            
          )}

        {user && ( // Enlace para cerrar sesión, visible solo si hay un usuario autenticado.
          <>
            <Link
              onClick={closeMenu}
              to={routes.PROFILE}
              className="nav_items_a"
            >
              <p>Perfil</p>
            </Link>
            <Link onClick={handleLogout} className="nav_items_a">
              <p>Cerrar Sesión</p>
            </Link>
          </>
        )}
      </div>

      <div className="burgerbutton">
        <BurgerButton clicked={clicked} handleClick={handleClick} />
      </div>
    </nav>
  );
};

export default Navbar;
