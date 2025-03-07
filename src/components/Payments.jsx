import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";

// Contenedor principal del formulario
const PaymentWrapper = styled.div`
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 40px auto;
  transition: all 0.3s ease-in-out;
  
  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  font-family: 'Arial', sans-serif;
  margin-bottom: 20px;
`;

const InputLabel = styled.label`
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
  color: #333;
  box-sizing: border-box;
  transition: border-color 0.3s ease-in-out;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }

  &::placeholder {
    color: #aaa;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
  color: #333;
  box-sizing: border-box;
  transition: border-color 0.3s ease-in-out;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #007bff;
  border: none;
  color: white;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 0.3s ease-in-out;

  &:hover {
    background-color: #0056b3;
  }
`;

const Message = styled.p`
  font-size: 14px;
  text-align: center;
  padding: 12px;
  margin-top: 20px;
  border-radius: 8px;
  color: ${({ isError }) => (isError ? 'red' : 'green')};
  background-color: ${({ isError }) => (isError ? '#f8d7da' : '#d4edda')};
  transition: all 0.3s ease-in-out;
`;

const PaymentComponent = () => {
  const [orderId, setOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Función para validar si el orderId es un ObjectId válido
  const isValidObjectId = (id) => {
    return /^[a-fA-F0-9]{24}$/.test(id);  // Expresión regular para validar ObjectId de MongoDB
  };

  const handlePayment = async () => {
    if (!isValidObjectId(orderId)) {
      setError("El ID de la orden no es válido.");
      setMessage("");
      return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError("El monto debe ser un número positivo.");
      setMessage("");
      return;
    }

    try {
      // Obtén el token JWT desde el almacenamiento local (o contexto si lo tienes)
      const token = localStorage.getItem("jwtToken");

      if (!token) {
        setError("No se encontró el token de autenticación.");
        setMessage("");
        return;
      }

      // Configuración de la solicitud
      const paymentRequest = {
        order_id: orderId,
        payment_method: paymentMethod,
        amount: parseFloat(amount),
      };

      // Realiza la solicitud POST para crear el pago
      const response = await axios.post(
        "http://localhost:3017/create_payment", // Asegúrate de que esta URL sea correcta
        paymentRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Token de autorización en el encabezado
          },
        }
      );

      // Si el pago es exitoso, muestra el mensaje
      setMessage(response.data.message);
      setError(""); // Limpiar posibles errores previos
    } catch (err) {
      // Si hay error, muestra el detalle
      setMessage("");
      setError(err.response?.data?.detail || "Hubo un error al realizar el pago.");
    }
  };

  return (
    <PaymentWrapper>
      <Title>Formulario de Pago</Title>
      <div>
        <InputLabel htmlFor="orderId">ID de Orden:</InputLabel>
        <Input
          type="text"
          id="orderId"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Ingrese el ID de la orden"
        />
      </div>
      <div>
        <InputLabel htmlFor="paymentMethod">Método de Pago:</InputLabel>
        <Select
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="credit_card">Tarjeta de Crédito</option>
          <option value="paypal">PayPal</option>
          <option value="bank_transfer">Transferencia Bancaria</option>
        </Select>
      </div>
      <div>
        <InputLabel htmlFor="amount">Monto:</InputLabel>
        <Input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Ingrese el monto"
        />
      </div>
      <Button onClick={handlePayment}>Realizar Pago</Button>

      {message && <Message>{message}</Message>}
      {error && <Message isError>{error}</Message>}
    </PaymentWrapper>
  );
};

export default PaymentComponent;
