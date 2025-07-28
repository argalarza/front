import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthdate: '',
    gender: '',
    role: 'client',
  });

  const [captchaValue, setCaptchaValue] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaValue) {
      setErrorMessage('Por favor completa el CAPTCHA.');
      return;
    }

    try {
      const response = await axios.post('http://18.209.183.216:4001/auth/register/', {
        ...formData,
        recaptchaToken: captchaValue,
        provider: 'local',
      });

      if (response.data.message === 'Registro exitoso') {
        setSuccessMessage('Registro exitoso. Ahora puedes iniciar sesión.');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setErrorMessage(response.data.error || 'Error desconocido');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Hubo un error al registrar al usuario.');
    }
  };

  const onCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const handleGoogleSuccess = async (tokenId) => {
    if (!captchaValue) {
      setErrorMessage('Completa el CAPTCHA antes de usar Google.');
      return;
    }

    try {
      const response = await axios.post('http://18.209.183.216:4001/auth/register/', {
        oauthToken: tokenId,
        recaptchaToken: captchaValue,
        provider: 'google',
        role: 'client'
      });

      if (response.data.message === 'Registro exitoso') {
        setSuccessMessage('Registro con Google exitoso.');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setErrorMessage(response.data.error || 'Error desconocido con Google');
      }
    } catch (err) {
      setErrorMessage('Error al registrar con Google.');
    }
  };

  return (
    <div className="register-container">
      <h2>Registrarse</h2>

      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Nombre completo</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Correo electrónico</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="birthdate">Fecha de nacimiento</label>
        <input
          type="date"
          id="birthdate"
          name="birthdate"
          value={formData.birthdate}
          onChange={handleChange}
          required
        />

        <label htmlFor="gender">Género</label>
        <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Selecciona tu género</option>
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
          <option value="other">Otro / Prefiero no decirlo</option>
        </select>

        <label htmlFor="role">Tipo de usuario</label>
        <select id="role" name="role" value={formData.role} onChange={handleChange}>
          <option value="client">🛍️ Cliente</option>
          <option value="seller">🧑‍💼 Vendedor</option>
          <option value="admin">🛠️ Administrador</option>
        </select>

        <ReCAPTCHA
          sitekey="6LcT524rAAAAAK2zwawAcN2Ye9yslu-cSYMbFfrL"
          onChange={onCaptchaChange}
        />

        <button type="submit">Registrar</button>
      </form>

      <div className="social-logins">
        <p>O regístrate con:</p>

        <GoogleLogin
          onSuccess={(credentialResponse) => handleGoogleSuccess(credentialResponse.credential)}
          onError={() => setErrorMessage('Error al iniciar sesión con Google')}
        />
      </div>

      <p>¿Ya tienes cuenta? <a href="/">Inicia sesión</a></p>
    </div>
  );
};

export default Register;
