// src/components/OrdersList.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import PaymentComponent from "./PaymentComponent"; // Asegúrate de que esté correcto

// Configuración embebida (sin .env)
const API_ORDERS_URL = "http://13.223.17.187:5001";

// Estilos
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
        <PaymentComponent
          orderId={selectedOrder.id}
          total={selectedOrder.total}
          onDone={() => setSelectedOrder(null)}
        />
      )}
    </Wrapper>
  );
}
