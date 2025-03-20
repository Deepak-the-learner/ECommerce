import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ProductList from "../components/ProductList";
import Header from "../components/Header";
import axios from "../utils/api";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = ({ wishlistIds, setWishlistIds }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState({ minPrice: 0, maxPrice: 5000 });
  const [search, setSearch] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [priceRange,setPriceRange] = useState({maxMinPrice:0,minMaxPrice:5000});
  const [updatedProducts,setUpdatedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/products");
        let data = response.data;
        if (selectedCategory !== "All") {
          data = data.filter((d) => d.category === selectedCategory);
        }
        if (search !== "") {
          data = data.filter((d) => d.name && d.name.toLowerCase().includes(search.toLowerCase()));
        }
        const minPrice = Math.min(...data.map((d) => d.price));
        const maxPrice = Math.max(...data.map((d) => d.price));
        setProducts(data);
        setPriceRange({ minMaxPrice: maxPrice, maxMinPrice: minPrice });
      } catch (err) {
        console.log(err);
      }
    };

    const fetchTrendingProducts = async () => {
      try {
        const response = await axios.get("/products/trending");
        setTrendingProducts(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    setIsFetching(true);
    Promise.all([fetchProducts(), fetchTrendingProducts()]).finally(() => setIsFetching(false));
  }, [selectedCategory, search]);


  useEffect(() => {

    const updProducts = products.filter(p=>p.price>=priceFilter.minPrice && p.price<=priceFilter.maxPrice);
    setUpdatedProducts(updProducts);

  }, [priceFilter]);

  

  return (
    <div className="container-fluid px-md-20">
      {/* Header */}
      <Header search={search} onSearchChange={setSearch} />

      <div className="row d-flex flex-wrap flex-md-column flex-lg-row mt-3">
  {/* Sidebar - Always on top for small screens */}
  <div className="col-lg-3 col-md-12 mb-3 sidebar">
    <Sidebar onCategoryChange={setSelectedCategory} onPriceChange={setPriceFilter} priceRange={priceRange} />
  </div>

  {/* Product List - Stays below sidebar on small screens */}
  <div className="col-lg-9 col-md-12">
    {isFetching ? (
      <div className="d-flex justify-content-center align-items-center vh-50">
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
      </div>
    ) : (
      <ProductList
        products={updatedProducts.length === 0 ? products : updatedProducts}
        trendingProducts={trendingProducts}
        wishlistIds={wishlistIds}
        setWishlistIds={setWishlistIds}
      />
    )}
  </div>
</div>

    </div>
  );
};

export default Home;
