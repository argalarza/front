import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51RkXbvFMAadEqCes0jBt7WLEu6pMNvf4oPICEWIIxpgkNOlxlRvifSOLkFxp7426bi89mKPqvFP7sWY4wM7iJuc900CVKYucOe");
const API_ORDERS_URL = "http://13.223.17.187:5001";
const API_PAYMENTS_URL = "http://localhost:5050";

// Estilos
const Wrapper = styled.div`
  max-width: 800px;
  margin: 40px auto;
  font-family: Arial, sans-serif;
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

const PaymentWrapper = styled.div`
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
  max-width: 400px;
  margin: 0 auto 40px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
  color: #333;
`;

const PayButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
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
      <h1>Mis Órdenes</h1>
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
      });

      if (result.error) throw result.error;

      if (result.paymentIntent.status === "succeeded") {
        setMessage("✅ ¡Pago exitoso!");
        setTimeout(onDone, 2500);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al procesar el pago");
    }
  };

  return (
    <PaymentWrapper>
      <h2>Pagar Orden #{orderId}</h2>
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "12px", marginBottom: "15px" }}>
          <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
        </div>
        <PayButton type="submit">Pagar ${total.toFixed(2)}</PayButton>
      </form>
      {message && <Message>{message}</Message>}
      {error && <Message isError>{error}</Message>}
    </PaymentWrapper>
  );
}
