import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const Login = ({ setLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaValue) {
      setErrorMessage('Por favor, completa el reCAPTCHA!.');
      return;
    }

    const credentials = {
      email,
      password,
      recaptchaToken: captchaValue,
      provider: 'local',
    };

    try {
      const response = await fetch('http://100.27.116.212:4002/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('jwtToken', data.token);
        setLoggedIn(true);
        navigate('/products');
      } else {
        setErrorMessage(data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      setErrorMessage('Error de conexión. Inténtalo de nuevo.');
    }
  };

  const onCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    if (!captchaValue) {
      setErrorMessage('Por favor, completa el reCAPTCHA.');
      return;
    }

    const oauthToken = credentialResponse.credential;

    try {
      const response = await fetch('http://100.27.116.212:4002/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          oauthToken,
          recaptchaToken: captchaValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('jwtToken', data.token);
        setLoggedIn(true);
        navigate('/products');
      } else {
        setErrorMessage(data.error || 'Login con Google falló');
      }
    } catch (err) {
      setErrorMessage('Error al conectar con el servidor');
    }
  };

  return (
    <GoogleOAuthProvider clientId="1008167384967-nfl2rnbjcn126bgsavbte6uqc6qqojqd.apps.googleusercontent.com">
      <div className="login-container">
        <h2>Iniciar sesión</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <ReCAPTCHA
            sitekey="6LcT524rAAAAAK2zwawAcN2Ye9yslu-cSYMbFfrL"
            onChange={onCaptchaChange}
          />

          <button type="submit">Login</button>
        </form>
         <p style={{ marginTop: '10px' }}>
  ¿Olvidaste tu contraseña?{' '}
  <a href="/request-password-reset">Recupérala aquí</a>
</p>

        <div style={{ marginTop: '20px' }}>
          <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={() => setErrorMessage('Error con Google')} />
        </div>

        {errorMessage && <p className="error">{errorMessage}</p>}
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
