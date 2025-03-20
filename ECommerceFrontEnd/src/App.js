import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ReviewPage from "./pages/ReviewPage";
import EditReviewPage from "./pages/EditReviewPage";
import Wishlist from "./pages/WishList";
import axios from "./utils/api.js";
import Orders from "./pages/Orders.js";
import Cart from "./pages/Cart.js";
import OrderSuccess from "./pages/OrderSuccess.js";
import ProductDetails from "./pages/ProductDetails.js";

function App() {
  const [wishlistIds, setWishlistIds] = useState(new Set());
  useEffect(() => {
    const fetchWishlist = async () => {
      const userToken = JSON.parse(localStorage.getItem("userToken")) || {};
      const token = userToken.token;
      if (!token) return;
  
      try {
        const response = await axios.get("/wishlists", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Store wishlist product IDs in a Set
        const productIds = new Set(response.data.map((item) => item.productId));
        setWishlistIds(productIds);
      } catch (error) {
        if (error.code === 'ERR_NETWORK' || error.response?.status === 401) {
          localStorage.removeItem("userToken");
          window.location.reload();
        } else {
          alert('An error occurred while fetching the Wishlist');
        }
      }
    };
  
    fetchWishlist();
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home wishlistIds={wishlistIds} setWishlistIds={setWishlistIds} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/add-review/:productId" element={<ReviewPage />} />
        <Route path="/edit-review/:productId" element={<EditReviewPage />} />
        <Route path="/wishlist" element={<Wishlist wishlistIds={wishlistIds} setWishlistIds={setWishlistIds} />} />
        <Route path="/orders" element={<Orders/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/product/:productId" element={<ProductDetails wishlistIds={wishlistIds} setWishlistIds={setWishlistIds} />}/>
      </Routes>
    </Router>
  );
}

export default App;
