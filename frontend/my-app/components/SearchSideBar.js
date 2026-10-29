"use client";

import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/router";

export default function SearchSidebar({ onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);

    // Fetch products from backend
    fetch("http://localhost/Backend/CC105Backend/getProducts.php")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched products:", data);
        setProducts(data.products || []);
      })
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  // Filter products based on query
  useEffect(() => {
    if (!query) {
      setFiltered([]);
      return;
    }

    const keyword = query.toLowerCase();

    const result = products.filter(
      (p) =>
        p.name?.toLowerCase().includes(keyword) ||
        p.overview?.toLowerCase().includes(keyword) ||
        p.category?.toLowerCase().includes(keyword) ||
        p.folder?.toLowerCase().includes(keyword)
    );

    setFiltered(result);
  }, [query, products]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClear = () => setQuery("");

  const openProduct = (product) => {
    handleClose();
    router.push(`/${product.folder}?productId=${product.id}`);
  };

  // Build full backend image URL (matches products.js)
  const getImageUrl = (product) => {
    if (!product.image_url) return "placeholder.png";

    const folderPath = product.folder.trim().replace(/\s*>\s*/g, "/");
    const fileName = product.image_url.split("/").pop();

    return `http://localhost/Backend/CC105Backend/images/${folderPath}/${fileName}`;
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 z-40 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-96 h-full bg-white shadow-lg p-4 z-50 transform transition-transform duration-300 font-serif ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button onClick={handleClose} className="float-right text-black">
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4">Search</h2>

        {/* Search Input */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-14 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-black text-black"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-sm text-gray-600 hover:text-black"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Results */}
        <div className="mt-4 space-y-3 max-h-[80vh] overflow-y-auto pr-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              onClick={() => openProduct(product)}
              className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 rounded transition"
            >
              <img
                src={getImageUrl(product)}
                alt={product.name}
                className="w-12 h-12 object-cover rounded"
              />

              <div>
                <p className="text-black font-semibold">{product.name}</p>
                <p className="text-gray-500 text-sm">
                  {product.category || product.folder}
                </p>
              </div>
            </div>
          ))}

          {query && filtered.length === 0 && (
            <p className="text-gray-500 text-sm text-center">No results found</p>
          )}
        </div>
      </div>
    </>
  );
}
