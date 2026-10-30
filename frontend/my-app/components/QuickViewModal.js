"use client";
import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { CartContext } from "@/pages/_app"; // adjust path if needed
import { useRouter } from "next/router";

export default function QuickViewModal({ product, onClose, currentUser }) {
  // ---- Hooks (must be before any return) ----
  const router = useRouter();
  const { addToCart } = useContext(CartContext);

  // Determine product type based on folder (safe even if product is null)
  const folder = product?.folder?.toLowerCase() || "";
  const isFootwear = folder.includes("flats") || folder.includes("heels") || folder.includes("sandals");
  const isPerfume = folder.includes("perfumes");
  const isEarring = folder.includes("earrings");
  const isNecklace = folder.includes("necklace");
  const isBracelet = folder.includes("bracelets");
  const isHandbag = folder.includes("handbags");
  const isRing = folder.includes("rings");
  const isTop = folder === "tops";
  const isBottom = folder === "bottoms";
  const isDress = folder === "dresses";

  // Default size for each type
  const defaultSize = isFootwear
    ? "39"
    : isPerfume
    ? "50ml"
    : isNecklace
    ? "16 inches"
    : isBracelet
    ? "Medium (6.5–7 inches)"
    : isEarring
    ? null
    : isRing
    ? "6"
    : isHandbag
    ? null
    : "M";

  const [size, setSize] = useState(defaultSize);
  const [quantity, setQuantity] = useState(1);
  const [show, setShow] = useState(false);

  const sizeOptions = isFootwear
    ? ["36", "37", "38", "39", "40", "41"]
    : isPerfume
    ? ["30ml", "50ml", "75ml", "100ml"]
    : isNecklace
    ? ["14 inches", "16 inches", "18 inches", "20 inches", "24 inches"]
    : isBracelet
    ? ["Small (6–6.5 inches)", "Medium (6.5–7 inches)", "Large (7–7.5 inches)"]
    : isEarring
    ? []
    : isRing
    ? ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5"]
    : isTop || isBottom || isDress
    ? ["Small", "Medium", "Large"]
    : isHandbag
    ? []
    : [];

  const displayedPrice = isPerfume && product?.prices ? product.prices[size] : product?.price;

  const imageSrc = product?.image_url
    ? product.image_url.startsWith("http")
      ? product.image_url
      : "/" + product.image_url.replace("public/", "")
    : "/placeholder.png";

  useEffect(() => {
    setShow(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!product) return null;

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
      document.body.style.overflow = "";
    }, 300);
  };

  const handleAddToCart = () => {
    if (product.stock === 0) {
      alert("Sorry, this product is out of stock.");
      return;
    }
    const finalQuantity = Math.min(quantity, product.stock);
    addToCart(product, finalQuantity, size);
  };

  const handleBuyNow = () => {
    if (product.stock === 0) {
      alert("Sorry, this product is out of stock.");
      return;
    }
    addToCart(product, 1, size);
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Overlay */}
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`} />

      {/* Modal */}
      <div className={`relative bg-white rounded-none p-6 w-[95%] max-w-4xl h-[600px] shadow-lg flex gap-8 transition-all duration-300 ${show ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-600 font-bold text-2xl cursor-pointer hover:text-red-600 transition-colors"
          onClick={handleClose}
          style={{ fontFamily: "'Playfair Display', 'Times New Roman', Times, serif" }}
        >
          ×
        </button>

        {/* Left - Image */}
        <div className="w-1/2 flex items-center justify-center bg-white relative">
          <Image src={imageSrc} alt={product?.name || "Product"} fill className="object-contain w-full h-auto max-h-full max-w-full" />
        </div>

        {/* Right - Info */}
        <div className="w-1/2 flex flex-col overflow-hidden" style={{ fontFamily: "'Playfair Display', 'Times New Roman', Times, serif" }}>
          <h2 className="text-2xl mb-3 text-black">{product.name}</h2>
          <p className="text-gray-600 mb-4">₱{Number(displayedPrice).toLocaleString()}</p>

          {/* Sizes */}
          {sizeOptions.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-black">
                {isPerfume
                  ? `Size: ${size}`
                  : isFootwear
                  ? `Size: ${size}`
                  : isNecklace
                  ? `Length: ${size}`
                  : isBracelet
                  ? `Wrist Size: ${size}`
                  : isRing
                  ? `Ring Size: ${size}`
                  : `Size: ${size}`}
              </p>
              <div className="flex flex-wrap">
                {sizeOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-1 mr-2 mb-2 rounded border transition ${size === s ? "bg-black text-white" : "bg-gray-200 text-black"}`}
                    style={{ fontWeight: "normal" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-4 flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="text-black">Quantity:</span>
              <div className="flex items-center border border-black rounded">
                <button
                  className="px-3 py-1 border-r border-black text-black bg-white hover:bg-[#f5f5dc] transition cursor-pointer"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="px-4 text-black">{quantity}</span>
                <button
                  className="px-3 py-1 border-l border-black text-black bg-white hover:bg-[#f5f5dc] transition cursor-pointer"
                  onClick={() => setQuantity(Math.min(quantity + 1, product.stock))}
                  disabled={product.stock === 0}
                >
                  +
                </button>
              </div>
            </div>
            <p className="text-sm text-red-600 mt-1">
              {product.stock} item{product.stock !== 1 ? "s" : ""} left in stock
            </p>
          </div>

          {/* Description */}
          <div className="mb-6 flex-1 min-h-0">{product.description}</div>

          {/* Actions */}
          <div className="flex gap-4 mt-auto">
            <button
              onClick={handleAddToCart}
              className="btn-accent"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="btn-accent"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
