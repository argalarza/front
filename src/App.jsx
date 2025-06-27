import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Products from './components/Products';
import Orders from './components/Orders';
import Payments from './components/Payments';
import Register from './components/register';
import EditProfile from './components/EditProfile';
import RequestPasswordReset from './components/RequestPasswordReset'; // Asegúrate que esté en /components
import ResetPassword from './components/ResetPassword';

import logo from './assets/logoMG3.png';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Router>
      <header>
        <nav className="navbar">
          <img src={logo} alt="Logo" className="logo" />
          <Link to="/" className="nav-link">Login</Link>
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/orders" className="nav-link">Orders</Link>
          <Link to="/payments" className="nav-link">Payments</Link>
          <Link to="/register" className="nav-link">Register</Link>
          <Link to="/edit-profile" className="nav-link">Edit Profile</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Login setLoggedIn={setLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={loggedIn ? <Products /> : <Navigate to="/" />} />
        <Route path="/orders" element={loggedIn ? <Orders /> : <Navigate to="/" />} />
        <Route path="/payments" element={loggedIn ? <Payments /> : <Navigate to="/" />} />
        <Route path="/edit-profile" element={loggedIn ? <EditProfile /> : <Navigate to="/" />} />
        <Route path="/request-password-reset" element={<RequestPasswordReset />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
    </Router>
  );
};

export default App;
