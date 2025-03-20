import React, { useState } from "react";
import ProductCard from "./ProductCard";
import TrendingProducts from "./TrendingProducts"; // Trending Products Component

const ProductList = ({ products, trendingProducts, wishlistIds, setWishlistIds }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="container">
      {/* Trending Products Section */}
      {trendingProducts && trendingProducts.length > 0 && (
        <>
          <h3 className="mt-4">Trending Products</h3>
          <div className="row">
          <TrendingProducts trendingProducts={trendingProducts} />
          </div>
        </>
      )}

      <h3 className="mt-4">Products</h3>
      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-sm-6 col-md-5 col-lg-4">
            <ProductCard
              product={product}
              onShowReviews={setSelectedProduct}
              wishlistIds={wishlistIds}
              setWishlistIds={setWishlistIds}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
