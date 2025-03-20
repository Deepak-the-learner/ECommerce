import React, { useEffect, useState } from "react";
import axios from "../utils/api";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaPlus, FaMinus, FaTrash, FaTag } from "react-icons/fa";
import CouponsModal from "../components/CouponsModal";
const Cart = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [deliveryFee,setDeliveryFee] = useState(50);
  const [couponDiscount,setCouponDiscount] = useState(0); 
  const [coupon,setCoupon] = useState(null);
  const [error, setError] = useState("");
  const [totalPay,setTotalPay] = useState(0);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showCouponSuccess, setShowCouponSuccess] = useState(false);
  const [bestCoupon,setBestCoupon] = useState(null);
  

  const navigate = useNavigate();

  // Get userToken from localStorage
  const userToken = JSON.parse(localStorage.getItem("userToken")) || {};
  const token = userToken.token;
  const isPremium = userToken.isPremium || false;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [token, navigate]);


  const fetchCoupons = async (cartValue) => {
    if (!isPremium) {
      localStorage.setItem("coupons", JSON.stringify([])); // No coupons for non-premium users
      return;
    }
  
    try {
      const response = await axios.get(`/coupons/${Number(cartValue).toFixed(2)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      localStorage.setItem("coupons", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching coupons:", error.response?.data);
    }
    
    const storedCoupons = JSON.parse(localStorage.getItem("coupons")) || {};
    if(isPremium)
    {
      const tempCoupon = storedCoupons.bestCoupon;
      if(tempCoupon.id !== 0)
      {
        setBestCoupon(tempCoupon);
      }
    }
    
  };
  

  const fetchCart = async () => {
    try {
      const response = await axios.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
      calculateTotal(response.data);
      setError("");

      fetchCoupons(response.data ? response.data.reduce((acc, item) => acc + (isPremium ? item.price*0.9:item.price) * item.quantity, 0) : 0);
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.code === 'ERR_NETWORK' || error.response?.status === 401) {
        localStorage.removeItem("userToken");
        navigate('/login');
      } else {
        alert('An error occurred while fetching the Cart.');
      }
    }
  };

  const calculateTotal = (cartItems) => {
    var total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    if (isPremium) total *= 0.9;
  
    var toPay = total;
    if (!isPremium) toPay += deliveryFee;

    const storedCoupons = JSON.parse(localStorage.getItem("coupons")) || {};
    if(isPremium)
    {
      const tempCoupon = storedCoupons.bestCoupon;
      if(tempCoupon)
      {
        if(tempCoupon.id !== 0)
        {
          setBestCoupon(tempCoupon);
        }else{
          setBestCoupon(null);
        }
      }
    }
  
    if (coupon) {
      if (total < coupon.minimumCartValue) {
        setCoupon(null);
        setCouponDiscount(0);
      } else {
        const discount = Math.min((total * coupon.discountPercent) / 100, coupon.maximumDiscountAmount);
        setCouponDiscount(discount);
        toPay -= discount;
      }
    }
    setTotalPay(toPay.toFixed(2));
    setTotalPrice(total.toFixed(2));
  };
  

  const handleIncreaseQuantity = async (productId) => {
    try {
      await axios.post(`/cart/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status === 401) {
        localStorage.removeItem("userToken");
        navigate('/login');
      }
    }
  };

  const handleDecreaseQuantity = async (productId) => {
    try {
      await axios.put(`/cart/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status === 401) {
        localStorage.removeItem("userToken");
        navigate('/login');
      } 
      console.error("Error decreasing quantity:", error.response?.data);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await axios.delete(`/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status === 401) {
        localStorage.removeItem("userToken");
        navigate('/login');
      } 
      console.error("Error removing from cart:", error.response?.data);
    }
  };

  const handleApplyCoupon = (selectedCoupon) => {
    var prevDiscount = Number(couponDiscount) || 0; // Ensure it's a number
    setCoupon(selectedCoupon);

    var discount = selectedCoupon !== null
      ? Math.min(Number(totalPrice) * (selectedCoupon.discountPercent / 100), selectedCoupon.maximumDiscountAmount)
      : 0;
    setCouponDiscount(Number(discount).toFixed(2)); // Store as a number

    var amount = Number(totalPay) || 0; // Ensure totalPay is a number
    amount += prevDiscount;  // Add previous discount back
    amount -= discount;  // Subtract the new discount

    setTotalPay(Number(amount.toFixed(2))); // Ensure the final value is stored correctly

    const storedCoupons = JSON.parse(localStorage.getItem("coupons")) || {};
    const tempCoupon = storedCoupons.bestCoupon;
    if (tempCoupon && tempCoupon.id !== 0) {
      setBestCoupon(tempCoupon);
    }

    setShowCouponModal(false);
    setShowCouponSuccess(true);

    // Hide after 1 second
    setTimeout(() => setShowCouponSuccess(false), 1000);
};


  const handleRemoveCoupon = () => {
    setCoupon(null);
    var discount = 0;
    discount+=Number(couponDiscount) || 0;
    setCouponDiscount(0);
    var amount = 0;
    amount+=Number(totalPay);
    amount+=Number(discount);
    setTotalPay(amount.toFixed(2));
  };
  
  

  const handlePlaceOrder = async () => {
    try {
      const response = await axios.post("/orders", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Redirect to Order Success Page
      navigate("/order-success");
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status === 401) {
        localStorage.removeItem("userToken");
        navigate('/login');
      }
      setError(error.response?.data || "Failed to place order");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center">Your Cart</h3>
      {cart.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
      ) : (
        <>
          <div className="row">
            {cart.map((product) => (
              <div key={product.productId} className="col-md-12 mb-3">
                <div className="card shadow-sm p-3 d-flex flex-row align-items-center">
                  {/* Product Image */}
                  <img
                    src={product.imageUrl}
                    className="img-thumbnail"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    alt={product.productName}
                  />

                  {/* Product Details */}
                  <div className="ms-3 flex-grow-1">
                    <h5 className="fw-bold">{product.productName}</h5>
                    
                    {/* Product Price */}
                    <p className="fw-bold text-success">
                      ${isPremium ? (product.price*product.quantity*0.9).toFixed(2):(product.price*product.quantity).toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="d-flex align-items-center">
                      <button
                        className="btn btn-outline-danger btn-sm me-2"
                        onClick={() => handleDecreaseQuantity(product.productId)}
                      >
                        <FaMinus />
                      </button>
                      <span className="fw-bold">{product.quantity}</span>
                      <button
                        className="btn btn-outline-success btn-sm ms-2"
                        onClick={() => handleIncreaseQuantity(product.productId)}
                        disabled={product.quantity >= product.availability}
                      >
                        <FaPlus />
                      </button>
                    </div>

                    {/* Stock Warning */}
                    {product.quantity === product.availability && (
                      <p className="text-danger small mt-2">
                        Cannot add more due to limited stock
                      </p>
                    )}
                    {product.quantity > product.availability && product.availability !== 0 &&(
                      <p className="text-danger small mt-2">
                        Required Number of items are not available
                      </p>
                    )}
                    {product.availability === 0 && (
                      <p className="text-danger small mt-2">
                        Out of stock
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    className="btn btn-danger btn-sm ms-auto"
                    onClick={() => handleRemoveFromCart(product.productId)}
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Error Display */}
          {error && <p className="text-danger text-center">{error}</p>}

          {/* Coupon Placeholder */}
          <div className="text-center mt-3">
            <button className="btn btn-outline-primary" onClick={() => setShowCouponModal(true)}>Apply Coupon</button>
          </div>

          {isPremium && bestCoupon !== null && coupon === null  && <p className="text-success text-center">Coupon(s) Available</p>} 
          {(isPremium && bestCoupon !== null && coupon !== null && coupon.id !== bestCoupon.id) && <p className="text-success text-center">Better Coupon Available</p>} 
          
          
          
          {showCouponModal && (
            <CouponsModal
              cartValue={totalPrice}
              onClose={() => setShowCouponModal(false)}
              onApplyCoupon={handleApplyCoupon}
              coupon={coupon}
              onRemoveCoupon={handleRemoveCoupon}
            />
          )}

          {showCouponSuccess && (
            <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1040 }}
          >
            <div className="position-absolute top-50 start-50 translate-middle p-4 bg-white shadow-lg rounded d-flex flex-column" style={{pointerEvents: "auto"}}>
              <div className="text-success fs-1 text-center">✔</div>
              <h4 className="text-success mt-2">Coupon Applied</h4>
            </div>
            </div>
          )}



          {/* Checkout Section */}
          <div className="text-center mt-4 p-3 border rounded shadow">
            <div className="d-flex justify-content-between">
              <h5 className="fw">Order Total</h5>
              <h5 className="text-black">${totalPrice}</h5>
            </div>

            <div className="d-flex justify-content-between">
              <h5 className="fw">Delivery Fee</h5>
              {isPremium ? (
                <h5>
                  <span className="text-decoration-line-through" style={{color:"grey"}}>${deliveryFee}</span>
                  <span className="text-success"> FREE</span>
                </h5>
              ) : (
                <h5 className="text-success">${deliveryFee}</h5>
              )}
            </div>

            {coupon !== null && (
              <div className="d-flex justify-content-between">
                <h5 className="fw">
                  {coupon.couponCode}🏷️
                </h5>
                <h5 className="text-success">-${couponDiscount}</h5>
              </div>
            )}

            <hr />

            <div className="d-flex justify-content-between fw-bold">
              <h5>To Pay</h5>
              <h5>${totalPay}</h5>
            </div>

            <button className="btn btn-success mt-2 w-100" onClick={handlePlaceOrder}>
              Place Order
            </button>
          </div>

        </>
      )}
    </div>
  );
};

export default Cart;
