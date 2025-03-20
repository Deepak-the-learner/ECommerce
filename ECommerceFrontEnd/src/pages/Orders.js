import React, { useEffect, useState } from "react";
import axios from "../utils/api";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // Get userToken from localStorage
  const userToken = JSON.parse(localStorage.getItem("userToken")) || {};
  const token = userToken.token;

  useEffect(() => {
    if (!token) {
      navigate("/login"); // Redirect to login if not logged in
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get("/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error.response?.data);
        if (error.code === 'ERR_NETWORK' || error.response?.status === 401) {
          localStorage.removeItem("userToken");
          navigate('/login');
        } else {
          alert('An error occurred while fetching the Orders');
        }
      }
    };

    fetchOrders();
  }, [token, navigate]);

  return (
    <div className="container mt-4">
      <h3 className="text-center">Your Orders</h3>
      {orders.length === 0 ? (
        <p className="text-center">You have no orders yet.</p>
      ) : (
        <div className="row">
          {orders.map((order, index) => (
            <div key={index} className="col-md-4">
              <div className="card shadow-lg p-3 mb-4">
                <img
                  src={order.imageURL}
                  className="card-img-top img-fluid"
                  style={{ height: "200px", objectFit: "cover" }}
                  alt={order.productName}
                />
                <div className="card-body text-center">
                  <h5 className="card-title fw-bold">{order.productName}</h5>
                  <p className="fw-bold">Quantity: {order.quantity}</p>
                  <p className="text-muted">Ordered on: {new Date(order.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
