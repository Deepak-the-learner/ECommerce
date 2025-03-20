import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/api";
import { FaStar } from "react-icons/fa";

const ReviewPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const userToken = JSON.parse(localStorage.getItem("userToken")) || {};
  const token = userToken.token;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    try {
      await axios.post(
        `/reviews/product/${productId}`,
        { content, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/`);
    } catch (err) {
      setError("Error submitting review. Please try again.");
      console.error("Review Submission Error:", err);
      if (err.code === 'ERR_NETWORK' || err.response?.status === 401) {
        localStorage.removeItem("userToken");
        navigate('/login');
      } else {
        alert('An error occurred while fetching the Orders');
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Add Review</h2>

      {/* Rating Selection */}
      <div className="d-flex justify-content-center mb-3">
        {Array.from({ length: 5 }, (_, index) => (
          <FaStar
            key={index}
            size={30}
            className={index < rating ? "text-warning" : "text-secondary"}
            onClick={() => setRating(index + 1)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && <p className="text-danger text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="text-center">
        {/* Review Content (Optional) */}
        <textarea
          className="form-control mb-3"
          placeholder="Write your review (optional)"
          rows="4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary">
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ReviewPage;
