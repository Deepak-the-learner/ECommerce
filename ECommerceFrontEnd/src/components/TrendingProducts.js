import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../index.css"

const TrendingProducts = ({ trendingProducts }) => {
  const [index, setIndex] = useState(0);
  const userToken = JSON.parse(localStorage.getItem("userToken")) || {};
  const token = userToken.token;
  const isPremium = userToken.isPremium || false;

  if (!trendingProducts || trendingProducts.length === 0) {
    return null; // Hide if no trending products
  }

  const nextProduct = () => {
    setIndex((prev) => (prev + 1));
  };

  const prevProduct = () => {
    setIndex((prev) => (prev - 1));
  };

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-center">
        <button className="btn btn-light me-3" onClick={prevProduct} disabled={index === 0}>
          <FaChevronLeft />
        </button>
        {/* Trending Product Card */}
        <div className="card d-flex flex-row align-items-center p-3 w-75 shadow">

        <Link to={`/product/${trendingProducts[index].id}`} style={{textDecorationLine:"none", display:"flex", flex:"1"}}>
          {/* Left Side: Product Details */}
          <div className="p-3 flex-grow-1">
            <h5 className="mb-2" style={{color:"black"}}>{trendingProducts[index].name}</h5>
            <p className="text-muted">{trendingProducts[index].description}</p>
            <p className="fw-bold row">{isPremium ? (
            <>
              <span className="text-decoration-line-through" style={{color:"grey"}}>${trendingProducts[index].price.toFixed(2)}</span>
              <span className="text-success">${(trendingProducts[index].price*0.9).toFixed(2)}</span>
            </>
          ) : (
            <span className="text-success">${trendingProducts[index].price.toFixed(2)}</span>
          )}</p>
          </div>

          {/* Right Side: Product Image */}
          <div className="p-3">
            <img
              src={trendingProducts[index].imageURL}
              className="img-fluid"
              alt={trendingProducts[index].name}
              style={{ width: "200px", height: "150px", objectFit: "cover" }}
            />
          </div>
          </Link>
        </div>
        <button className="btn btn-light ms-3" onClick={nextProduct} disabled={index === trendingProducts.length-1}>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default TrendingProducts;
