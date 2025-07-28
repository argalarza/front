// src/components/Payments.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Configuración
const API_ORDERS_URL = "http://13.223.17.187:5001";
const API_PAYMENTS_URL = "http://35.172.248.252:5050";
const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51RkXbvFMAadEqCes0jBt7WLEu6pMNvf4oPICEWIIxpgkNOlxlRvifSOLkFxp7426bi89mKPqvFP7sWY4wM7iJuc900CVKYucOe";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// 🎨 Estilos
const Wrapper = styled.div`
  max-width: 900px;
  margin: 40px auto;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
`;

const Th = styled.th`
  padding: 12px;
  background-color: #007bff;
  color: white;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #ccc;
`;

const Tr = styled.tr`
  &:hover {
    background-color: #f9f9f9;
  }
`;

const OrderButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
`;

const PaymentBox = styled.div`
  padding: 30px;
  background: #f8f8f8;
  border-radius: 12px;
  max-width: 500px;
  margin: 0 auto 40px;
`;

const PaymentTitle = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
`;

const PayButton = styled.button`
  background-color: #007bff;
  color: white;
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const Message = styled.p`
  margin-top: 20px;
  text-align: center;
  color: ${({ error }) => (error ? "red" : "green")};
`;

// COMPONENTE PRINCIPAL
export default function Payments() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = localStorage.getItem("jwtToken");
        const { data } = await axios.get(`${API_ORDERS_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data);
      } catch (err) {
        console.error("Error cargando órdenes:", err);
      }
    }
    fetchOrders();
  }, []);

  return (
    <Wrapper>
      <Title>Mis Órdenes</Title>
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
          {orders.map((order) => (
            <Tr key={order.id}>
              <Td>{order.id}</Td>
              <Td>${order.total.toFixed(2)}</Td>
              <Td>{order.status}</Td>
              <Td>
                <OrderButton
                  onClick={() => setSelectedOrder(order)}
                  disabled={order.status === "succeeded"}
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
          <PaymentForm
            orderId={selectedOrder.id}
            total={selectedOrder.total}
            onDone={() => setSelectedOrder(null)}
          />
        </Elements>
      )}
    </Wrapper>
  );
}

// COMPONENTE DE FORMULARIO DE PAGO
function PaymentForm({ orderId, total, onDone }) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
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
        body: JSON.stringify({ orderId }),
      });

      const { clientSecret } = await res.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { email },
        },
        receipt_email: email,
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        setMessage("✅ Pago exitoso. Recibo enviado por correo.");
        setTimeout(onDone, 2500);
      }
    } catch (err) {
      console.error(err);
      setError("Error al procesar el pago");
    }
  };

  return (
    <PaymentBox>
      <PaymentTitle>Pagar Orden #{orderId}</PaymentTitle>
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Correo para recibo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <CardElement options={{ hidePostalCode: true }} />
        <PayButton type="submit" disabled={!stripe}>
          Pagar ${total.toFixed(2)}
        </PayButton>
      </form>
      {message && <Message>{message}</Message>}
      {error && <Message error>{error}</Message>}
    </PaymentBox>
  );
}

// ✅ Validación de props
PaymentForm.propTypes = {
  orderId: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  onDone: PropTypes.func.isRequired,
};
