"use client";
import { useState } from "react";
import QuickViewModal from "./QuickViewModal";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ProductCard({ product, onAddToCart, index, currentUser }) {
  const [showModal, setShowModal] = useState(false);
  const [hover, setHover] = useState(false);

  const [selectedSize, setSelectedSize] = useState(
    product.sizes ? Object.keys(product.sizes)[0] : null
  );

  const displayPrice = product.sizes
    ? product.sizes[selectedSize]
    : product.price;

  // FIX: Use the full URL from backend if it starts with http
  const imageSrc = product?.image_url
    ? product.image_url.startsWith("http")
      ? product.image_url
      : "/" + product.image_url.replace("public/", "")
    : "/placeholder.png";

  return (
    <motion.div
      className="bg-white shadow rounded-none overflow-hidden transition w-full max-w-sm relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.05,
      }}
      style={{ opacity: 1 }}
    >
      <div
        className="bg-white w-full h-130 flex items-center justify-center relative overflow-hidden"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Image
          src={imageSrc}
          alt={product?.name || "Product"}
          fill
          className={`object-contain w-full h-auto max-h-full max-w-full transition-transform duration-500 ${
            hover ? "scale-105" : "scale-100"
          }`} 
        />  

        <div
          className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
            hover ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => setShowModal(true)}
            className="relative bg-white text-black border border-black w-50 py-2 rounded hover:bg-black hover:text-white transition text-sm cursor-pointer"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            Quick View
          </button>
        </div>
      </div>

      {showModal && (
        <QuickViewModal
          product={{ ...product, price: displayPrice }}
          onClose={() => setShowModal(false)}
          onAddToCart={onAddToCart}
          currentUser={currentUser}
        />
      )}
    </motion.div>
  );
}
