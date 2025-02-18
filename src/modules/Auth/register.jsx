import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // Ajusta el path si es necesario
import { ClipLoader } from "react-spinners"; // Importa el spinner de react-spinners
import PhoneInput from "react-phone-input-2"; // importamos el modulo de codigo del pais
import "react-phone-input-2/lib/style.css";
import "./form.css";

const Register = () => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    userName: "",
    password: "",
  });

  const [countryCode, setCountryCode] = useState(""); // Estado para almacenar el código del país
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Usamos el contexto para la autenticación

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhoneChange = (value) => {
    setCountryCode(value); // Almacena el código del país seleccionado
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar cualquier error previo
    setLoading(true); // Mostrar el spinner cuando está cargando

    // Validación de campos
    if (!countryCode) {
      setError("El código del país es obligatorio.");
      setLoading(false);
      return;
    }

    if (!formData.phoneNumber) {
      setError("El número de teléfono es obligatorio.");
      setLoading(false);
      return;
    }

    if (!formData.userName || !formData.password) {
      setError("Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    // Combinar el código del país con el número de teléfono
    const fullPhoneNumber = countryCode + formData.phoneNumber;

    try {
      const url = import.meta.env.VITE_BACKEND_URL; // url de la api
      const response = await fetch(`${url}/users/register-User`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numPhone: fullPhoneNumber, // Se envía el número completo al servidor
          username: formData.userName,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const loginResponse = await fetch(`${url}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.userName,
            password: formData.password,
          }),
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          const userData = {
            token: data.token,
            role: data.user.role,
            numPhone: data.user.numPhone,
            username: data.user.username,
          };

          localStorage.setItem("user", JSON.stringify(userData)); // Guardar el usuario completo
          localStorage.setItem("token", data.token); // Guardar solo el token

          login(userData); // Aquí estamos utilizando la función `login`

          // Redirigir al usuario según su rol
          if (data.user.role === "comprador") {
            navigate("/store");
          }
        } else {
          const loginError = await loginResponse.json();
          setError(loginError.message || "Error en el inicio de sesión");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error en el registro");
      }
    } catch (error) {
      setError("Hubo un error en el registro o inicio de sesión.");
      console.error("Error:", error);
    } finally {
      setLoading(false); // Detener el spinner
    }
  };

  return (
    <div className="container">
      <div className="login-form-container">
        <h2 className="login-form-title">Registro de Usuario</h2>
        {error && <p className="error-message">{error}</p>}
        {loading && <ClipLoader size={50} color="#3498db" />}{" "}
        {/* Spinner de react-spinners */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="container-numPhone">
            <div>
              <PhoneInput
                country={"co"} // País predeterminado (Colombia)
                value={countryCode}
                onChange={handlePhoneChange}
                inputProps={{
                  name: "phoneCode",
                  required: true,
                }}
                enableSearch={true}
                specialLabel=""
              />
            </div>
            <div>
              <label className="text-white">Número de Teléfono:</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Ejemplo: 30175252525"
                className="input-field"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-white">Nombre de Usuario:</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Ingrese su nombre de usuario"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-white">Contraseña:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingrese su contraseña"
              required
              autoComplete="password"
              className="input-field"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
