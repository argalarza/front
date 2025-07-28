// src/components/ResetPassword.js
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('http://13.223.5.55:4004/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setTimeout(() => navigate('/'), 3000);
      }
    } catch (err) {
      console.error('Error en la solicitud de restablecimiento:', err);
      setMessage('❌ Error de conexión con el servidor.');
    }
  };

  return (
    <div className="reset-container" style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
      <h2>Restablecer contraseña</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="newPassword">Nueva contraseña:</label>
        <input
          id="newPassword"
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 8, margin: '10px 0' }}
        />
        <button
          type="submit"
          style={{
            padding: 10,
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            width: '100%'
          }}
        >
          Restablecer
        </button>
      </form>
      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
};

export default ResetPassword;
