"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { BsPerson } from "react-icons/bs";

export default function CustomerProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch customer data
  useEffect(() => {
    if (!id) return;

    async function fetchCustomer() {
      try {
        const res = await fetch(`http://localhost/Backend/CC105Backend/get_customers_orders.php?id=${id}`);
const data = await res.json();

if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch customer");

setCustomer({ ...data.customer, orders: data.orders }); // data.orders now contains all orders

        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Error fetching customer: " + err.message);
        setLoading(false);
      }
    }

    fetchCustomer();
  }, [id]);

  if (loading) return <p className="p-6">Loading customer info...</p>;
  if (!customer) return <p className="p-6">Customer not found.</p>;

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-serif">
      {/* Navbar */}
      <nav className="bg-white shadow-md w-full fixed top-0 left-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center font-serif" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
          <button
            onClick={() => router.push("/admin/customers")}
            className="text-gray-800 text-2xl flex items-center gap-2 hover:text-gray-600 transition cursor-pointer"
          >
            <AiOutlineArrowLeft size={24} /> Jana’s Boutique
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-32 px-6 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="flex items-center gap-2 text-xl font-semibold text-black">
  <BsPerson size={28} className="text-gray-800" />
  {customer.first_name} {customer.last_name}
</h1>

        </div>

        <div className="bg-white border border-black rounded-lg shadow p-6 space-y-4">
          <p className="text-gray-700">
            <strong>Email:</strong> {customer.email}
          </p>

          <h3 className="text-lg font-normal mt-4 text-white" style={{ WebkitTextStroke: "0.5px black", // subtle black outline
          textStroke: "0.5px black"}} >Orders </h3>

          {customer.orders.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {customer.orders.map((order) => (
                <div key={order.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <p className="text-gray-700 text-sm mb-1">
                    Order #{order.id} - Date: {new Date(order.purchase_date).toLocaleString()}
                  </p>
                  <p className="text-gray-700 text-sm mb-1">Total: ₱{order.total_amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700">No orders yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
