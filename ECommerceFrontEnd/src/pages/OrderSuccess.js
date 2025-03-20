import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const OrderSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/"); // Redirect to home page after 1 second
    }, 1000);
  }, [navigate]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-success">
      <FaCheckCircle size={80} />
      <h2 className="mt-3 fw-bold">Order Placed Successfully</h2>
    </div>
  );
};

export default OrderSuccess;
