import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/api";
import { FaStar } from "react-icons/fa";

const ReviewPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const reviewId = queryParams.get("edit"); // Check if editing

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const userToken = JSON.parse(localStorage.getItem("userToken")) || {};
  const token = userToken.token;

  // Fetch existing review data if editing
  useEffect(() => {
    if (reviewId) {
      axios
        .get(`/reviews/product/${productId}/review/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setContent(res.data.content);
          setRating(res.data.rating);
        })
        .catch((err) => {
          console.error("Error fetching review:", err);
          if (err.code === 'ERR_NETWORK' || err.response?.status === 401) {
            localStorage.removeItem("userToken");
            navigate('/login');
          } else {
            alert('An error occurred while fetching the Reviews');
          }
          setError("Error loading review. Please try again.");
        });
    }
  }, [reviewId, productId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    try {
      if (reviewId) {
        // Update existing review
        await axios.put(
          `/reviews/product/${productId}/review/${reviewId}`,
          { content, rating },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Add new review
        await axios.post(
          `/reviews/product/${productId}`,
          { content, rating },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      navigate(`/product/${productId}`); // Redirect to home or product page
    } catch (err) {
      setError("Error submitting review. Please try again.");
      console.error("Review Submission Error:", err);
      if (err.code === 'ERR_NETWORK' || err.response?.status === 401) {
        localStorage.removeItem("userToken");
        navigate('/login');
      } else {
        alert('An error occurred while fetching the Edit Review Page.');
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">{reviewId ? "Edit Review" : "Add Review"}</h2>

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
          {reviewId ? "Update Review" : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewPage;
