import { useState, useEffect, useRef } from "react";
import Loader from "../../../components/loader/loader"; // Importa el componente Loader
import ConfirmationDialog from "../../../components/confirmateMensaje/messageConfirmeto";
import "./users.css"; // Importa el archivo CSS

const UsersList = () => {
  const [users, setUsers] = useState([]); // Lista de usuarios obtenidos del backend
  const [filteredUsers, setFilteredUsers] = useState([]); // Lista filtrada de usuarios
  const [phoneFilter, setPhoneFilter] = useState(""); // Filtro por número de teléfono
  const [statusFilter, setStatusFilter] = useState(""); // Filtro por estado de compra
  const [paidFilter, setPaidFilter] = useState(""); // Filtro por estado de pago
  const [formData, setFormData] = useState({}); // Almacena los datos de edición de cada usuario
  const [showPurchases, setShowPurchases] = useState({}); // Estado para manejar la visibilidad de las compras de cada usuario
  const [loading, setLoading] = useState(false); // Estado para manejar el loader
  const [successMessage, setSuccessMessage] = useState(""); // Estado para manejar el mensaje de éxito

  const [showConfirmation, setShowConfirmation] = useState(false); // Estado para manejar la visibilidad del mensaje de confirmación
  const [confirmationMessage, setConfirmationMessage] = useState(""); // Mensaje de confirmación
  const [confirmationCallback, setConfirmationCallback] = useState(null); // Callback a ejecutar en la confirmación
  const fetchLock = useRef(false); // evitar multiples render

  // Obtener la lista de usuarios desde el backend al cargar el componente
  useEffect(() => {
    if (fetchLock.current) return; // Evitar múltiples solicitudes
    fetchLock.current = true; // Bloquear futuras solicitudes
    const fetchUsers = async () => {
      setLoading(true); // Mostrar el loader
      const urlApi = import.meta.env.VITE_BACKEND_URL;
      try {
        const response = await fetch(`${urlApi}/users`);
        if (!response.ok) throw new Error("Error al obtener usuarios");
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
        setLoading(false); // Mostrar el loader
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
  }, []);

  // Aplicar filtros en la lista de usuarios
  useEffect(() => {
    let filtered = users;

    if (phoneFilter) {
      filtered = filtered.filter((user) => user.numPhone.includes(phoneFilter));
    }

    if (statusFilter) {
      filtered = filtered.filter((user) =>
        user.purchases?.some((purchase) => purchase.status === statusFilter)
      );
    }

    if (paidFilter) {
      const paidValue = paidFilter === "true";
      filtered = filtered.filter((user) =>
        user.purchases?.some((purchase) => purchase.paid === paidValue)
      );
    }

    setFilteredUsers(filtered);
  }, [phoneFilter, statusFilter, paidFilter, users]);

  // Manejar cambios en los inputs de edición
  const handleInputChange = (
    e,
    userId,
    field,
    purchaseId = null,
    statusField = null
  ) => {
    const value = e.target.value;
    const formattedValue = statusField === "paid" ? value === "true" : value;

    setFormData((prev) => {
      if (purchaseId && statusField) {
        // Obtener usuario actual del estado
        const currentUser = users.find((u) => u._id === userId);
        const originalPurchases = currentUser?.purchases || [];

        // Clonar compras existentes si no están en formData
        const prevPurchases = prev[userId]?.purchases
          ? [...prev[userId].purchases]
          : [...originalPurchases];

        // Actualizar la compra específica
        const updatedPurchases = prevPurchases.map((purchase) =>
          purchase._id === purchaseId
            ? { ...purchase, [statusField]: formattedValue }
            : purchase
        );

        return {
          ...prev,
          [userId]: {
            ...prev[userId],
            purchases: updatedPurchases,
          },
        };
      }

      // Para campos de usuario
      return {
        ...prev,
        [userId]: {
          ...prev[userId],
          [field]: value,
        },
      };
    });
  };

  // Guardar los cambios del usuario en el backend
  const handleSaveUser = async (user) => {
    setLoading(true); // Mostrar el loader
    try {
      const updatedData = { ...user, ...formData[user._id] };

      const productsToUpdate = (formData[user._id]?.purchases || []).map(
        (updatedPurchase) => {
          const purchase = user.purchases.find(
            (p) => p._id === updatedPurchase._id
          );
          return purchase
            ? {
                productId: purchase._id,
                productName: purchase.productName,
                status: updatedPurchase.status,
                paid: updatedPurchase.paid,
              }
            : purchase;
        }
      );

      const urlApi = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${urlApi}/users/update/${user.numPhone}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...updatedData,
          productsToUpdate,
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar usuario");

      // Actualizar el estado de usuarios con los datos actualizados
      const updatedUsers = users.map((u) =>
        u._id === user._id
          ? { ...u, ...updatedData, purchases: productsToUpdate }
          : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      // Limpiar el estado después de guardar
      setFormData((prev) => ({
        ...prev,
        [user._id]: {}, // Limpiar los datos de ese usuario
      }));

      // Mostrar el mensaje de éxito
      setSuccessMessage("Usuario actualizado con éxito");
      setTimeout(() => setSuccessMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
    } catch (error) {
      console.error(error);
      alert("Error al actualizar usuario");
    } finally {
      setLoading(false); // Ocultar el loader
    }
  };

  // Guardar cambios en las compras
  const handleSavePurchases = async (user) => {
    setLoading(true); // Mostrar el loader
    try {
      const updatedPurchases = user.purchases.map((purchase) => ({
        ...purchase,
        ...formData[user._id]?.purchases?.find(
          (item) => item._id === purchase._id
        ),
      }));

      const productsToUpdate = updatedPurchases.map((purchase) => ({
        productId: purchase._id,
        productName: purchase.productName,
        status: purchase.status,
        paid: purchase.paid,
      }));
      const urlApi = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(
        `${urlApi}/users/update-purchases/${user.numPhone}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productsToUpdate,
          }),
        }
      );

      if (!response.ok) throw new Error("Error al actualizar compras");

      // Actualizar el estado de usuarios con las compras actualizadas
      const updatedUsers = users.map((u) =>
        u._id === user._id ? { ...u, purchases: updatedPurchases } : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      // Limpiar el estado después de guardar
      setFormData((prev) => ({
        ...prev,
        [user._id]: {}, // Limpiar los datos de compras
      }));

      // Mostrar el mensaje de éxito
      setSuccessMessage("Compras actualizadas con éxito");
      setTimeout(() => setSuccessMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
    } catch (error) {
      console.error(error);
      alert("Error al actualizar compras");
    } finally {
      setLoading(false); // Ocultar el loader
    }
  };
  //solicitar hacer el reporte de las ventas
  const handleReportSale = async () => {
    try {
      const urlApi = import.meta.env.VITE_BACKEND_URL; // Obtiene la URL base del backend
      const response = await fetch(`${urlApi}/whatsapp/send-sale-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Tipo de contenido
        },
      });
      const updatedData = await response.json(); // Obtiene los datos actualizados
      console.log("Reporte de venta enviado con éxito:", updatedData); // Log para confirmar el éxito
    } catch (error) {
      console.error("Error al enviar el reporte de venta:", error); // Maneja el error de la solicitud
    }
  };

  // Función para alternar la visibilidad de las compras y aplicar filtros
  const togglePurchasesVisibility = (userId) => {
    setShowPurchases((prev) => ({
      ...prev,
      [userId]: !prev[userId], // Cambia el estado de visibilidad
    }));
  };
  // Función para mostrar el diálogo de confirmación
  const showConfirmationDialog = (mensaje, callback) => {
    setConfirmationMessage(mensaje);
    setConfirmationCallback(() => callback);
    setShowConfirmation(true);
  };

  // Función para confirmar la acción
  const handleConfirmAction = () => {
    if (confirmationCallback) {
      confirmationCallback();
    }
    setShowConfirmation(false);
  };

  // Función para cancelar la acción
  const handleCancelAction = () => {
    setShowConfirmation(false);
    setConfirmationCallback(null);
  };

  // Función para obtener las compras filtradas de un usuario
  const getFilteredPurchases = (user) => {
    return user.purchases.filter((purchase) => {
      const statusMatch = statusFilter
        ? purchase.status === statusFilter
        : true;
      const paidMatch = paidFilter
        ? purchase.paid === (paidFilter === "true")
        : true;
      return statusMatch && paidMatch;
    });
  };
  // Función para calcular el total de las compras filtradas de un usuario
  const calculateTotalFilteredPurchases = (user) => {
    return getFilteredPurchases(user).reduce(
      (total, purchase) => total + purchase.price,
      0
    );
  };
  return (
    <>
      <h1 className="title_user-app">Lista de Usuarios</h1>
      <div className="container-report">
      <p>aqui puedes realizar el reporte para los datos de entrega</p>
        <button
          onClick={() => {
            const mensaje = "¿Quires realizar el reporte?";
            showConfirmationDialog(mensaje, () => handleReportSale());
          }}
          className="save-btn report-btn"
        >
          Ralizar Reporte
        </button>
      </div>
      

      <div className="container">
        {/* Filtro por número de teléfono */}
        <div className="filter">
          <input
            type="text"
            placeholder="Filtrar por número de teléfono"
            value={phoneFilter}
            onChange={(e) => setPhoneFilter(e.target.value)}
            className="input"
          />
        </div>
        <div className="Container_filter">
          {/* Filtro por estado de compra */}
          <div className="filter">
            <label>
              Estado:
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="bodega">Bodega</option>
                <option value="entregado">Entregado</option>
              </select>
            </label>
          </div>

          {/* Filtro por estado de pago */}
          <div className="filter">
            <label>
              Pago:
              <select
                value={paidFilter}
                onChange={(e) => setPaidFilter(e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="true">Pagado</option>
                <option value="false">No Pagado</option>
              </select>
            </label>
          </div>
        </div>

        {/* Loader */}
        {loading && (
          <div className="loader-overlay">
            <Loader />
          </div>
        )}
        {showConfirmation && (
          <ConfirmationDialog
            message={confirmationMessage}
            onConfirm={handleConfirmAction}
            onCancel={handleCancelAction}
          />
        )}

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {/* Lista de usuarios filtrados */}
        {filteredUsers.map((user) => (
          <div key={user._id} className="user-card">
            <p>Teléfono: {user.numPhone}</p>
            <div className="user-fields">
              {/* Campos de edición de usuario */}
              <input
                type="text"
                value={formData[user._id]?.name ?? user.name ?? ""}
                onChange={(e) => handleInputChange(e, user._id, "name")}
                placeholder="Nombre"
                className="input"
              />
              <input
                type="text"
                value={formData[user._id]?.address ?? user.address ?? ""}
                onChange={(e) => handleInputChange(e, user._id, "address")}
                placeholder="Dirección"
                className="input"
              />
              <input
                type="text"
                value={
                  formData[user._id]?.neighborhood ?? user.neighborhood ?? ""
                }
                onChange={(e) => handleInputChange(e, user._id, "neighborhood")}
                placeholder="Barrio"
                className="input"
              />
              <input
                type="text"
                value={formData[user._id]?.locality ?? user.locality ?? ""}
                onChange={(e) => handleInputChange(e, user._id, "locality")}
                placeholder="Localidad"
                className="input"
              />
              <select
                value={formData[user._id]?.role ?? user.role ?? ""}
                onChange={(e) => handleInputChange(e, user._id, "role")}
                className="input"
              >
                <option value="administrador">Administrador</option>
                <option value="trabajador">Trabajador</option>
                <option value="comprador">Comprador</option>
              </select>
              <button
                onClick={() => {
                  const mensaje = "¿Quieres guardar los datos del usuario?";
                  showConfirmationDialog(mensaje, () => handleSaveUser(user));
                }}
                className="save-btn"
              >
                Guardar Datos de Usuario
              </button>
            </div>
            <p>
              Este es el Valor apagar:{" "}
              <strong>{calculateTotalFilteredPurchases(user)}</strong>
            </p>

            {/* Botón para mostrar/ocultar compras */}
            <button
              onClick={() => togglePurchasesVisibility(user._id)}
              className="toggle-btn"
            >
              {showPurchases[user._id] ? "Ocultar Compras" : "Ver Compras"}
            </button>

            {/* Mostrar las compras si el botón fue presionado */}
            {showPurchases[user._id] && user.purchases && (
              <div className="user-purchases">
                <h3>Compras</h3>
                <p>
                  Este es el Valor apagar:{" "}
                  <strong>{calculateTotalFilteredPurchases(user)}</strong>
                </p>
                <div className="contec_purchase">
                  {getFilteredPurchases(user).length > 0 ? (
                    getFilteredPurchases(user).map((purchase) => (
                      <div key={purchase._id} className="purchase-item">
                        <img
                          src={purchase.urlProduct}
                          alt={purchase.productName}
                          className="purchase-image"
                        />
                        <p>
                          <strong>Producto</strong> {purchase.productName}
                        </p>
                        <p>
                          <strong>Precio:</strong> ${purchase.price}
                        </p>
                        <p>
                          <strong>Fecha de compra:</strong>{" "}
                          {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Hora de compra:</strong>{" "}
                          {purchase.purchaseTime}
                        </p>

                        <div>
                          <label>Status: </label>
                          <select
                            value={
                              formData[user._id]?.purchases?.find(
                                (item) => item._id === purchase._id
                              )?.status ?? purchase.status
                            }
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                user._id,
                                "purchases",
                                purchase._id,
                                "status"
                              )
                            }
                          >
                            <option value="bodega">Bodega</option>
                            <option value="entregado">Entregado</option>
                          </select>
                        </div>
                        <div>
                          <label>Paid: </label>
                          <select
                            value={String(
                              formData[user._id]?.purchases?.find(
                                (item) => item._id === purchase._id
                              )?.paid ?? purchase.paid
                            )}
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                user._id,
                                "purchases",
                                purchase._id,
                                "paid"
                              )
                            }
                          >
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No hay compras disponibles</p>
                  )}
                </div>

                {/* Botón para guardar cambios en las compras */}
                <button
                  onClick={() => {
                    const mensaje =
                      "¿Quires guardar los cambios de las compras?";
                    showConfirmationDialog(mensaje, () =>
                      handleSavePurchases(user)
                    );
                  }}
                  className="save-btn"
                >
                  Guardar pagos
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default UsersList;
