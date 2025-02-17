
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Importa BrowserRouter correctamente
import { AuthProvider } from './context/AuthContext'; 
import LandingPage from './modules/Landing/LandingPage'; 
import LoginPage from './modules/Auth/loginPage'; 
import StorePage from './modules/pages/store/store';
import ProtectedRoute from './routers/ProtectedRoute'; // Asegúrate de importar el ProtectedRoute
import WarehousePurchases from './modules/pages/puchers/userPucher';
import Register from './modules/Auth/register';
import Navbar from './modules/menus/menu';
import UserGreeting from './components/saludo'
import CreateProductForm from './modules/pages/createProduct/createProducts';
import Qr from './modules/pages/qr/qr'
import Products from './modules/pages/product/product'
import Users from './modules/pages/alluser/userapp';
import Profile from './modules/pages/profile/profile'

import './app.css'

const App = () => {
  const userRole = localStorage.getItem('role');

  return (
    <BrowserRouter> {/* Usa BrowserRouter directamente */}
      <AuthProvider>
        <Navbar userRole={userRole} /> {/* Renderiza el menú con el rol del usuario */}
        <UserGreeting/>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          


          {/* Ruta protegida para /store */}
          <Route element={<ProtectedRoute allowedRoles={['comprador', 'trabajador', 'administrador']} />}>
            <Route path="/store" element={<StorePage />} />
            <Route path="/compras" element={<WarehousePurchases />} />
            <Route path="/profile" element={<Profile />} />
            
          </Route>

          {/*rutas para los trabajadores*/ }
          <Route element={<ProtectedRoute allowedRoles={[ 'trabajador', 'administrador']} />}>
            <Route path='/create-products' element={<CreateProductForm/>}/>
            <Route path='/products' element={<Products/>}/>
            <Route path='/usersapp' element={<Users/>}/>
          </Route>

          {/*rutas para los administradores*/ }
          <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
            <Route path='/create-products' element={<CreateProductForm/>}/>
            <Route path='/products' element={<Products/>}/>
            <Route path="/qr" element={<Qr/>} />
          </Route>
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
