import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch } from "react-icons/fa";

const Header = ({ search, onSearchChange }) => {

  const [searchValue,setSearchValue] = useState('');


  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    onSearchChange(searchValue);
  };

  return (
    <header className="d-flex justify-content-between align-items-center p-3 bg-dark text-white" style={{gap:"4vw"}}>
      {/* Logo */}
      <Link to="/" className="text-white fw-bold fs-4 text-decoration-none">
        🛒 E-Shop
      </Link>

      {/* Search Bar with Icon */}
      <form className="input-group w-50" onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-control"
          placeholder="Search products..."
          value={searchValue}
          onChange={(e)=>setSearchValue(e.target.value)} // ✅ Ensure onChange updates the search state
        />
        <button type="submit" className="btn btn-outline-light">
          <FaSearch />
        </button>
      </form>

      <div style={{display:"flex",gap:"3vw", alignItems:"center"}}>
      {/* Profile Dropdown */}
      <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
