import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const Login = ({ setLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null); // Para guardar el valor del reCAPTCHA
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar que el CAPTCHA esté completado
    if (!captchaValue) {
      setErrorMessage('Por favor, completa el CAPTCHA.');
      return;
    }

    const credentials = { username, password, captcha: captchaValue };

    try {
      const response = await fetch('http://18.204.74.129:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Si el login es exitoso, guarda el token y cambia el estado de loggedIn
        localStorage.setItem('jwtToken', data.token); // Guardar el token en el localStorage
        setLoggedIn(true); // Cambia el estado para permitir acceso a rutas protegidas
        navigate('/products'); // Redirige a la página de productos (o cualquier otra página)
      } else {
        setErrorMessage('Credenciales incorrectas');
      }
    } catch (error) {
      setErrorMessage('Error de conexión, intente de nuevo');
    }
  };

  const onCaptchaChange = (value) => {
    setCaptchaValue(value); // Al cambiar el valor del CAPTCHA, actualizar el estado
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Agregar el widget CAPTCHA */}
        <ReCAPTCHA
          sitekey="6LeXYOwqAAAAAOaqrTY6oz8C3MoG5cB_mDLAcCmz" // Clave de sitio de Google reCAPTCHA
          onChange={onCaptchaChange}
        />

        <button type="submit">Login</button>
      </form>

      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default Login;
