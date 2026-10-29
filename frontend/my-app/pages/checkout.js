import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { CartContext } from "../pages/_app";
import Image from "next/image";
import { AiOutlineHome } from "react-icons/ai";
import { FaChevronDown } from "react-icons/fa";

export default function Checkout() {
  const router = useRouter();
  const { cartItems, setCartItems } = useContext(CartContext);

  const paymentOptions = [{ name: "GCash", logo: "/images/GCASH.png" }];
  const [selectedPayment, setSelectedPayment] = useState("GCash");

  // Form state
  const [countryOpen, setCountryOpen] = useState(false);
  const [country, setCountry] = useState("Philippines");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [alert, setAlert] = useState("");
  const [showGcashModal, setShowGcashModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load cart & saved info
  useEffect(() => {
  const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (savedCart.length > 0) setCartItems(savedCart);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  if (currentUser.email) {
    const savedInfo = JSON.parse(
      localStorage.getItem(`savedCheckoutInfo_${currentUser.email}`) || "{}"
    );
    if (savedInfo.firstName) setFirstName(savedInfo.firstName);
    if (savedInfo.lastName) setLastName(savedInfo.lastName);
    if (savedInfo.address) setAddress(savedInfo.address);
    if (savedInfo.city) setCity(savedInfo.city);
    if (savedInfo.state) setState(savedInfo.state);
    if (savedInfo.zip) setZip(savedInfo.zip);
    if (savedInfo.phone) setPhone(savedInfo.phone);
    if (savedInfo.country) setCountry(savedInfo.country);
  }
}, [setCartItems]);


  // Disable scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showGcashModal ? "hidden" : "auto";
  }, [showGcashModal]);

  // Cart totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = cartItems.length > 0 ? 100 : 0;
  const total = subtotal + shippingCost;

  const handlePayNow = () => {
    if (!firstName || !lastName || !address || !city || !state || !zip || !phone) {
      setAlert("Please fill in all required fields!");
      return;
    }
    if (cartItems.length === 0) {
      setAlert("Your cart is empty!");
      return;
    }
    if (selectedPayment === "GCash") {
      setShowGcashModal(true);
      return;
    }
    processOrder();
  };

  // ... all your imports and hooks remain the same

  const sendReceipt = async (order) => {
  try {
    const res = await fetch("http://localhost/Backend/cc105backend/send_receipt.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    const data = await res.json();
    if (!data.success) {
      console.error("Receipt error:", data.message);
    }
  } catch (err) {
    console.error("Failed to send receipt:", err);
  }
};


const processOrder = async () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  if (!currentUser.email) {
    setAlert("You must be logged in to place an order.");
    return;
  }

  // Save user info if rememberMe is checked
if (rememberMe) {
  const info = {
    firstName,
    lastName,
    address,
    city,
    state,
    zip,
    phone,
    country,
  };
  localStorage.setItem(`savedCheckoutInfo_${currentUser.email}`, JSON.stringify(info));
}


  // Generate unique orderId and billingId
  const orderId = `ORD-${Date.now()}`;
  const billingId = `BILL-${Math.floor(Math.random() * 1000000)}`;

  const order = {
    firstName,
    lastName,
    email: currentUser.email,
    address,
    city,
    state,
    zipcode: zip,
    phone,
    cart: cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      image:
        item.image || item.image_url?.replace("public/", "/") || "/images/placeholder.png",
      quantity: item.quantity,
      price: item.price,
    })),
    total,
    shippingCost,
    paymentMethod: selectedPayment,
    date: new Date().toISOString(),
    orderId,
    billingId, // add billing ID to order payload
  };

  setIsProcessing(true);

  try {
    const res = await fetch("http://localhost/Backend/cc105backend/checkout.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      setAlert("Server returned invalid response. Please try again.");
      return;
    }

    if (!data.success) {
      setAlert(`Error: ${data.message}`);
      return;
    }

    // Save orders in localStorage
    const userOrdersKey = `orders_${currentUser.email}`;
    const existingOrders = JSON.parse(localStorage.getItem(userOrdersKey) || "[]");
    existingOrders.push(order);
    localStorage.setItem(userOrdersKey, JSON.stringify(existingOrders));

    // Clear cart
    setCartItems([]);
    localStorage.setItem("cart", JSON.stringify([]));

    // Send receipt email
await sendReceipt(order);

    router.push("/thankyou");
  } catch (err) {
    console.error("Order error:", err);
    setAlert("Failed to place order. Please try again.");
  } finally {
    setIsProcessing(false);
  }
};


  const handleGcashPaymentComplete = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(
        "http://localhost/Backend/cc105backend/pay_gcash.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ total }),
        }
      );

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        setAlert("Server returned invalid response. Please try again.");
        return;
      }

      if (data.status === "success") {
        setAlert(`Payment successful! Amount: ₱${data.amount}`);
        setShowGcashModal(false);
        processOrder();
      } else {
        setAlert(`Payment failed: ${data.message}`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setAlert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-serif text-black">
      {/* Navbar */}
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center">
          <button
            onClick={() => router.push("/")}
            className="text-2xl text-black mr-4 hover:text-gray-700"
            aria-label="Go to Homepage"
          >
            <AiOutlineHome />
          </button>
          <span className="text-2xl font-normal">Jana’s Boutique</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm space-y-4">
          <h1 className="text-2xl font-bold mb-4">Shipping & Payment</h1>
          {alert && <div className="bg-red-200 text-red-800 p-3 rounded">{alert}</div>}

          {/* Country */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCountryOpen(!countryOpen)}
              className="w-full p-2 border rounded flex justify-between items-center text-black"
            >
              <span>{country}</span>
              <FaChevronDown
                className={`transition-transform duration-200 ${
                  countryOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {countryOpen && (
              <div className="absolute w-full bg-white border rounded mt-1 z-10">
                <button
                  className="w-full text-left p-2 hover:bg-gray-100"
                  onClick={() => {
                    setCountry("Philippines");
                    setCountryOpen(false);
                  }}
                >
                  Philippines
                </button>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 border rounded text-black placeholder-black"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2 border rounded text-black placeholder-black"
            />
          </div>

          {/* Address */}
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border rounded text-black placeholder-black"
          />

          {/* City / Province / ZIP */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-2 border rounded text-black placeholder-black"
            />
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Province"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2 border rounded text-black placeholder-black"
              />
              <input
                type="text"
                placeholder="ZIP / Postal"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full p-2 border rounded text-black placeholder-black"
              />
            </div>
          </div>

          {/* Phone */}
          <input
            type="tel"
            placeholder="Phone +63"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded text-black placeholder-black"
          />

          {/* Payment */}
          <div className="pt-2 border-t border-gray-300 space-y-4">
            <p className="font-semibold">Payment Method</p>
            <p className="text-sm">All transactions are secure and encrypted.</p>

            <div className="flex flex-col gap-3 mt-2">
              {paymentOptions.map((option) => (
                <div
                  key={option.name}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setSelectedPayment(option.name)}
                >
                  <div className="flex items-center gap-2 p-1 border border-black rounded-md w-32 h-16">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        selectedPayment === option.name
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-400 bg-white"
                      }`}
                    >
                      {selectedPayment === option.name && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>

                    <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={option.logo}
                        alt={option.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-sm">Save my information for faster checkout</span>
            </label>

            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="w-full bg-black text-white py-3 rounded mt-4 font-semibold flex items-center justify-center gap-2 transition-transform duration-150 ease-in-out hover:translate-x-1 active:scale-95 cursor-pointer"
            >
              {isProcessing ? "Processing..." : "Pay Now"} <span>→</span>
            </button>
          </div>
        </div>

        {/* Order Summary */}
<div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm text-black">
  <h2 className="text-xl font-bold mb-4">Your Order</h2>
  <div className="space-y-4">
    {cartItems.map((item, idx) => (
      <div key={idx} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 relative flex-shrink-0">
  {(() => {
    const imageSrc = item?.image_url
      ? item.image_url.startsWith("http")
        ? item.image_url // full backend URL
        : "/" + item.image_url.replace("public/", "") // old local image
      : item?.image
        ? "/" + item.image // fallback for very old products
        : "/placeholder.png"; // default placeholder

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

          <span>
            {item.name} x {item.quantity}
          </span>
        </div>
        <span>₱{(item.price * item.quantity).toLocaleString()}</span>
      </div>
    ))}
    <div className="flex justify-between font-semibold mt-2">
      <span>Shipping:</span>
      <span>₱{shippingCost.toLocaleString()}</span>
    </div>
    <div className="flex justify-between font-bold text-lg mt-2">
      <span>Total:</span>
      <span>₱{total.toLocaleString()}</span>
    </div>

    {/* Cancel Button */}
<div className="mt-4 text-center">
  <button
    type="button"
    onClick={() => {
      // Clear cart
      setCartItems([]);
      localStorage.setItem("cart", JSON.stringify([]));

      // Clear saved checkout info for current user
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      if (currentUser.email) {
        localStorage.removeItem(`savedCheckoutInfo_${currentUser.email}`);
      }

      // Also reset form fields
      setFirstName("");
      setLastName("");
      setAddress("");
      setCity("");
      setState("");
      setZip("");
      setPhone("");
      setCountry("Philippines");
      setRememberMe(false);
    }}
    className="px-4 py-2 border border-black bg-white text-black rounded transition hover:bg-gray-100 cursor-pointer"
    style={{ fontFamily: "'Times New Roman', Times, serif" }}
  >
    Cancel
  </button>
</div>

  </div>
</div>

      </main>

      {/* GCash Modal */}
      {showGcashModal && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-96 z-50">
          <div className="bg-white shadow-lg overflow-hidden">
            <div className="bg-black text-white p-4 flex flex-col items-center space-y-1">
              <h2 className="text-xl font-normal">Pay with GCash</h2>
              <span className="text-sm font-normal">Jana's Boutique | janas.work.ph</span>
            </div>

            <div className="p-6 space-y-4 text-center text-black">
              <p className="font-normal text-sm text-gray-700">
                Send your payment to the following GCash number:
              </p>
              <p className="font-normal text-lg text-gray-900">0948-892-9764</p>
              <p className="font-normal text-lg text-gray-900">
                Amount: ₱{total.toLocaleString()}
              </p>

              <button
                type="button"
                onClick={handleGcashPaymentComplete}
                disabled={isProcessing}
                className="w-full bg-black text-white py-2 font-normal hover:bg-gray-800 transition cursor-pointer"
              >
                {isProcessing ? "Processing..." : "Confirm Payment"}
              </button>

              <button
                type="button"
                onClick={() => setShowGcashModal(false)}
                className="w-full bg-gray-300 text-black py-2 font-normal hover:bg-gray-400 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="p-4 flex justify-center items-center border-t border-gray-100">
              <img src="/images/GCASH.png" alt="GCash Logo" className="w-24 h-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
