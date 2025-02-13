import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"; // Asegúrate de que el CSS esté importado correctamente
import { ClipLoader } from "react-spinners"; // Importa el spinner

const LandingPage = () => {
  const [products, setProducts] = useState([]); // Estado para los productos
  const [loading, setLoading] = useState(true); // Estado para la carga
  const [error, setError] = useState(""); // Estado para el error

  // Función para obtener los productos al cargar la página
  useEffect(() => {
    const fetchProducts = async () => {
      const url = import.meta.env.VITE_BACKEND_URL;
      // Verifica la URL de la API
      try {
        const response = await fetch(`${url}/products`);

        if (response.ok) {
          const data = await response.json();
          setProducts(data); // Guardamos los productos en el estado
        } else {
          setError("Error al obtener los productos.");
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Hubo un problema al cargar los productos.");
      } finally {
        setLoading(false); // Desactivamos el estado de carga
      }
    };

    fetchProducts();
  }, []);

  // Función para obtener productos aleatorios
  const getRandomProducts = (arr, num) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random()); // Desordenar el array
    return shuffled.slice(0, num); // Seleccionar un número específico de productos aleatorios
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <ClipLoader size={50} color="#3498db" />
      </div>
    ); // Mostrar un spinner mientras se obtienen los productos
  }

  if (error) {
    return <div className="error-message">{error}</div>; // Mostrar el error si ocurre alguno
  }

  const randomProducts = getRandomProducts(products, 5); // Tomamos 5 productos aleatorios de la lista

  return (
    <div className="landing-container">
      <h1 className="landing-title">🌟 Bienvenidos a BOMOSHOPPING 🌟</h1>

      <p className="landing-description">
        Nuestro objetivo es ofrecerte productos de excelente calidad a precios
        inigualables, permitiéndote complementar tu outfit y generar un ingreso
        extra. Nos enfocamos en brindarte lo mejor en productos seleccionados,
        adaptados a las últimas tendencias, para que puedas disfrutar de una
        experiencia de compra única.
      </p>

      <h2 className="landing-subtitle">🛍️ ¿Por qué elegirnos?</h2>
      <ul className="landing-list">
        <li>
          🔹 <strong>Calidad Garantizada:</strong> Seleccionamos cuidadosamente
          cada producto para que solo recibas lo mejor.
        </li>
        <li>
          🔹 <strong>Precios Incomparables:</strong> Creemos en ofrecerte
          artículos de alta calidad a precios accesibles.
        </li>
        <li>
          🔹 <strong>Comodidad:</strong> Compra desde la comodidad de tu hogar y
          recibe tus productos de manera rápida y segura.
        </li>
      </ul>

      <h2 className="landing-subtitle">🛒 Productos Destacados</h2>
      <div className="featured-products">
        {randomProducts.length > 0 ? (
          randomProducts.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={product.urlImg}
                alt={product.name}
                className="product-image"
              />
              <h3 className="title-prodtc-card">{product.name}</h3>
              <p>{product.description}</p>
              <p>
                <strong>${product.price}</strong>
              </p>
            </div>
          ))
        ) : (
          <p>No hay productos disponibles en este momento.</p>
        )}
      </div>

      <h2 className="landing-subtitle">💼 Genera Ingresos Extra</h2>
      <p className="landing-description">
        Nuestro modelo de negocio te permite, además de adquirir productos
        increíbles, ganar ingresos extra al ser parte de nuestro grupo de
        ventas. Puedes compartir el enlace de nuestro grupo con tus amigos,
        familiares o seguidores para que más personas se sumen y así tengas
        acceso a mejores dinámicas de ventas. ¡Entre más compartas, más
        oportunidades tienes de aumentar tus ganancias!
      </p>

      <h2 className="landing-subtitle">🔗 Comparte y Crece</h2>
      <p className="landing-description">
        Te pedimos amablemente que compartas el enlace de nuestro grupo para
        aumentar la comunidad. Cuantos más miembros se sumen, mayor será la
        interacción y las oportunidades de compra y venta. ¡Tu apoyo es
        fundamental para crecer juntos!
      </p>

      <h2 className="landing-subtitle">
        🙌 Gracias por confiar en BOMOSHOPPING
      </h2>
      <p className="landing-description">
        ¡Estamos aquí para ayudarte a obtener lo mejor en productos y maximizar
        tus ganancias!
      </p>

      <div className="landing-buttons">
        <Link to="/register" className="landing-link landing-link-register">
          Registrarse
        </Link>
        <Link to="/login" className="landing-link landing-link-login">
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
