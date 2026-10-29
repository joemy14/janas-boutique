// pages/admin/orders.js
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { BsPerson } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";
import { AiOutlineHome } from "react-icons/ai";

export default function AdminOrders() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const [orders, setOrders] = useState([]);

  // -----------------------
  // CHECK ADMIN LOGIN
  // -----------------------
  useEffect(() => {
    const currentAdmin = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentAdmin || currentAdmin.is_admin !== 1) {
      router.push("/adminlogin");
    } else {
      setAdmin(currentAdmin);
    }
  }, [router]);

  // -----------------------
  // FETCH ORDERS FROM BACKEND
  // -----------------------
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("http://localhost/Backend/CC105Backend/get_orders.php");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    }
    fetchOrders();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-56 bg-white shadow-md pt-28 pb-10" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
        <div className="flex flex-col gap-4 px-5">
          {[
            { label: "Dashboard", path: "/admindashboard" },
            { label: "Orders", path: "/admin/orders" },
            { label: "Products", path: "/admin/products" },
            { label: "Customers", path: "/admin/customers" },
          ].map((item, index) => (
            <button key={index} onClick={() => router.push(item.path)} className="text-left text-lg text-gray-700 py-2 px-3 rounded hover:bg-gray-100 transition cursor-pointer">
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* TOP NAVBAR */}
      <nav className="bg-white shadow-md w-full fixed top-0 left-0 z-50 pointer-events-none">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center font-serif gap-3">
            <button onClick={() => router.push("/")} className="text-black hover:text-gray-700 transition text-2xl flex items-center" title="Go to Home" style={{ backgroundColor: "white", borderRadius: "50%", padding: "4px" }}>
              <AiOutlineHome size={24} />
            </button>
            <span className="text-2xl text-gray-800 font-normal mr-24">Admin Dashboard</span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-1 transition">
              <div className="bg-white rounded-full p-1 shadow-md">
                <BsPerson size={22} className="text-gray-800" />
              </div>
              <FaChevronDown size={14} className={`text-gray-800 transform transition-transform duration-300 ${dropdownOpen ? "rotate-180" : "rotate-0"}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white shadow-lg rounded-lg py-3 px-4 flex flex-col gap-2 z-50" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition">
                  <BsPerson size={18} className="text-gray-800" />
                  <span className="text-black font-normal text-sm tracking-tight">{admin?.email}</span>
                </div>
                <button onClick={() => { localStorage.removeItem("currentUser"); router.push("/adminlogin"); }} className="text-left text-black font-normal hover:bg-gray-100 rounded px-2 py-1 text-sm tracking-tight transition">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="pt-32 px-6 ml-56 w-full" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
        <h1 className="text-3xl mb-6 text-gray-800">Orders</h1>

        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Email</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Products</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Total Amount</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Shipping</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Payment</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Address</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">Phone</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-300 bg-white text-gray-900">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-4 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  
                  <tr key={order.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2">{order.id}</td>
                    <td className="px-4 py-2">{order.user_email}</td>
                    <td className="px-4 py-2">
                      {order.products && order.products.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {order.products.map((product) => (
                            <div key={product.id} className="flex items-center gap-2">
                              <img
  src={`http://localhost/Backend/CC105Backend/${product.image}`}
  alt={product.name}
  className="w-10 h-10 object-cover rounded"
/>



                              <span className="text-sm">{product.name} x{product.quantity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No products</span>
                      )}
                    </td>
                    <td className="px-4 py-2">₱{order.total_amount}</td>
                    <td className="px-4 py-2">₱{order.shipping_cost}</td>
                    <td className="px-4 py-2">{order.payment_method}</td>
                    <td className="px-4 py-2">{new Date(order.purchase_date).toLocaleString()}</td>
                    <td className="px-4 py-2">{order.first_name} {order.last_name}</td>
                    <td className="px-4 py-2">{order.address}, {order.city}, {order.province}, {order.zip}</td>
                    <td className="px-4 py-2">{order.phone}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
