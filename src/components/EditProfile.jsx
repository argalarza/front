import React, { useEffect, useState } from 'react';
import { updateUserProfile } from '../services/api';
import axios from 'axios';

const EditProfile = () => {
  const token = localStorage.getItem('jwtToken');

  const [form, setForm] = useState({
    name: '',
    email: '',
    birthdate: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:4003/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { name, email, birthdate } = res.data;

        setForm({
          name: name || '',
          email: email || '',
          birthdate: birthdate ? birthdate.substring(0, 10) : ''
        });
      } catch (err) {
        console.error('Error al cargar el perfil:', err.response?.data || err.message);
        setError('No se pudo cargar el perfil.');
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await updateUserProfile(form, token);
      setMessage('✅ ¡Perfil actualizado con éxito!');
    } catch (err) {
      console.error('❌ Error al actualizar:', err.response?.data || err.message);
      setError('❌ Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <p style={{ color: 'red' }}>⚠️ No estás autenticado. Inicia sesión primero.</p>;
  }

  return (
    <div className="edit-profile">
      <h2>Editar Perfil</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Nombre:</label>
        <input
          id="name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Correo electrónico:</label>
        <input
          id="email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="birthdate">Fecha de nacimiento:</label>
        <input
          id="birthdate"
          type="date"
          name="birthdate"
          value={form.birthdate}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default EditProfile;
