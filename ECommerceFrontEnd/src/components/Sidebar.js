import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = ({ onCategoryChange, onPriceChange, priceRange }) => {
  const categories = ["All", "Electronics", "Beauty", "Fashion", "Home Essentials"];
  const [minPrice, setMinPrice] = useState(priceRange.maxMinPrice);
  const [maxPrice, setMaxPrice] = useState(priceRange.minMaxPrice);

  const [maxMinPrice,setMaxMinPrice] = useState(priceRange.maxMinPrice);
  const [minMaxPrice,setMinMaxPrice] = useState(priceRange.minMaxPrice);

  useEffect(()=>{
    setMaxMinPrice(priceRange.maxMinPrice);
    setMinMaxPrice(priceRange.minMaxPrice);
    setMinPrice(priceRange.maxMinPrice);
    setMaxPrice(priceRange.minMaxPrice);
  },[priceRange]);


  const handleMinPriceChange = (e) => {
    const value = Math.min(Number(e.target.value), maxPrice - 50); // Ensure minPrice is always lower than maxPrice
    setMinPrice(value);
    onPriceChange({ minPrice: value, maxPrice: maxPrice });
  };

  const handleMaxPriceChange = (e) => {
    const value = Math.max(Number(e.target.value), minPrice + 50); // Ensure maxPrice is always higher than minPrice
    setMaxPrice(value);
    onPriceChange({ minPrice: minPrice, maxPrice: value });
  };

  return (
    <div className="p-4 border-end bg-light vh-100" style={{ width: "280px" }}>
      {/* Categories Section */}
      <h5 className="fw-bold mb-3">Categories</h5>
      <ul className="list-group mb-4">
        {categories.map((category, index) => (
          <li
            key={index}
            className="list-group-item list-group-item-action"
            onClick={() => onCategoryChange(category)}
            style={{ cursor: "pointer" }}
          >
            {category}
          </li>
        ))}
      </ul>

      {/* Price Filter Section */}
      <h5 className="fw-bold mb-3">Filter by Price</h5>
      <div className="mb-3">
        <label className="form-label">From: ${minPrice}</label>
        <input
          type="range"
          className="form-range"
          min={maxMinPrice}
          max={minMaxPrice}
          value={minPrice}
          onChange={handleMinPriceChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">To: ${maxPrice}</label>
        <input
          type="range"
          className="form-range"
          min={maxMinPrice}
          max={minMaxPrice}
          value={maxPrice}
          onChange={handleMaxPriceChange}
        />
      </div>
    </div> 
  );
};

export default Sidebar;
