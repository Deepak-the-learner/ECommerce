import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaStar, FaCheck, FaHeartBroken, FaEdit, FaTrash} from "react-icons/fa";
import axios from "../utils/api";

const ProductDetails = ({ wishlistIds, setWishlistIds }) => {
  const { productId } = useParams();
  const [userReviewIds, setUserReviewIds] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); 
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showTick, setShowTick] = useState(false);
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

  const userToken = JSON.parse(localStorage.getItem("userToken")) || {};
  const token = userToken.token;
  const isPremium = userToken.isPremium || false;

  useEffect(() => {
    if (token) {
      axios
        .get(`/reviews/Userproduct/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUserReviewIds(Array.isArray(res.data) ? res.data : []))
        .catch((error) => {
          if (error.code === "ERR_NETWORK" || error.response?.status === 401) {
            localStorage.removeItem("userToken");
            window.location.reload();
          } else {
            alert("An error occurred while fetching user reviews.");
          }
        });
    }
  }, [productId, token]);
  

  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
    setIsInWishlist(wishlistIds.has(parseInt(productId)));
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/reviews/product/${productId}`);
      setReviews(response.data);
  
      // Calculate rating distribution
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      response.data.forEach((review) => {
        distribution[review.rating]++;
      });
  
      // Convert to percentage
      const totalReviews = response.data.length;
      Object.keys(distribution).forEach((key) => {
        distribution[key] = totalReviews > 0 ? (distribution[key] / totalReviews) * 100 : 0;
      });
  
      setRatingDistribution(distribution);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleEditReview = (reviewId) => {
    navigate(`/edit-review/${product.id}?edit=${reviewId}`);
  };


  const handleDeleteReview = (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      axios
        .delete(`/reviews/product/${product.id}/review/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          window.location.reload(); // Reload after deletion
        })
        .catch((err) => console.error("Error deleting review:", err));
    }
  };
  

  const handleAddToCart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
  
    try {
      await axios.post(`/cart/${product.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("Product added to cart:", product);
  
      // Show tick mark for 1 second
      setShowTick(true);
      setTimeout(() => setShowTick(false), 1000);
  
    } catch (error) {
      if (error.response?.data === "Cannot Add due to limited stock") {
        setErrorMessage("Cannot add to cart due to limited stock.");
      }else if (error.code === 'ERR_NETWORK' || error.response?.status === 401) {
        localStorage.removeItem("userToken");
        navigate('/login');
      } else {
        alert('An error occurred while adding to cart');
      } 
    }
  };

  const handleWishlistToggle = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (isInWishlist) {
        await axios.delete(`/wishlists/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedWishlist = new Set(wishlistIds);
        updatedWishlist.delete(parseInt(productId));
        setWishlistIds(updatedWishlist);
        setIsInWishlist(false);
      } else {
        await axios.post(`/wishlists/${productId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedWishlist = new Set(wishlistIds);
        updatedWishlist.add(parseInt(productId));
        setWishlistIds(updatedWishlist);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error.response?.data);
    }
  };

  const handleAddReview = async () => {
    if (token) {
        navigate(`/add-review/${product.id}`);
      } else {
        navigate("/login");
      }
  };

  if (!product) return (<div className="d-flex justify-content-center align-items-center vh-50">
  <div className="text-center">
    <div
      className="spinner-border text-primary"
      role="status"
      style={{ width: "3rem", height: "3rem" }}
    >
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="mt-3">Loading, Please Wait...</p>
  </div>
</div>);

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Left: Product Image */}
        <div className="col-md-5 text-center">
          <img
            src={product.imageURL}
            alt={product.name}
            className="img-fluid rounded shadow"
            style={{ maxHeight: "400px" }}
          />
        </div>

        {/* Right: Product Info */}
        <div className="col-md-7">
          <h2 className="fw-bold">{product.name}</h2>
          <p>{product.description}</p>

          {/* Price Section */}
          <h4 className="fw-bold">
            {isPremium ? (
              <>
                <span className="text-danger text-decoration-line-through">${product.price.toFixed(2)}</span>
                <span className="text-success ms-2">${(product.price * 0.9).toFixed(2)}</span>
              </>
            ) : (
              <span className="text-success">${product.price.toFixed(2)}</span>
            )}
          </h4>

          {/* Buttons */}
          <div className="d-flex gap-3 mt-3">
            <button className="btn btn-primary d-flex align-items-center" onClick={handleAddToCart} disabled={product.availability === 0}>
              {showTick ? <FaCheck className="text-white" /> : <FaShoppingCart className="me-2" />}
              {showTick ? "Added!" : "Add to Cart"}
            </button>


            <button
                className={`btn ${isInWishlist ? "btn-outline-danger" : "btn-outline-success"}`}
                onClick={handleWishlistToggle}
            >
                {isInWishlist ? (
                <>
                    <FaHeartBroken className="me-2" /> Remove from Wishlist
                </>
                ) : (
                <>
                    <FaHeart className="me-2" /> Add to Wishlist
                </>
                )}
            </button>
          </div>
          <br></br>
          {product.availability === 0 && (<p className="text-danger">Out of stock!!</p>)}
        </div>
      </div>


      {errorMessage && (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1040 }}
            onClick={() => setErrorMessage("")} // Close modal when clicking outside
        >
              {/* MODAL */}
        <div
            className="position-absolute top-50 start-50 translate-middle p-4 bg-white shadow-lg rounded"
            style={{
                width: "25vw",
                height: "25vh",
                zIndex: 1050,
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
            <div className="text-center"> 
                <p className="text-danger fw-bold">{errorMessage}</p>
                <button className="btn btn-primary mt-2" onClick={() => setErrorMessage("")}>
                    OK
                </button>
           </div>
        </div>
    </div> 
    )}

    <br></br>
      {/* Reviews Overview */}
    <div className="mb-4 col-6">
    <h4 className="fw-bold">Reviews Overview</h4>
    {Object.keys(ratingDistribution)
        .sort((a, b) => b - a) // Sort in descending order
        .map((star) => (
        <div key={star} className="d-flex align-items-center">
            <span className="me-2">{star} <FaStar className="text-warning" /></span>
            <div className="progress flex-grow-1" style={{ height: "8px" }}>
            <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${ratingDistribution[star]}%` }}
                aria-valuenow={ratingDistribution[star]}
                aria-valuemin="0"
                aria-valuemax="100"
            ></div>
            </div>
            <span className="ms-2">{ratingDistribution[star].toFixed(1)}%</span>
        </div>
        ))}
    </div>


      {/* Reviews Section */}
      <div className="mt-5">
        <h3>Customer Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review, index) => (
            <div key={index} className="border rounded p-3 my-2 shadow-sm">
              <h5 className="fw-bold">{review.userName}</h5>
              <div className="d-flex align-items-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < review.rating ? "text-warning" : "text-secondary"} />
                ))}
              </div>
              <p className="mt-2">{review.content}</p>
              {userReviewIds.includes(review.id) && (
                                <div>
                                  <button
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => handleEditReview(review.id)}
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteReview(review.id)}
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              )}
            </div>
          ))
        )}
      </div>

      {/* Add Review Button */}
      <div className="mt-4 text-center">
        <button
          className="btn btn-success"
          onClick={handleAddReview}
        >
          Add a Review
        </button>
      </div>
    </div>
  );
};


export default ProductDetails;
