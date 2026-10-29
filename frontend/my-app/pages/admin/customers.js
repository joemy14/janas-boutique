// pages/admin/customers.js
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { BsPerson } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";
import { AiOutlineHome } from "react-icons/ai";

export default function AdminCustomers() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
  // FETCH CUSTOMERS
  // -----------------------
  useEffect(() => {
  async function fetchCustomers() {
    try {
      const res = await fetch("http://localhost/Backend/CC105Backend/get_customers_details.php");
      const text = await res.text();
      console.log("RAW RESPONSE:", text); // <--- see what PHP actually returns
      const data = JSON.parse(text);

      if (!res.ok || !data.success) {
        console.error("FETCH ERROR:", data);
        setCustomers([]); // prevent crash
        return;
      }

      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setCustomers([]); // prevent crash
    }
  }

  fetchCustomers();
}, []);


  // -----------------------
  // Close dropdown when clicking outside
  // -----------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -----------------------
  // Filtered customers
  // -----------------------
  const filteredCustomers = customers.filter(
    (c) =>
      c.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* NAVBAR */}
      <nav className="bg-white shadow-md w-full fixed top-0 left-0 z-50 pointer-events-none">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center font-serif gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-black hover:text-gray-700 transition text-2xl flex items-center"
              style={{ backgroundColor: "white", borderRadius: "50%", padding: "4px" }}
              title="Go to Home"
            >
              <AiOutlineHome size={24} />
            </button>
            <span className="text-2xl text-gray-800 font-normal mr-24">Admin Dashboard</span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-1 transition">
              <div className="bg-white border border-black rounded-full p-1 shadow-sm flex items-center justify-center">
                <BsPerson size={20} className="text-black" />
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
                <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition cursor-pointer">
                  <BsPerson size={18} className="text-gray-800" />
                  <span className="text-black font-normal text-sm tracking-tight">{admin?.email}</span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("currentUser");
                    router.push("/adminlogin");
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

      {/* MAIN CONTENT */}
      <main className="pt-32 px-6 ml-56 w-full" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl text-gray-800">Customers</h1>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-black rounded shadow-sm text-black bg-white focus:outline-none focus:ring focus:ring-black focus:border-black"
/>
        </div>

        {filteredCustomers.length === 0 ? (
          <p className="text-gray-500">No customers found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white border border-black shadow-md rounded-lg p-4 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white border border-black flex items-center justify-center shadow-sm">
                    <BsPerson size={24} className="text-black" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-black">{customer.first_name} {customer.last_name}</h2>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/admin/customers/${customer.id}`)}
                  className="bg-white text-black border border-black rounded px-2 py-1 text-sm font-serif mt-3 hover:bg-black hover:text-white transition cursor-pointer"
                  style={{ fontFamily: "'Times New Roman', Times, serif" }}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
