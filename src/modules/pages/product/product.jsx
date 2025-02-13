import { useState, useEffect, useRef } from "react";
import Loader from "../../../components/loader/loader";
import "./products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blocking, setBlocking] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState("");

  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    const urlApi = import.meta.env.VITE_BACKEND_URL;
    setLoading(true);

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${urlApi}/products`);
        if (!response.ok) {
          throw new Error("No se pudieron obtener los productos");
        }
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data); // Inicializa con todos los productos
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleForwardProduct = async () => {
    setBlocking(true);
    setLoading(true); // Mostrar el estado de carga al confirmar
    setConfirmVisible(false); // Ocultar el estado de confirmación al confirmar
    try {
      const product = products.find(p => p._id === selectedProduct);
      const urlApi = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(
        `${urlApi}/whatsapp/forward-product/${selectedProduct}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Error al reenviar el producto");
      }

      setNotification({
        type: "success",
        message: "Producto reenviado con éxito",
      });

      if (product.countInStock === 0) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }

      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setNotification(null);
      }, 2000);

    } catch (error) {
      setNotification({ type: "error", message: `Error: ${error.message}` });
    } finally {
      setBlocking(false);
      setLoading(false); // Ocultar el estado de carga después de la operación
    }
  };

  const showConfirmation = (productId) => {
    setSelectedProduct(productId);
    setConfirmVisible(true);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const applyFilter = () => {
    if (filter === "withStock") {
      setFilteredProducts(
        products.filter((product) => product.countInStock > 0)
      );
    } else if (filter === "withoutStock") {
      setFilteredProducts(
        products.filter((product) => product.countInStock === 0)
      );
    } else {
      setFilteredProducts(products);
    }
  };

  return (
    <div>
      {loading && (
        <div className="loader-overlay">
          <Loader />
        </div>
      )}

      {error && <p>Error: {error}</p>}
      <div className="Description-producto">
      <h1>TODOS LOS PRODUCTOS DE BOMOSHOPING</h1>
      <p>
        {" "}
        📲 Aquí podrás reenviar todos los mensajes al grupo de WhatsApp,
        ahorrando tiempo ⏳ y evitando tener que crearlos nuevamente. 🚀 Además,
        el stock se incrementa automáticamente en uno 🔄📦{" "}
        <strong> si el producto no tiene stock</strong> si tiene stock lo envia
        con el mismo.{" "}
      </p>
      </div>
      

      <div className="filter-container">
        <select
          value={filter}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">Todos</option>
          <option value="withStock">Con Stock</option>
          <option value="withoutStock">Sin Stock</option>
        </select>
        <button onClick={applyFilter} className="button">
          Filtrar
        </button>
      </div>

      {blocking && <div className="overlay"></div>}

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {confirmVisible && (
        <div className="confirm-modal">
          <p>¿Estás seguro de reenviar este producto?</p>
          <div className="confirm-buttons">
            <button onClick={handleForwardProduct} className="button">
              Confirmar
            </button>
            <button
              onClick={() => setConfirmVisible(false)}
              className="delete-confirmation"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="contec-card">
        {filteredProducts.map((product) => (
          <div key={product._id} className="card">
            <div className="contec-img-card">
              <img
                src={product.urlImg}
                alt={product.name}
                className="card_img"
              />
            </div>
            <p>{product.name}</p>
            <p>{product.price}</p>
            <p>{product.description}</p>
            <p>{product.countInStock}</p>
            <button
              onClick={() => showConfirmation(product._id)}
              className="button"
            >
              Reenviar Producto
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
