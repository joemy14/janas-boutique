import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Trash2 } from "lucide-react";

export default function CartSidebar({ cartItems, onClose, onRemoveItem }) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const [stockWarnings, setStockWarnings] = useState({}); // { productId_size: warningText }

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow = isVisible ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isVisible]);

  useEffect(() => {
    setIsVisible(true);
    checkStock();
  }, [cartItems]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  // Check stock and update warnings
  const checkStock = () => {
    const warnings = {};
    cartItems.forEach((item) => {
      const key = `${item.id}_${item.size}`;
      if (item.stock !== undefined && item.quantity > item.stock) {
        warnings[key] = `Only ${item.stock} left in stock`;
      }
    });
    setStockWarnings(warnings);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = cartItems.length > 0 ? 100 : 0;
  const total = subtotal + shippingCost;

  const hasStockIssues = Object.keys(stockWarnings).length > 0;

  return (
    <>
      {/* Overlay */}
      <div onClick={handleClose} className={`fixed inset-0 bg-black/40 transition-opacity duration-300 z-40 ${isVisible ? "opacity-100" : "opacity-0"}`}></div>

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 w-99 h-full bg-[#fffdd0] shadow-lg p-4 z-50 transform transition-transform duration-300 overflow-y-auto ${isVisible ? "translate-x-0" : "translate-x-full"}`}>
        <button onClick={handleClose} className="float-right text-black cursor-pointer hover:text-red-600 transition-colors">✖</button>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-black" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Your cart is empty</p>
            <button onClick={handleClose} className="mt-2 bg-black text-white px-4 py-2 cursor-pointer hover:bg-gray-800 transition-colors" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Start Shopping</button>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {cartItems.map((item, idx) => {
              const key = `${item.id}_${item.size}`;
              return (
                <div key={idx} className="flex flex-col bg-white rounded-lg p-2 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 relative flex-shrink-0">
                        {(() => {
                          const imageSrc = item?.image_url
                            ? item.image_url.startsWith("http")
                              ? item.image_url
                              : "/" + item.image_url.replace("public/", "")
                            : item?.image
                              ? "/" + item.image
                              : "/placeholder.png";
                          return (
                            <Image
                              src={imageSrc}
                              alt={item?.name || "Product"}
                              fill
                              className="object-contain rounded"
                            />
                          );
                        })()}
                      </div>


                    <div className="flex-1 ml-3" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                      <span className="block text-sm font-semibold text-black">{item.name}</span>
                      <div className="text-xs text-gray-800 mt-1">Size: <span className="font-medium">{item.size}</span></div>

                      {/* Quantity display only */}
                      <div className="text-sm text-black mt-2">
                        Quantity: <span className="font-medium">{item.quantity}</span>
                      </div>

                      <div className="text-sm text-black mt-1">Price: <span className="font-medium">₱{Number(item.price).toLocaleString()}</span></div>

                      {stockWarnings[key] && (
                        <p className="text-red-600 text-xs mt-1">{stockWarnings[key]}</p>
                      )}
                    </div>

                    <button onClick={() => onRemoveItem(item)}>
                      <Trash2 size={18} className="text-red-500 cursor-pointer" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Shipping & Total */}
            <div className="mt-6 pt-4 border-t border-gray-400 relative" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              <div className="flex justify-between text-black mb-2"><span>Shipping</span><span>₱{shippingCost.toLocaleString()}</span></div>
              <div className="flex justify-between text-black text-lg font-semibold mb-4"><span>Total</span><span>₱{total.toLocaleString()}</span></div>

              {/* Checkout */}
              <div className="relative z-50">
                <button
                  disabled={hasStockIssues}
                  className={`w-full py-2 rounded mb-3 cursor-pointer transition-colors ${hasStockIssues ? "bg-gray-400 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"}`}
                  onClick={() => router.push("/checkout")}
                >
                  {hasStockIssues ? "Fix Quantity" : "Checkout"}
                </button>
              </div>

              <p onClick={handleClose} className="text-center text-black underline cursor-pointer">Continue Shopping</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
