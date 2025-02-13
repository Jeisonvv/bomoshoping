import { useState, useEffect, useContext, useRef } from "react";
import Loader from "../../../components/loader/loader"; // Componente personalizado para mostrar un loader
import { AuthContext } from "../../../context/AuthContext"; // Contexto de autenticación para obtener información del usuario
import "./store.css"; // Estilos para la página de la tienda

const StorePage = () => {
  const [products, setProducts] = useState([]); // Lista de productos
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Manejo de errores
  const [selectedProduct, setSelectedProduct] = useState(null); // Producto seleccionado para compra
  const [showModal, setShowModal] = useState(false); // Controla la visibilidad del modal de confirmación
  const [requestLoading, setRequestLoading] = useState(false); // Estado de carga de la solicitud de compra
  const [message, setMessage] = useState(null); // Mensaje de respuesta del servidor
  const [messageType, setMessageType] = useState(null); // Tipo de mensaje (success, error)
  const fetchLock = useRef(false); // Referencia para bloquear múltiples solicitudes de productos
  const { user } = useContext(AuthContext); // Obtener información del usuario desde el contexto
  const numPhone = user.numPhone; // Número de teléfono del usuario

  useEffect(() => {
    if (fetchLock.current) return; // Evitar múltiples solicitudes
    fetchLock.current = true; // Bloquear futuras solicitudes

    const url = import.meta.env.VITE_BACKEND_URL;
    setLoading(true);

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${url}/products`);
        if (!response.ok) {
          throw new Error("No se pudieron cargar los productos");
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSale = async () => {
    const url = import.meta.env.VITE_BACKEND_URL;

    if (!numPhone) {
      alert("No se encontró el número del usuario. Por favor, verifica.");
      return;
    }

    const saleData = {
      urlProduct: selectedProduct.urlImg,
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      price: selectedProduct.price,
      purchaseDate: new Date().toLocaleDateString().split("T")[0],
      purchaseTime: new Date().toLocaleTimeString(),
    };

    setRequestLoading(true);
    try {
      const response = await fetch(`${url}/whatsapp/add-product/${numPhone}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        setMessage("¡Compra registrada con éxito!");
        setMessageType("success");
        if (selectedProduct.countInStock === 1) {
          setTimeout(() => window.location.reload(), 1500);
        }
      } else if (response.status === 500) {
        const errorData = await response.json();
        if (errorData.message === "Artículo no disponible, sin stock") {
          setMessage("❌ Lo lamentamos 😔, el artículo ya se vendió.");
          setMessageType("outofstock");
          setTimeout(() => window.location.reload(), 50000);
        } else {
          setMessage("Error en la compra: Error desconocido");
          setMessageType("error");
          setTimeout(() => window.location.reload(), 3000);
        }
      } else {
        const errorData = await response.json();
        setMessage(
          `Error en la compra: ${errorData.message || "Error desconocido"}`
        );
        setMessageType("error");
      }

      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 50000);

    } catch (error) {
      setMessage(`Error al registrar la compra: ${error.message}`);
      setMessageType("error");
      setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 3000);
    } finally {
      setRequestLoading(false);
      setShowModal(false);
    }
  };

  const handleConfirmPurchase = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const closeMessage = () => {
    setMessage(null);
    setMessageType(null);
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  const generateRandomPercentage = () => {
    const percentages = [];
    for (let i = 10; i <= 50; i += 5) {
      percentages.push(i);
    }
    const randomIndex = Math.floor(Math.random() * percentages.length);
    return percentages[randomIndex] / 100;
  };

  const availableProducts = products.filter(
    (product) => product.countInStock > 0
  );

  return (
    <div className="store-page-container">
      {loading && (
        <div className="overlay">
          <Loader />
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Compra</h2>
            <p>
              ¿Estás seguro de que deseas comprar{" "}
              <strong>{selectedProduct?.name}</strong> por{" "}
              <strong>${selectedProduct?.price}</strong>?
            </p>
            <div className="modal-buttons">
              <button onClick={handleSale} className="confirm-button">
                Confirmar
              </button>
              <button onClick={closeModal} className="cancel-button">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {requestLoading && (
        <div className="overlay">
          <Loader />
        </div>
      )}

      {message && (
        <div className={`message-overlay `}>
          <div className={`message-content ${messageType}`}>
            <p>{message}</p>
            <button onClick={closeMessage}>Cerrar</button>
          </div>
        </div>
      )}

      <h1 className="store-title">Productos en la Tienda</h1>
      <section className="Description-Tienda">
        <p>
          La mayoría de nuestros productos son <strong>únicos</strong>, así que{" "}
          <strong>compra ahora</strong> y asegúrate de llevártelos antes de que
          se agoten.
        </p>
        <p>
          Una vez que completes tu compra, lo verás reflejado en tu lista de
          compras. ✅
        </p>
        <p>
          <strong>Haz tus compras de manera responsable:</strong> no podremos
          eliminar productos de tu lista, y estarás quitando la oportunidad a
          otra persona de adquirirlos. 🤝
        </p>
      </section>

      <section className="Description-Tienda">
        <p>
          🔑 ¡Estamos encantados de tenerte aquí y esperamos que disfrutes tus
          compras al máximo! 😊
        </p>
      </section>

      <div className="container">
        {availableProducts.map((product) => {
          const percentageIncrease = generateRandomPercentage();
          const increasedPrice = (
            product.price *
            (1 + percentageIncrease)
          ).toFixed();

          return (
            <div key={product._id} className="card_store">
              <div className="img-container ">
                <img src={product.urlImg} alt={product.name} />
              </div>
              <div className="card-details">
                <h2 className="">{product.name}</h2>
                <p>{product.description}</p>
                <div>
                  <p className="before-price">
                    Antes:
                    <strong className="strikethrough">
                      {" "}
                      ${increasedPrice}
                    </strong>
                  </p>
                  <p className="now-price ">
                    Ahora: <strong> ${product.price}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleConfirmPurchase(product)}
                className="buton-compra"
              >
                Comprar
              </button>
            </div>
          );
        })}
      </div>
      <p>esperamos allas encontado lo que nesecitavas</p>
    </div>
  );
};

export default StorePage;