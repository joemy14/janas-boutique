// pages/index.js
import Image from "next/image";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useRef } from "react";

export default function Home({ cartItems, setCartItems }) {
  const router = useRouter();
  const scrollRef = useRef(null);

  const handleShopNow = () => {
    router.push("/");
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount =
        direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const featuredImages = [
  { src: "topsfeatured.jpg", category: "Tops" },
  { src: "bottomsfeatured.jpg", category: "Bottoms" },
  { src: "dressesfeatured.jpg", category: "Dresses" },
  { src: "perfumefeatured.jpg", category: "Perfumes" },
  { src: "shoesfeatured.jpg", category: "Shoes" },
  { src: "accessoriesfeatured.jpg", category: "Accessories" },
];


  return (
    <div className="bg-[#faf7f5] text-gray-900">
      <Navbar 
      cartItems={cartItems}
        onRemoveItem={(itemId) => {
          setCartItems(cartItems.filter((item) => item.id !== itemId));
        }}
      />

      {/* Hero Section */}
<section className="relative w-full h-screen overflow-hidden">
  {/* Background Image */}
  <Image
    src="/images/homepage.jpg"
    alt="Boutique Background"
    fill
    className="object-cover object-center brightness-[0.7]"
    priority
  />

  {/* Text Overlay */}
  <div
    className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
    style={{ paddingTop: "8rem" }}
  >
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="text-5xl md:text-7xl font-serif text-white drop-shadow-lg z-10"
    >
      Timeless Elegance
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2 }}
      className="mt-4 text-lg md:text-xl text-gray-200 z-10"
    >
      Discover pieces that define your unique style.
    </motion.p>

    <motion.button
      onClick={handleShopNow}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4 }}
      className="mt-8 px-8 py-3 bg-white text-gray-900 font-medium rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 z-10"
    >
      Shop Now
    </motion.button>
  </div>
</section>



      {/* About / Collection Section */}
<section className="py-24 px-6 md:px-16 bg-white text-center">
  <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-6 text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
    Our Story
  </h2>
  <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-700 leading-relaxed" style={{ fontFamily: "'Merriweather', serif" }}>
    Born from a passion for elegance and authenticity, our boutique brings you curated fashion pieces that
    embody grace, quality, and timeless charm. Every collection tells a story — yours.
  </p>
</section>


{/* Featured Products Section */}
<section className="py-16 px-6 md:px-12 relative bg-gradient-to-r from-[#fef9f5] via-[#faf7f5] to-[#fef9f5]">
  <h2 className="text-3xl font-serif text-center mb-10">Featured Collection</h2>

  {/* Left Arrow */}
  <button
    onClick={() => scroll("left")}
    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 shadow hover:bg-gray-100 z-10 cursor-pointer"
  >
    &#8592;
  </button>

  {/* Right Arrow */}
  <button
    onClick={() => scroll("right")}
    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 shadow hover:bg-gray-100 z-10 cursor-pointer"
  >
    &#8594;
  </button>

  <div
    ref={scrollRef}
    className="flex gap-8 overflow-x-auto scroll-smooth px-4"
    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
  >
    <style jsx>{`
      div::-webkit-scrollbar {
        display: none;
      }
    `}</style>

    {featuredImages.map((item, i) => (
  <div
    key={i}
    className="min-w-[300px] md:min-w-[350px] relative group overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white p-2 border border-black/50"
  >
    <Image
      src={`/images/${item.src}`}
      alt={item.category}
      width={500}
      height={600}
      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
    />
    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
      <span className="bg-white text-gray-900 px-5 py-2 font-medium">
        {item.category}
      </span>
    </div>
  </div>
))}

  </div>
</section>


      {/* Footer */}
<footer className="py-12" style={{ backgroundColor: "#585858ff", fontFamily: "'Playfair Display', serif" }}>
  <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-10">

    {/* About / Brand (Left) */}
    <div className="flex flex-col items-start md:items-start justify-center text-left">
      <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-3 text-white">
        Jana's Boutique
      </h3>
      <p className="text-sm md:text-base text-white/90 leading-relaxed">
        Timeless elegance and curated fashion pieces. Stay stylish, always.
      </p>
    </div>

    {/* Contact / Socials (Center) */}
    <div className="flex flex-col items-center justify-center text-center">
      <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-3 text-white">
        Contact Us
      </h3>
      <div className="flex flex-col gap-2 text-white/90 text-sm md:text-base">
        <div className="flex items-center gap-2">
          <EnvelopeIcon className="h-5 w-5 text-white/90" />
          <span>jana.workplace.ph.com</span>
        </div>
        <div className="flex items-center gap-2">
          <PhoneIcon className="h-5 w-5 text-white/90" />
          <span>+63 948 892 9764</span>
        </div>
      </div>
    </div>

    {/* Payment (Right) */}
    <div className="flex flex-col items-end md:items-end justify-center text-right">
      <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-3 text-white">
        Payment Method
      </h3>
      <div className="flex justify-end items-center gap-4 mt-2">
        <img
          src="/images/GCASH.png"
          alt="GCash"
          className="h-12 md:h-10 object-contain shadow-lg rounded-md"
        />
      </div>
    </div>

  </div>

  {/* Bottom copyright */}
  <div className="mt-10 text-center text-sm text-white/80 font-serif">
    © {new Date().getFullYear()} Jana's Boutique — All rights reserved.
  </div>
</footer>


    </div>
  );
}
