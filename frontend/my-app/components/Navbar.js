import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import CartSidebar from "./CartSidebar";
import SearchSideBar from "./SearchSideBar";
import { AuthContext } from "@/pages/_app";
import { FaShoppingCart, FaUserCircle, FaChevronDown, FaSearch } from "react-icons/fa";
import { useRouter } from "next/router";

export default function Navbar({ cartItems = [], onRemoveItem = () => {} }) {
  const router = useRouter();
  const { currentUser } = useContext(AuthContext); // ✅ use AuthContext

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Shoes states
  const [showShoesDropdown, setShowShoesDropdown] = useState(false);
  const [hoverShoes, setHoverShoes] = useState(false);
  const [closingDropdown, setClosingDropdown] = useState(false);

  // Accessories states
  const [showAccessoriesDropdown, setShowAccessoriesDropdown] = useState(false);
  const [hoverAccessories, setHoverAccessories] = useState(false);
  const [closingAccessoriesDropdown, setClosingAccessoriesDropdown] = useState(false);

  // Boutique title scroll
  const [showTitle, setShowTitle] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const threshold = 150;

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScrollY) {
        setShowTitle(false);
      } else {
        if (currentScroll < threshold) {
          setShowTitle(true);
        }
      }
      setLastScrollY(currentScroll);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Toggle functions
  const handleToggleDropdown = () => {
    if (showShoesDropdown) {
      setClosingDropdown(true);
      setTimeout(() => {
        setShowShoesDropdown(false);
        setClosingDropdown(false);
      }, 300);
    } else {
      setShowShoesDropdown(true);
    }
  };

  const handleToggleAccessoriesDropdown = () => {
    if (showAccessoriesDropdown) {
      setClosingAccessoriesDropdown(true);
      setTimeout(() => {
        setShowAccessoriesDropdown(false);
        setClosingAccessoriesDropdown(false);
      }, 300);
    } else {
      setShowAccessoriesDropdown(true);
    }
  };

  // ✅ Profile icon click logic
  const handleProfileClick = () => {
    if (!currentUser) {
      router.push("/auth");
      return;
    }

    const isAdmin = currentUser?.is_admin === 1;
    if (isAdmin) {
      router.push("/admindashboard");
    } else {
      router.push("/profile");
    }
  };

  const handleHomeClick = () => {
    const isAdmin = currentUser?.is_admin === 1;
    if (isAdmin) {
      router.push("/admindashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <nav
      className="text-white p-4 fixed top-0 left-0 w-full z-50 shadow-md transition-all duration-500"
      style={{ backgroundColor: "#B29785" }}
    >
      {/* Boutique Logo */}
      <div className="navbar-logo-container" onClick={handleHomeClick} style={{ cursor: "pointer" }}>
        <div
          className={`transition-all duration-500 transform ${
            showTitle ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
          }`}
        >
          <img src="/images/JANA.png" alt="JANA's Boutique Logo" className="navbar-logo" />
        </div>
      </div>

      {/* Main Navbar */}
      <div
        className={`flex justify-between items-center transition-all duration-500 ${
          showTitle ? "mt-14" : "mt-2"
        }`}
      >
        {/* LEFT SIDE → Search */}
        <div className="flex items-center gap-6">
          <FaSearch
            size={24}
            className="cursor-pointer hover:text-gray-300"
            onClick={() => setIsSearchOpen(true)}
          />
        </div>

        {/* CENTER → Nav Links */}
        <div
          className="flex gap-8 mx-auto text-xl"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          <a href="/tops" className="relative hover:text-gray-300 after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300">
            Tops
          </a>
          <a href="/bottoms" className="relative hover:text-gray-300 after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300">
            Bottoms
          </a>

          {/* Shoes Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setHoverShoes(true)}
            onMouseLeave={() => setHoverShoes(false)}
          >
            <button
              className="relative flex items-center gap-1 hover:text-gray-300 after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
              onClick={handleToggleDropdown}
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              Shoes
              <FaChevronDown
                className={`transition-transform duration-300 ${showShoesDropdown ? "rotate-180" : "rotate-0"}`}
                style={{ opacity: hoverShoes ? 1 : 0 }}
              />
            </button>

            {(showShoesDropdown || closingDropdown) && (
              <div
                className={`absolute left-0 mt-2 w-32 bg-[#B29785] text-black rounded-none shadow-lg overflow-hidden z-50 ${
                  closingDropdown ? "animate-slideUp" : "animate-slideDown"
                }`}
              >
                <Link href="/shoes/sandals" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-white hover:bg-[#C2A88D]">Sandals</a>
                </Link>
                <Link href="/shoes/heels" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-white hover:bg-[#C2A88D]">Heels</a>
                </Link>
                <Link href="/shoes/flats" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-white hover:bg-[#C2A88D]">Flats</a>
                </Link>
              </div>
            )}
          </div>

          {/* Accessories Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setHoverAccessories(true)}
            onMouseLeave={() => setHoverAccessories(false)}
          >
            <button
              className="relative flex items-center gap-1 hover:text-gray-300 after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
              onClick={handleToggleAccessoriesDropdown}
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              Accessories
              <FaChevronDown
                className={`transition-transform duration-300 ${showAccessoriesDropdown ? "rotate-180" : "rotate-0"}`}
                style={{ opacity: hoverAccessories ? 1 : 0 }}
              />
            </button>

            {(showAccessoriesDropdown || closingAccessoriesDropdown) && (
              <div
                className={`absolute left-0 mt-2 w-32 bg-[#B29785] text-black rounded-none shadow-lg overflow-hidden z-50 ${
                  closingAccessoriesDropdown ? "animate-slideUp" : "animate-slideDown"
                }`}
              >
                <Link href="/accessories/handbags" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-white hover:bg-[#C2A88D]">Handbags</a>
                </Link>
                <Link href="/accessories/earrings" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-white hover:bg-[#C2A88D]">Earrings</a>
                </Link>
                <Link href="/accessories/necklace" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-white hover:bg-[#C2A88D]">Necklaces</a>
                </Link>
                <Link href="/accessories/bracelets" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-white hover:bg-[#C2A88D]">Bracelets</a>
                </Link>
                <Link href="/accessories/rings" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-white hover:bg-[#C2A88D]">Rings</a>
                </Link>
              </div>
            )}
          </div>

          {/* More main links */}
          <a href="/dresses" className="relative hover:text-gray-300 after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300">
            Dresses
          </a>
          <a href="/perfumes" className="relative hover:text-gray-300 after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300">
            Perfumes
          </a>
        </div>

        {/* RIGHT SIDE → Profile & Cart */}
        <div className="flex items-center gap-6">
          {/* ✅ Profile Icon */}
          <FaUserCircle
            size={28}
            className="cursor-pointer hover:text-gray-300"
            onClick={handleProfileClick}
          />

          {/* Cart → ONLY show if NOT admin */}
          {!currentUser?.is_admin && (
            <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
              <FaShoppingCart size={28} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      {isCartOpen && !currentUser?.is_admin && (
        <CartSidebar
          cartItems={cartItems}
          onClose={() => setIsCartOpen(false)}
          onRemoveItem={onRemoveItem}
        />
      )}

      {/* Search Modal */}
      {isSearchOpen && <SearchSideBar onClose={() => setIsSearchOpen(false)} />}
    </nav>
  );
}
