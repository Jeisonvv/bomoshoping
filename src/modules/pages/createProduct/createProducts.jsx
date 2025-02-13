import { useState } from 'react';
import Loader from '../../../components/loader/loader';
import '../../Auth/form.css';
import './createProducts.css';

const CreateProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    urlImg: '',
    countInStock: '1',
  });

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMessageTimeout = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const validateFields = () => {
    return Object.values(formData).every((field) => field.trim() !== '');
  };

  

  const handleAction = async (endpoint) => {
    if (!validateFields()) {
      handleMessageTimeout('Todos los campos son obligatorios.');
      return;
    }
  
    setIsLoading(true);
  
    try {
      const urlApi = import.meta.env.VITE_BACKEND_URL;
  
      // Limpia la URL de la imagen
      const cleanFormData = {
        ...formData,
        price: Number(formData.price),
        countInStock: Number(formData.countInStock),
      };
  
      const response = await fetch(`${urlApi}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanFormData),
      });
  
      const data = await response.json();
      if (response.ok) {
        handleMessageTimeout('Operación realizada con éxito.');
        setFormData({ name: '', price: '', description: '', urlImg: '', countInStock: '1' });
      } else {
        handleMessageTimeout(`Error: ${data.message || 'Error al procesar la solicitud.'}`);
      }
    } catch (error) {
      handleMessageTimeout('Error en la conexión con el servidor.', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="container form-layout">
      <div className="contec-img">
        {formData.urlImg ? (
          <img src={formData.urlImg} alt="Vista previa" className="preview-image"  />
        ) : (
          <p className="placeholder-text">Previsualización de la imagen</p>
        )}
      </div>
      <div className="login-form-container">
        {isLoading && (
          <div className="overlay">
            <Loader />
          </div>
        )}
        <h2 className="login-form-title">Crear Producto</h2>
        {message && <p className="mb-4 text-center text-green-600">{message}</p>}
        <form className="space-y-4">
          <div>
            <input
              type="text"
              name="urlImg"
              value={formData.urlImg}
              onChange={handleChange}
              className="input-field input-create"
              placeholder="URL de Imagen"
              required
            />
          </div>
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field input-create"
              placeholder="Nombre del producto"
              required
            />
          </div>
          <div>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="input-field input-create"
              placeholder="Precio"
              required
            />
          </div>
          <div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field input-create"
              placeholder="Descripcion"
              required
            />
          </div>
          <div>
            <input
              type="number"
              name="countInStock"
              value={formData.countInStock}
              onChange={handleChange}
              className="input-field input-create"
              placeholder="Cantidad en Inventario"
              required
              min="1"
            />
          </div>
          <div className="container-button-form">
            <button type="button" onClick={() => handleAction('/products')} className="submit-button">
              Crear Producto
            </button>
            <button type="button" onClick={() => handleAction('/whatsapp/send')} className="submit-button send-menssage">
              Enviar Mensaje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductForm;
