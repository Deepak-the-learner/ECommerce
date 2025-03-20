import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa"; // Import close icon

const CouponsModal = ({ cartValue, onClose, onApplyCoupon, coupon, onRemoveCoupon }) => {
  const [eligibleCoupons, setEligibleCoupons] = useState([]);
  const [ineligibleCoupons, setIneligibleCoupons] = useState([]);
  const userToken = JSON.parse(localStorage.getItem("userToken")) || {};
  const isPremium = userToken.isPremium || false;

  useEffect(() => {
    const storedCoupons = JSON.parse(localStorage.getItem("coupons")) || {};
    setEligibleCoupons(storedCoupons.eligibleCoupons || []);
    setIneligibleCoupons(storedCoupons.ineligibleCoupons || []);
  }, []);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
      style={{ zIndex: 1040 }}
      onClick={onClose} // Close modal when clicking outside
    >
      {/* MODAL */}
      <div
        className="position-absolute top-50 start-50 translate-middle p-4 bg-white shadow-lg rounded"
        style={{
          width: "50vw",
          height: "50vh",
          overflowY: "auto",
          zIndex: 1050,
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button (Top-Right) */}
        <button
          className="position-absolute top-0 end-0 m-2 btn btn-sm btn-light"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        <h4 className="text-center">Available Coupons</h4>

        {isPremium ? (
          (eligibleCoupons.length + ineligibleCoupons.length) === 0 ? (
            <p className="text-danger text-center">No coupons available.</p>
          ) : (
            <ul className="list-group">
              {eligibleCoupons.map((mapcoupon) => (
                <li key={mapcoupon.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{mapcoupon.couponCode}</strong> - {mapcoupon.discountPercent}% off (Max ${mapcoupon.maximumDiscountAmount})
                    <br />
                    <small>Min Cart Value: ${mapcoupon.minimumCartValue}</small>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      (coupon !== null && mapcoupon.id === coupon.id) ? onRemoveCoupon():onApplyCoupon(mapcoupon);
                      onClose();
                    }}
                  >
                    {coupon !== null && coupon.id === mapcoupon.id ? "Remove" : "Apply"}
                  </button>
                </li>
              ))}
              {ineligibleCoupons.map((coupon) => (
                <li key={coupon.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{coupon.couponCode}</strong> - {coupon.discountPercent}% off (Max ${coupon.maximumDiscountAmount})
                    <br />
                    <small>Min Cart Value: ${coupon.minimumCartValue}</small>
                    <br/>
                    <small>Add ${(coupon.minimumCartValue-cartValue).toFixed(2)} to avail this coupon</small>
                  </div>
                  <button className="btn btn-secondary btn-sm" disabled>
                    Not Eligible
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : (
          <p className="text-danger text-center">You need to be a premium subscriber to access coupons.</p>
        )}
      </div>
    </div>
  );
};

export default CouponsModal;
