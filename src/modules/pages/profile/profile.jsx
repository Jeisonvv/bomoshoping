import { useState, useEffect, useRef, useContext } from "react"; 
import { AuthContext } from "../../../context/AuthContext"; 
import ConfirmationDialog from "../../../components/confirmateMensaje/messageConfirmeto"; 
import Notification from "../../../components/respustaapi/Notification"; 

const Profile = () => {
  const [dataUser, setDataUser] = useState({
    name: "", 
    numPhone: "", 
    email: "", 
    address: "", 
    locality: "", 
    neighborhood: "", 
  });

  const [credentials, setCredentials] = useState({
    username: "", 
    password: "", 
  });

  const [showConfirmation, setShowConfirmation] = useState(false); 
  const [confirmationMessage, setConfirmationMessage] = useState(""); 
  const [confirmationCallback, setConfirmationCallback] = useState(null); 
  const [notification, setNotification] = useState({ message: "", type: "" });

  const fetchLock = useRef(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (fetchLock.current) return; 
    fetchLock.current = true; 

    const fetchUser = async () => {
      try {
        const url = import.meta.env.VITE_BACKEND_URL; 
        const response = await fetch(`${url}/users/${user.numPhone}`); 
        const data = await response.json(); 

        setDataUser({
          name: data.name || "", 
          numPhone: data.numPhone || "", 
          email: data.email || "", 
          address: data.address || "", 
          locality: data.locality || "", 
          neighborhood: data.neighborhood || "", 
        });
      } catch (error) {
        console.error("Error fetching user data:", error); 
      }
    };

    fetchUser(); 
  }, [user]);

  const handleChangeUser = (e) => {
    const { name, value } = e.target;
    setDataUser((prevState) => ({
      ...prevState, 
      [name]: value !== undefined ? value : "", // Ensure value is never undefined
    }));
  };

  const handleChangeCredentials = (e) => {
    const { name, value } = e.target;
    setCredentials((prevState) => ({
      ...prevState, 
      [name]: value !== undefined ? value : "", // Ensure value is never undefined
    }));
  };

  const showConfirmationDialog = (message, callback) => {
    setConfirmationMessage(message); 
    setConfirmationCallback(() => callback); 
    setShowConfirmation(true); 
  };

  const handleConfirmAction = () => {
    if (confirmationCallback) {
      confirmationCallback(); 
    }
    setShowConfirmation(false); 
  };

  const handleCancelAction = () => {
    setShowConfirmation(false); 
    setConfirmationCallback(null); 
  };

  const handleSubmitUser = (e) => {
    e.preventDefault(); 
    showConfirmationDialog("¿Estás seguro de que deseas guardar los datos?", async () => {
      try {
        const url = import.meta.env.VITE_BACKEND_URL; 
        const response = await fetch(`${url}/users/update/${user.numPhone}`, {
          method: "PUT", 
          headers: {
            "Content-Type": "application/json", 
          },
          body: JSON.stringify(dataUser), 
        });
        const updatedData = await response.json(); 
        setDataUser(updatedData); 
        setNotification({ message: "Datos actualizados correctamente", type: "success" });
      } catch (error) {
        console.error("Error updating user data:", error); 
        setNotification({ message: "Hubo un error al actualizar los datos", type: "error" });
      }
    });
  };

  const handleSubmitCredentials = (e) => {
    e.preventDefault(); 
    showConfirmationDialog("¿Estás seguro de que deseas actualizar las credenciales?", async () => {
      try {
        const url = import.meta.env.VITE_BACKEND_URL; 
        const response = await fetch(
          `${url}/users/update-credentials/${user.numPhone}`,
          {
            method: "PUT", 
            headers: {
              "Content-Type": "application/json", 
            },
            body: JSON.stringify(credentials), 
          }
        );
        const updatedCredentials = await response.json(); 
        setCredentials(updatedCredentials); 
        setNotification({ message: "Credenciales actualizadas correctamente", type: "success" });
      } catch (error) {
        console.error("Error updating credentials:", error); 
        setNotification({ message: "Hubo un error al actualizar las credenciales", type: "error" });
      }
    });
  };

  return (
    <div>
      <h1>Perfil de Usuario</h1> 
      <div className="login-form-container"> 
        <h2 className="login-form-title">DATOS DE ENTREGA</h2> 
        {dataUser && (
          <form onSubmit={handleSubmitUser} className="space-y-4"> 
            <div>
              <label>Nombres y Apellidos</label> 
              <input
                type="text"
                name="name"
                value={dataUser.name}
                onChange={handleChangeUser}
                autoComplete="name"
                className="input-field"
              />
            </div>
            <div>
              <label>Dirección</label> 
              <input
                type="text"
                name="address"
                value={dataUser.address}
                onChange={handleChangeUser}
                autoComplete=""
                className="input-field"
              />
            </div>
            <div>
              <label>Barrio</label> 
              <input
                type="text"
                name="neighborhood"
                value={dataUser.neighborhood}
                onChange={handleChangeUser}
                autoComplete="address-level3"
                className="input-field"
              />
            </div>
            <button type="submit" className="submit-button"> 
              Guardar cambios
            </button>
          </form>
        )}
      </div>
      <div className="login-form-container"> 
        <h2 className="login-form-title">Actualizar Credenciales</h2> 
        {credentials && (
          <form onSubmit={handleSubmitCredentials}> 
            <div>
              <label>Nombre de Usuario</label> 
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChangeCredentials}
                autoComplete="username"
                className="input-field"
                placeholder="EJEMPLO (alias1235)"
              />
            </div>
            <div>
              <label>Contraseña</label> 
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChangeCredentials}
                autoComplete="current-password"
                className="input-field"
              />
            </div>
            <button type="submit" className="submit-button"> 
              Actualizar Credenciales
            </button>
          </form>
        )}
      </div>
      {showConfirmation && (
        <ConfirmationDialog
          message={confirmationMessage} 
          onConfirm={handleConfirmAction} 
          onCancel={handleCancelAction} 
        />
      )}
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: "", type: "" })} 
      />
    </div>
  );
};

export default Profile; 