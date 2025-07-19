/*
Componente React para Payments Service sin usar .env, con URLs y claves embebidas directamente en el código.

Requisitos:
- Listar órdenes
- Formulario de pago con styled-components
- Integración con Stripe.js
- WebSocket para notificaciones
*/

// src/components/OrdersList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import PaymentComponent from "./PaymentComponent";

// Configuración embebida (sin .env)
const API_ORDERS_URL = "http://13.223.17.187:5001";

const Wrapper = styled.div`
  max-width: 800px;
  margin: 40px auto;
  font-family: Arial, sans-serif;
`;
const OrdersTitle = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
`;
const Th = styled.th`
  text-align: left;
  padding: 12px;
  background-color: #007bff;
  color: white;
  font-weight: normal;
`;
const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #ddd;
`;
const Tr = styled.tr`
  &:hover {
    background-color: #f1f1f1;
  }
`;
// Renombrado de Button a OrderButton para evitar colisiones
const OrderButton = styled.button`
  padding: 8px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #218838;
  }
`;

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = localStorage.getItem("jwtToken");
        const { data } = await axios.get(
          `${API_ORDERS_URL}/orders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(data);
      } catch (err) {
        console.error("Error cargando órdenes:", err);
      }
    }
    fetchOrders();
  }, []);

  return (
    <Wrapper>
      <OrdersTitle>Mis Órdenes</OrdersTitle>
      <Table>
        <thead>
          <Tr>
            <Th>ID</Th>
            <Th>Total</Th>
            <Th>Estado</Th>
            <Th>Acción</Th>
          </Tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <Tr key={o.id}>
              <Td>{o.id}</Td>
              <Td>${o.total.toFixed(2)}</Td>
              <Td>{o.status}</Td>
              <Td>
                <OrderButton onClick={() => setSelectedOrder(o)} disabled={o.status === 'succeeded'}>
                  Pagar
                </OrderButton>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      {selectedOrder && (
        <PaymentComponent
          orderId={selectedOrder.id}
          total={selectedOrder.total}
          onDone={() => setSelectedOrder(null)}
        />
      )}
    </Wrapper>
  );
}


// src/components/PaymentComponent.jsx
import React, { useState } from "react";
import styled from "styled-components";

// Stripe.js debe estar cargado en index.html
// Configuración embebida
const API_PAYMENTS_URL = "http://localhost:6000";
const STRIPE_PUBLISHABLE_KEY = "pk_test_51RkXbvFMAadEqCes0jBt7WLEu6pMNvf4oPICEWIIxpgkNOlxlRvifSOLkFxp7426bi89mKPqvFP7sWY4wM7iJuc900CVKYucOe";

const PaymentWrapper = styled.div`
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
  max-width: 400px;
  margin: 0 auto 40px;
  font-family: Arial, sans-serif;
`;
const PaymentTitle = styled.h2`
  text-align: center;
  color: #333;
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
  &:focus { outline:none; border-color:#007bff; }
`;
// Renombrado de Button a PayButton para evitar colisiones
const PayButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size:16px;
  &:hover { background-color:#0056b3; }
`;
const Message = styled.p`
  font-size:14px;
  text-align:center;
  margin-top:20px;
  color: ${({ isError }) => (isError ? 'red' : 'green')};
`;

export default function PaymentComponent({ orderId, total, onDone }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handlePayment() {
    setMessage(''); setError('');
    try {
      const token = localStorage.getItem('jwtToken');
      const res = await fetch(
        `${API_PAYMENTS_URL}/payments/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type':'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ orderId })
        }
      );
      const { clientSecret } = await res.json();

      const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: { token: 'tok_visa' } }
      });

      if (result.error) throw result.error;
      if (result.paymentIntent.status === 'succeeded') {
        setMessage('Pago confirmado 🎉');
        setTimeout(onDone, 2000);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || 'Error al procesar el pago');
    }
  }

  return (
    <PaymentWrapper>
      <PaymentTitle>Pagar Orden #{orderId}</PaymentTitle>
      <InputLabel>Monto:</InputLabel>
      <Input value={`$${total.toFixed(2)}`} readOnly />
      <PayButton onClick={handlePayment}>Pagar Ahora</PayButton>
      {message && <Message>{message}</Message>}
      {error && <Message isError>{error}</Message>}
    </PaymentWrapper>
  );
}
