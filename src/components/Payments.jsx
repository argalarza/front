// src/components/Payments.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Configuración
const API_ORDERS_URL = "http://13.223.17.187:5001";
const API_PAYMENTS_URL = "http://localhost:5050";
const STRIPE_PUBLISHABLE_KEY = "pk_test_51RkXbvFMAadEqCes0jBt7WLEu6pMNvf4oPICEWIIxpgkNOlxlRvifSOLkFxp7426bi89mKPqvFP7sWY4wM7iJuc900CVKYucOe";
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// 💅 Estilos
const Wrapper = styled.div`
  max-width: 900px;
  margin: 40px auto;
  font-family: 'Segoe UI', sans-serif;
`;

const OrdersTitle = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 40px;
`;

const Th = styled.th`
  padding: 14px;
  background-color: #007bff;
  color: white;
  text-align: left;
`;

const Td = styled.td`
  padding: 14px;
  border-bottom: 1px solid #ccc;
`;

const Tr = styled.tr`
  &:hover {
    background-color: #f9f9f9;
  }
`;

const OrderButton = styled.button`
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const PaymentWrapper = styled.div`
  background-color: #f1f1f1;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 6px 10px rgba(0,0,0,0.1);
  max-width: 450px;
  margin: 0 auto;
`;

const PaymentTitle = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

const InputLabel = styled.label`
  display: block;
  font-weight: 500;
  color: #444;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 18px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const PayButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const Message = styled.p`
  font-size: 14px;
  text-align: center;
  margin-top: 20px;
  color: ${({ isError }) => (isError ? "red" : "green")};
`;

// 🔷 Componente principal
export default function Payments() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await axios.get(`${API_ORDERS_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
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
          {orders.map((o) => (
            <Tr key={o.id}>
              <Td>{o.id}</Td>
              <Td>${o.total.toFixed(2)}</Td>
              <Td>{o.status}</Td>
              <Td>
                <OrderButton
                  onClick={() => setSelectedOrder(o)}
                  disabled={o.status === "succeeded"}
                >
                  Pagar
                </OrderButton>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      {selectedOrder && (
        <Elements stripe={stripePromise}>
          <InlinePayment
            orderId={selectedOrder.id}
            total={selectedOrder.total}
            onDone={() => setSelectedOrder(null)}
          />
        </Elements>
      )}
    </Wrapper>
  );
}

// 🧾 Subcomponente de pago
function InlinePayment({ orderId, total, onDone }) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handlePayment(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!stripe || !elements) return;

    try {
      const token = localStorage.getItem("jwtToken");

      const res = await fetch(`${API_PAYMENTS_URL}/payments/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, email }),
      });

      const { clientSecret } = await res.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { email },
        },
        receipt_email: email,
      });

      if (result.error) throw result.error;

      if (result.paymentIntent.status === "succeeded") {
        setMessage("✅ Pago realizado exitosamente.");
        setTimeout(onDone, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Ocurrió un error con el pago.");
    }
  }

  return (
    <PaymentWrapper>
      <PaymentTitle>Pagar Orden #{orderId}</PaymentTitle>
      <form onSubmit={handlePayment}>
        <InputLabel>Correo electrónico:</InputLabel>
        <Input
          type="email"
          value={email}
          required
          placeholder="usuario@ejemplo.com"
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputLabel>Tarjeta:</InputLabel>
        <div style={{ padding: "12px", border: "1px solid #ccc", borderRadius: "8px", marginBottom: "18px" }}>
          <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
        </div>

        <PayButton type="submit" disabled={!stripe}>
          Pagar ${total.toFixed(2)}
        </PayButton>
      </form>
      {message && <Message>{message}</Message>}
      {error && <Message isError>{error}</Message>}
    </PaymentWrapper>
  );
}
