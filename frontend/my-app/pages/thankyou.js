// pages/thankyou.js
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ThankYou() {
  const router = useRouter();

  // Optional: redirect to home after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-black font-serif">
  <h1 className="text-3xl font-bold mb-4">Thank you for your order!</h1>
  <p className="text-lg">
    Your payment was successful and your order is confirmed.
  </p>
  <p className="mt-2 text-lg">
    Please check your email for the detailed receipt with your order ID, items, and total amount.
  </p>
  <p className="mt-4 text-gray-600">Redirecting to home...</p>
</div>

  );
}
