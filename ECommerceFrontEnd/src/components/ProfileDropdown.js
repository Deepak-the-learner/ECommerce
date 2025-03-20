import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUser} from "react-icons/fa"; // Using FontAwesome icon
import axios from "../utils/api";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Get user data from localStorage
  const userToken = JSON.parse(localStorage.getItem("userToken")) || {};
  const token = userToken.token;
  const [isPremium, setIsPremium] = useState(userToken.isPremium || false);
  const [showDialog, setShowDialog] = useState(false);
  const [name,setName] = useState(userToken.name);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle Subscribe/Unsubscribe
  const handleSubscription = async () => {
    try {
      const endpoint = isPremium ? "/unsubscribe" : "/subscribe";
      const response = await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsPremium(!isPremium); // Toggle state

      // Update localStorage
      localStorage.setItem(
        "userToken",
        JSON.stringify({ ...userToken, isPremium: !isPremium })
      );

      window.location.reload(); // Refresh page to reflect changes
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status === 401) {
        localStorage.removeItem("userToken");
        navigate('/login');
      } else {
        alert('An error occurred while fetching the Subscription');
      }
      alert("Error: " + (error.response?.data || "Something went wrong!"));
    }
    setShowDialog(false); // Close dialog
  };

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem("userToken"); // Clear token
    localStorage.removeItem("coupons");
    window.location.reload(); // Refresh the page
  };

  return (
    <>
      <div className="position-relative" ref={dropdownRef}>
        {/* Profile Button */}
        <button
          className="btn btn-light d-flex align-items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FaUser className="me-2" /> {name ? (name) : ("Profile")}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="dropdown-menu show position-absolute end-0" style={{ minWidth: "200px" }}>
            {token ? (
              <>
                <Link className="dropdown-item" to="/orders">Your Orders</Link>
                <Link className="dropdown-item" to="/wishlist">Your Wishlist</Link>
                <Link className="dropdown-item" to="/cart">Your Cart</Link>

                {/* Subscription Button */}
                <button
                  className="dropdown-item text-center text-white"
                  style={{ backgroundColor: "orange", margin: "8px", width: "90%", border: "none" }}
                  onClick={() => setShowDialog(true)}
                >
                  {isPremium ? "Unsubscribe" : "Subscribe"}
                </button>

                {/* Sign Out Button */}
                <button
                  className="dropdown-item text-center text-white bg-danger mt-2"
                  style={{ margin: "8px", width: "90%", border: "none" }}
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="dropdown-item text-center bg-primary text-white"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog (Centered on Page) */}
      {showDialog && (
        <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ zIndex: 1040 }}
        onClick={() => setShowDialog(false)}
      >
        <div
          className="position-fixed top-50 start-50 translate-middle bg-white shadow-lg rounded p-4"
          style={{
            zIndex: 1050, // Ensure it's above everything
            width: "300px",
            textAlign: "center",
            border: "2px solid #ddd",
          }}
        >
          <p className="fw-bold text-dark">
          Are you sure you want to {isPremium ? "unsubscribe" : "subscribe"}?
        </p>

          <div className="d-flex justify-content-around mt-3">
            <button className="btn btn-danger" onClick={() => setShowDialog(false)}>Cancel</button>
            <button className="btn btn-success" onClick={handleSubscription}>Confirm</button>
          </div>
        </div>
        </div>
      )}
    </>
  );
};

export default ProfileDropdown;
