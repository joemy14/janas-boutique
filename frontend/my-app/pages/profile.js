import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { BsPerson } from "react-icons/bs";
import { FaChevronDown, FaTrash } from "react-icons/fa";
import Image from "next/image";

export default function Orders() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [zoomAnim, setZoomAnim] = useState(false);
  const [orders, setOrders] = useState([]);
  const dropdownRef = useRef();

  // Load current user
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) {
      router.push("/");
    } else {
      setUser(currentUser);
    }
  }, [router]);

  // Load user's orders
  useEffect(() => {
    if (user) {
      const userOrdersKey = `orders_${user.email}`;
      const userOrders = JSON.parse(localStorage.getItem(userOrdersKey) || "[]");
      setOrders(userOrders);
    }
  }, [user]);

  // Clear all orders
  const clearOrders = () => {
    if (!user) return;
    const userOrdersKey = `orders_${user.email}`;
    localStorage.setItem(userOrdersKey, JSON.stringify([]));
    setOrders([]);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShopClick = () => {
    setZoomAnim(true);
    setTimeout(() => router.push("/"), 300);
  };

  // Universal image path handler for old & new products
  const getImagePath = (imageUrl) => {
    if (!imageUrl || imageUrl === "undefined") return "/images/placeholder.png";
    if (imageUrl.startsWith("http")) return imageUrl; // new products with full URL
    return "/" + imageUrl.replace("public/", ""); // old local images
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Navbar */}
      <nav className="bg-white shadow-md w-full fixed top-0 left-0 z-50 pointer-events-none">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center font-serif" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            <span className="text-2xl text-gray-800 font-normal mr-24">Jana’s Boutique</span>
            <div className="flex gap-6">
              <button
                onClick={handleShopClick}
                className={`text-gray-800 font-normal hover:text-gray-600 transition text-lg cursor-pointer ${
                  zoomAnim ? "animate-zoom" : ""
                }`}
              >
                Shop
              </button>
              <button className="text-gray-800 font-normal text-lg cursor-default">Orders</button>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-1 transition cursor-pointer">
              <div className="bg-white rounded-full p-1 shadow-md">
                <BsPerson size={22} className="text-gray-800" />
              </div>
              <FaChevronDown
                size={14}
                className={`text-gray-800 transform transition-transform duration-300 ${
                  dropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {dropdownOpen && (
              <div
                className="absolute left-0 top-full mt-2 w-64 bg-white shadow-lg rounded-lg py-3 px-4 flex flex-col gap-2 z-50"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition">
                  <BsPerson size={18} className="text-gray-800" />
                  <span className="text-black font-normal text-sm tracking-tight">{user?.email}</span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("currentUser");
                    router.push("/");
                  }}
                  className="text-left text-black font-normal hover:bg-gray-100 rounded px-2 py-1 text-sm tracking-tight transition cursor-pointer"
                >
                  Sign out
                  
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Orders Section */}
      <main className="pt-32 px-6 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1
            className="text-3xl"
            style={{ fontFamily: "'Times New Roman', Times, serif", color: "black" }}
          >
            Order History
          </h1>

          {orders.length > 0 && (
            <button
              onClick={clearOrders}
              className="p-2 rounded border border-black bg-white transition cursor-pointer flex items-center justify-center"
            >
              <FaTrash className="text-white" size={18} style={{ stroke: "black", strokeWidth: 20 }} />
            </button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-lg h-64 flex flex-col justify-center items-center">
            <p className="text-black text-lg font-normal" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              No orders yet
            </p>
            <p className="text-black text-lg font-normal" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Go to store to place an order.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-6 max-h-[500px] overflow-y-auto">
            {orders.map((order, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-4 last:border-b-0">
                <p className="text-gray-700 mb-2 text-sm">
                  Order Date: {new Date(order.date).toLocaleString()}
                </p>
                <p className="text-gray-700 mb-3 text-sm">Payment: {order.paymentMethod}</p>

                {(order.cart || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 relative rounded overflow-hidden">
                        <Image
                          src={getImagePath(item.image || item.image_url)}
                          alt={item?.name || "Product"}
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                      <div className="text-gray-800 text-sm">
                        {item.name} × {item.quantity}
                        <div className="text-gray-500 text-xs">₱{item.price.toLocaleString()} each</div>
                      </div>
                    </div>
                    <div className="text-gray-800 text-sm">
                      ₱{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between text-gray-700 text-sm mt-2">
                  <span>Shipping:</span>
                  <span>₱{(order.shippingCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-900 text-base mt-1 font-medium">
                  <span>Total:</span>
                  <span>₱{order.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Zoom Animation */}
      <style jsx>{`
        .animate-zoom {
          animation: zoomIn 0.3s ease forwards;
        }
        @keyframes zoomIn {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
