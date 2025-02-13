import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../../context/AuthContext";
import "./userPurchases.css";

const WarehousePurchases = () => {
  const [products, setProducts] = useState([]);
  const fetchLock = useRef(false);
  const { user } = useContext(AuthContext);
  const numPhone = user.numPhone;

  useEffect(() => {
    if (fetchLock.current) return; // Evitar múltiples solicitudes
    fetchLock.current = true; // Bloquear futuras solicitudes
    const fetchProducts = async () => {
      try {
        const url = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(`${url}/users/purchases/${numPhone}`);
        const data = await response.json();

        if (response.ok) {
          // Filtrar productos con status "bodega"
          const warehouseProducts = data.filter(
            (product) => product.status === "bodega"
          );
          setProducts(warehouseProducts);
        } else {
          console.error("Error al obtener las compras", data);
        }
      } catch (error) {
        console.error("Error al realizar la solicitud:", error);
      }
    };

    fetchProducts();
  }, [numPhone]);

  // productos en bodega
  const productsBodega = products.filter(
    (product) => product.status === "bodega"
  );
  // Calcular el total de los productos en bodega
  const totalValue = products.reduce((acc, product) => acc + product.price, 0);

  return (
    <div className="store-page-container">
      <h1 className="user-purchases-title">Compras en Bodega</h1>

      {products.length > 0 ? (
        <>
          <p className="total-value">
            Total en Bodega: <strong>${totalValue}</strong>
          </p>
          <div className="featured-products">
            {productsBodega.map((product) => (
              <div key={product._id} className="product-card">
                <h3 className="title-prodtc-card">{product.productName}</h3>
                <img
                  src={product.urlProduct}
                  alt={product.name}
                  className="product-image"
                />
                <p>Fecha: {product.purchaseDate.split("T")[0]}</p>
                <p>Hora: {product.purchaseTime}</p>
                <p>ID del Producto: {product.productId}</p>
                <p>
                  <strong>Valor: ${product.price}</strong>
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>No tienes productos en bodega registrados.</p>
      )}
    </div>
  );
};

export default WarehousePurchases;
