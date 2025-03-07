import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Products from './components/Products';
import Orders from './components/Orders';
import Payments from './components/Payments';
import Register from './components/register'; // Importa el componente de Registro
import logo from './assets/logoMG3.png'; // Importa el logo

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Router>
      <header>
        <nav className="navbar">
          <img src={logo} alt="Logo" className="logo" /> {/* Logo a la izquierda */}
          <Link to="/" className="nav-link">Login</Link>
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/orders" className="nav-link">Orders</Link>
          <Link to="/payments" className="nav-link">Payments</Link>
          <Link to="/register" className="nav-link">Register</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Login setLoggedIn={setLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/products" 
          element={loggedIn ? <Products /> : <Navigate to="/" />} 
        />
        <Route 
          path="/orders" 
          element={loggedIn ? <Orders /> : <Navigate to="/" />} 
        />
        <Route 
          path="/payments" 
          element={loggedIn ? <Payments /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
};

export default App;