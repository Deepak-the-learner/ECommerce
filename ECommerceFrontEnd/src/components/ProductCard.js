import React, { useState } from "react";
import { FaHeart, FaShoppingCart, FaStar, FaCheck, FaHeartBroken } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/api";

const ProductCard = ({ product, onShowReviews, wishlistIds, setWishlistIds }) => {
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(wishlistIds.has(product.id));
  const [errorMessage, setErrorMessage] = useState(""); 
  const [showTick, setShowTick] = useState(false);

  // Get userToken from localStorage
  const userToken = JSON.parse(localStorage.getItem("userToken")) || {};
  const token = userToken.token;
  const isPremium = userToken.isPremium || false;

  // Calculate discounted price for premium users
  const discountedPrice = isPremium ? (product.price * 0.9).toFixed(2) : product.price;

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
        await axios.delete(`/wishlists/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Remove from local state
        const updatedWishlist = new Set(wishlistIds);
        updatedWishlist.delete(product.id);
        setWishlistIds(updatedWishlist);
        setIsInWishlist(false);
      } else {
        await axios.post(`/wishlists/${product.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Add to local state
        const updatedWishlist = new Set(wishlistIds);
        updatedWishlist.add(product.id);
        setWishlistIds(updatedWishlist);
        setIsInWishlist(true);
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status === 401) {
        localStorage.removeItem("userToken");
        window.location.reload();
      } else {
        alert('An error occurred while fetching the Wishlist');
      }
      console.error("Error updating wishlist:", error.response?.data);
    }
  };

  // Function to render star ratings
  const renderStars = (avgRating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < avgRating ? "text-warning" : "text-secondary"} />
    ));
  };

  return (
    <div className="card shadow-lg p-3 position-relative" style={{ width: "18rem", margin: "10px" }}>
      <Link to={`/product/${product.id}`} style={{textDecorationLine:"none"}}>
      {/* Image Section with "Out of Stock" Overlay */}
      <div className="position-relative">
        <img
          src={product.imageUrl}
          className="card-img-top img-fluid"
          style={{ height: "200px", objectFit: "cover" }}
          alt={product.name}
        />
        {product.availability === 0 && (
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center">
            <span className="text-white fw-bold fs-5">Out of Stock</span>
          </div>
        )}
      </div>
      {/* </Link> */}

      <div className="card-body text-center">
        {/* <Link to={`/product/${product.id}`} style={{color:"black", textDecorationLine:"none"}}> */}
        <h5 className="card-title fw-bold" style={{color:"black"}}>{product.name}</h5>
        {/* </Link> */}

        {/* Price Section */}
        <p className="fw-bold">
          {isPremium ? (
            <>
              <span className="text-decoration-line-through" style={{color:"grey"}}>${product.price.toFixed(2)}</span>
              <span className="text-success ms-2">${discountedPrice}</span>
            </>
          ) : (
            <span className="text-success">${product.price.toFixed(2)}</span>
          )}
        </p>

        {/* Display Average Rating */}
        <div className="d-flex align-items-center justify-content-center">
          {renderStars(product.averageRating)}
          <span className="ms-2 fw-bold small">({product.numberOfReviews})</span>
        </div>
        </div>
        </Link>

        <div className="d-flex justify-content-center gap-3 mt-3">
        <button
          className="btn btn-primary d-flex align-items-center justify-content-center"
          onClick={handleAddToCart}
          disabled={product.availability === 0}
        >
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
     

      {/* Error Dialog */}
      {errorMessage && (
        <div className="position-fixed top-50 start-50 translate-middle p-4 bg-white shadow-lg rounded text-center z-3">
          <p className="text-danger fw-bold">{errorMessage}</p>
          <button className="btn btn-primary mt-2" onClick={() => setErrorMessage("")}>
            OK
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
