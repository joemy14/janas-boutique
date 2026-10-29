// pages/dresses.js
import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Breadcrumb from "../components/Breadcrumb";
import { CartContext } from "./_app";

export default function Dresses() {
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from PHP backend
  useEffect(() => {
  async function fetchProducts() {
    try {
      // Use 127.0.0.1 for better Next.js compatibility
      const res = await fetch(
        "http://127.0.0.1/Backend/CC105Backend/getProducts.php?folder=dresses"
      );

      // Check HTTP response
      if (!res.ok) {
        console.error("HTTP error:", res.status, res.statusText);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        console.error("Failed to fetch products:", data.message);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }

  fetchProducts();
}, []);


  return (
    <div>
      <Navbar cartItems={cartItems} onRemoveItem={removeFromCart} />

      <div className="pt-[200px] max-w-[1400px] mx-auto px-4">
        <Breadcrumb paths={["Home", "Dresses"]} />
      </div>

      <main className="pt-6 max-w-[1400px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <p>Loading products...</p>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(prod) => addToCart(prod, 1, prod.size)}
            />
          ))
        )}
      </main>
    </div>
  );
}
