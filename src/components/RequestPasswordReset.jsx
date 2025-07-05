import React, { useState } from 'react';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch('http://13.223.5.55/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('📩 Revisa tu correo para restablecer tu contraseña.');
      } else {
        setError(data.message || 'Error al enviar el correo.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="reset-container">
      <h2>Recuperar contraseña</h2>
      <form onSubmit={handleSubmit}>
        <label>Correo electrónico:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Enviar enlace de recuperación</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default RequestPasswordReset;
