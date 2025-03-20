import React, { useEffect, useState } from "react";
import axios from "../utils/api";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTrash } from "react-icons/fa";

const Wishlist = ({ wishlistIds, setWishlistIds }) => {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();
  const [isFetching,setIsFetching] = useState(true);

  // Get userToken from localStorage
  const userToken = JSON.parse(localStorage.getItem("userToken")) || {};
  const token = userToken.token;
  const isPremium = userToken.isPremium || false;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchWishlist = async () => {
      try {
        const response = await axios.get("/wishlists", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist(response.data);
      } catch (error) {
        console.error("Error fetching wishlist:", error.response?.data);
        if (error.code === 'ERR_NETWORK' || error.response?.status === 401) {
          localStorage.removeItem("userToken");
          navigate('/login');
        } else {
          alert('An error occurred while fetching the Wishlist');
        }
      }
    };
    setIsFetching(true);
    fetchWishlist();
    setIsFetching(false);
  }, [token, navigate]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await axios.delete(`/wishlists/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local wishlist state
      setWishlist(wishlist.filter((item) => item.productId !== productId));

      // Remove from global wishlistIds state
      const updatedWishlist = new Set(wishlistIds);
      updatedWishlist.delete(productId);
      setWishlistIds(updatedWishlist);
    } catch (error) {
      console.error("Error removing from wishlist:", error.response?.data);
      if (error.code === 'ERR_NETWORK' || error.response?.status === 401) {
        localStorage.removeItem("userToken");
        navigate('/login');
      } else {
        alert('An error occurred while fetching the Wish List');
      }
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center">Your Wishlist</h3>
      {isFetching ? (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading, Please Wait...</p>
        </div>
      </div>
    ) :wishlist.length === 0 ? (
        <p className="text-center">Your wishlist is empty</p>
      ) : (
        <div className="row">
          {wishlist.map((product) => (
            <div key={product.productId} className="col-md-4">
              <div className="card shadow-lg p-3 mb-4">
                <img
                  src={product.imageURL}
                  className="card-img-top img-fluid"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body text-center">
                  <h5 className="card-title fw-bold">{product.productName}</h5>

                  {/* Price Section */}
                  <p className="fw-bold">
                    {isPremium ? (
                      <>
                        <span className="text-danger text-decoration-line-through">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-success ms-2">
                          ${(product.price * 0.9).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-success">${product.price.toFixed(2)}</span>
                    )}
                  </p>

                  {/* Remove from Wishlist Button */}
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemoveFromWishlist(product.productId)}
                  >
                    <FaTrash className="me-2" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
