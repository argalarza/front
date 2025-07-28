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
      const res = await fetch('http://13.223.5.55:4004/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('📩 Revisa tu correo para restablecer tu contraseña.');
      } else {
        setError(data.message || '❌ Error al enviar el correo.');
      }
    } catch (err) {
      console.error('Error en solicitud:', err);
      setError('❌ Error de conexión con el servidor.');
    }
  };

  return (
    <div className="reset-container" style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
      <h2>Recuperar contraseña</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Correo electrónico:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 8, margin: '10px 0' }}
        />
        <button type="submit" style={{ padding: 10, backgroundColor: '#1976d2', color: '#fff', border: 'none' }}>
          Enviar enlace de recuperación
        </button>
      </form>
      {message && <p style={{ color: 'green', marginTop: 10 }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
    </div>
  );
};

export default RequestPasswordReset;
