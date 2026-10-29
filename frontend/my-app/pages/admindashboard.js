// pages/admindashboard.js
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { BsPerson } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";
import { AiOutlineHome } from "react-icons/ai"; // ✅ Home icon
import { AuthContext } from "@/pages/_app";

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Dashboard stats
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

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
  // FETCH STATS FROM BACKEND
  // -----------------------
  useEffect(() => {
    async function fetchStats() {
      try {
        const productRes = await fetch(
          "http://localhost/Backend/CC105Backend/get_total_purchased_products.php"
        );
        const orderRes = await fetch(
          "http://localhost/Backend/CC105Backend/get_total_orders.php"
        );
        const earningRes = await fetch(
          "http://localhost/Backend/CC105Backend/get_total_earnings.php"
        );

        const productData = await productRes.json();
        const orderData = await orderRes.json();
        const earningData = await earningRes.json();

        setTotalProducts(productData.total_products || 0);
        setTotalOrders(orderData.total_orders || 0);
        setTotalEarnings(earningData.total_earnings || 0);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }

    fetchStats();
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

      {/* ============================ SIDEBAR ============================= */}
      <aside
        className="fixed left-0 top-0 h-full w-56 bg-white shadow-md pt-28 pb-10"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        <div className="flex flex-col gap-4 px-5">
          {[
            { label: "Dashboard", path: "/admindashboard" },
            { label: "Orders", path: "/admin/orders" },
            { label: "Products", path: "/admin/products" },
            { label: "Customers", path: "/admin/customers" },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.path)}
              className="text-left text-lg text-gray-700 py-2 px-3 rounded hover:bg-gray-100 transition cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* ============================ TOP NAVBAR ============================= */}
      <nav className="bg-white shadow-md w-full fixed top-0 left-0 z-50 pointer-events-none">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center pointer-events-auto">
          <div
            className="flex items-center font-serif gap-3"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            {/* Home Icon */}
            <button
              onClick={() => router.push("/")}
              className="text-black hover:text-gray-700 transition text-2xl flex items-center"
              title="Go to Home"
              style={{
                backgroundColor: "white",
                borderRadius: "50%",
                padding: "4px",
              }}
            >
              <AiOutlineHome size={24} />
            </button>

            <span className="text-2xl text-gray-800 font-normal mr-24">
              Admin Dashboard
            </span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 transition"
            >
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
                className="absolute left-0 top-full mt-2 w-64 bg-white shadow-lg rounded-lg py-3 px-4 flex flex-col gap-2 z-50 cursor-pointer"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition cursor-pointer">
                  <BsPerson size={18} className="text-gray-800" />
                  <span className="text-black font-normal text-sm tracking-tight">
                    {admin?.email}
                  </span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("currentUser");
                    router.push("/adminlogin");
                  }}
                  className="text-left text-black font-normal hover:bg-gray-100 rounded px-2 py-1 text-sm tracking-tight transition cursor pointer"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ============================ MAIN DASHBOARD CONTENT ============================= */}
      <main
        className="pt-32 px-6 ml-56 w-full"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* DASHBOARD TITLE */}
        <h1 className="text-3xl mb-10 text-gray-800">Dashboard Overview</h1>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Total Products */}
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Products Purchased</h2>
            <p className="text-4xl font-bold text-[#800000]">{totalProducts}</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Orders</h2>
            <p className="text-4xl font-bold text-[#800000]">{totalOrders}</p>
          </div>

          {/* Total Earnings */}
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Earnings</h2>
            <p className="text-4xl font-bold text-[#800000]">₱{totalEarnings}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
