import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null); // Guardar el valor del CAPTCHA
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // Para redirigir al login después de registrarse

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si el CAPTCHA no es completado, muestra un error
    if (!captchaValue) {
      setErrorMessage('Por favor completa el CAPTCHA.');
      return;
    }

    try {
      // Enviar la solicitud de registro al backend
      const response = await axios.post('http://13.216.150.153:3001/register', {
        username,
        password,
        captcha: captchaValue, // Enviar el valor del CAPTCHA al back-end
      });

      // Si la respuesta es exitosa, mostramos el mensaje y redirigimos
      if (response.data.message === 'Usuario registrado exitosamente') {
        setSuccessMessage('Registro exitoso. Ahora puedes iniciar sesión.');
        setTimeout(() => navigate('/'), 2000); // Redirige al login después de 2 segundos
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage('Hubo un error al registrar al usuario.');
      console.error('Error en el registro:', error);
    }
  };

  const onCaptchaChange = (value) => {
    setCaptchaValue(value); // Al cambiar el valor del CAPTCHA, actualizar el estado
  };

  return (
    <div className="register-container">
      <h2>Registrarse</h2>

      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
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
          sitekey="6LemWOwqAAAAAFUQ7bQXohaRmAgt52zWiwMEEXT9" // Clave de sitio obtenida de Google
          onChange={onCaptchaChange}
        />

        <button type="submit">Registrar</button>
      </form>

      <p>
        ¿Ya tienes cuenta? <a href="/">Inicia sesión</a>
      </p>
    </div>
  );
};

export default Register;
