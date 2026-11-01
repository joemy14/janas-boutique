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
    // Read currentUser from localStorage to avoid relying on AuthContext
    const storedUser = typeof window !== "undefined" ? localStorage.getItem('currentUser') : null;
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    const role = currentUser.role;
    if (role === 'admin') {
      router.push('/admindashboard');
    } else if (role === 'staff') {
      router.push('/admin/orders');
    } else {
      router.push('/profile');
    }
  };

  const handleHomeClick = () => {
    const isAdmin = currentUser?.role === "admin";
    if (isAdmin) {
      router.push("/admindashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <nav
      className="text-[#1A1A1A] p-4 fixed top-0 left-0 w-full z-50 shadow-md transition-all duration-500"
      style={{ backgroundColor: "#FAF8F5" }}
    >
      {/* Boutique Logo */}
      <div className="navbar-logo-container" onClick={handleHomeClick} style={{ cursor: "pointer", paddingTop: showTitle ? "16px" : "0px", overflow: "hidden", marginBottom: "0px", height: showTitle ? "auto" : "0px", transition: "all 0.5s" }}>
        <div
          className={`transition-all duration-500 transform ${
            showTitle ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
          }`}
        >
          <img src="/images/JANA.png" alt="JANA's Boutique Logo" className="navbar-logo" style={{ filter: "brightness(0)" }} />
        </div>
      </div>

      {/* Main Navbar */}
      <div
        className={`grid grid-cols-3 items-center transition-all duration-500 ${
          showTitle ? "mt-6" : "mt-2"
        }`}
      >
        {/* LEFT SIDE → Search */}
        <div className="flex items-center gap-6 pl-6 justify-self-start">
          <FaSearch
            size={20}
            className="h-[18px] w-[18px] cursor-pointer hover:text-[#8B2A3C] md:h-6 md:w-6"
            onClick={() => setIsSearchOpen(true)}
          />
        </div>

        {/* CENTER → Nav Links */}
        <div
          className="flex min-w-0 justify-self-center gap-3 overflow-x-auto whitespace-nowrap text-[14px] md:gap-8 md:overflow-visible md:text-[18px]"
          style={{ fontFamily: "'Playfair Display', 'Times New Roman', Times, serif" }}
        >
          <Link href="/tops" className="relative hover:text-[#8B2A3C] after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[1px] after:bg-[#8B2A3C] hover:after:w-full after:transition-all after:duration-300">
            Tops
          </Link>
          <Link href="/bottoms" className="relative hover:text-[#8B2A3C] after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[1px] after:bg-[#8B2A3C] hover:after:w-full after:transition-all after:duration-300">
            Bottoms
          </Link>

          {/* Shoes Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setHoverShoes(true)}
            onMouseLeave={() => setHoverShoes(false)}
          >
            <button
              className="relative flex items-center gap-1 hover:text-[#8B2A3C] after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[1px] after:bg-[#8B2A3C] hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
              onClick={handleToggleDropdown}
              style={{ fontFamily: "'Playfair Display', 'Times New Roman', Times, serif" }}
            >
              Shoes
              <FaChevronDown
                size={20}
                className={`h-[14px] w-[14px] transition-transform duration-300 md:h-5 md:w-5 ${showShoesDropdown ? "rotate-180" : "rotate-0"}`}
                style={{ opacity: hoverShoes ? 1 : 0 }}
              />
            </button>

            {(showShoesDropdown || closingDropdown) && (
              <div
                className={`absolute left-0 mt-2 w-32 bg-[#B29785] text-[#1A1A1A] rounded-none shadow-lg overflow-hidden z-50 ${
                  closingDropdown ? "animate-slideUp" : "animate-slideDown"
                }`}
              >
                <Link href="/shoes/sandals" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-[#1A1A1A] hover:text-[#8B2A3C] hover:bg-[#C2A88D]">Sandals</a>
                </Link>
                <Link href="/shoes/heels" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-[#1A1A1A] hover:text-[#8B2A3C] hover:bg-[#C2A88D]">Heels</a>
                </Link>
                <Link href="/shoes/flats" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-[#1A1A1A] hover:text-[#8B2A3C] hover:bg-[#C2A88D]">Flats</a>
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
              className="relative flex items-center gap-1 hover:text-[#8B2A3C] after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[1px] after:bg-[#8B2A3C] hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
              onClick={handleToggleAccessoriesDropdown}
              style={{ fontFamily: "'Playfair Display', 'Times New Roman', Times, serif" }}
            >
              Accessories
              <FaChevronDown
                size={20}
                className={`h-[14px] w-[14px] transition-transform duration-300 md:h-5 md:w-5 ${showAccessoriesDropdown ? "rotate-180" : "rotate-0"}`}
                style={{ opacity: hoverAccessories ? 1 : 0 }}
              />
            </button>

            {(showAccessoriesDropdown || closingAccessoriesDropdown) && (
              <div
                className={`absolute left-0 mt-2 w-32 bg-[#B29785] text-[#1A1A1A] rounded-none shadow-lg overflow-hidden z-50 ${
                  closingAccessoriesDropdown ? "animate-slideUp" : "animate-slideDown"
                }`}
              >
                <Link href="/accessories/handbags" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-[#1A1A1A] hover:text-[#8B2A3C] hover:bg-[#C2A88D]">Handbags</a>
                </Link>
                <Link href="/accessories/earrings" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-[#1A1A1A] hover:text-[#8B2A3C] hover:bg-[#C2A88D]">Earrings</a>
                </Link>
                <Link href="/accessories/necklace" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-[#1A1A1A] hover:text-[#8B2A3C] hover:bg-[#C2A88D]">Necklaces</a>
                </Link>
                <Link href="/accessories/bracelets" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-[#1A1A1A] hover:text-[#8B2A3C] hover:bg-[#C2A88D]">Bracelets</a>
                </Link>
                <Link href="/accessories/rings" legacyBehavior>
                  <a className="relative block w-full px-4 py-2 text-[#1A1A1A] hover:text-[#8B2A3C] hover:bg-[#C2A88D]">Rings</a>
                </Link>
              </div>
            )}
          </div>

          {/* More main links */}
          <Link href="/dresses" className="relative hover:text-[#8B2A3C] after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[1px] after:bg-[#8B2A3C] hover:after:w-full after:transition-all after:duration-300">
            Dresses
          </Link>
          <Link href="/perfumes" className="relative hover:text-[#8B2A3C] after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[1px] after:bg-[#8B2A3C] hover:after:w-full after:transition-all after:duration-300">
            Perfumes
          </Link>
        </div>

        {/* RIGHT SIDE → Profile & Cart */}
        <div className="flex shrink-0 items-center justify-self-end gap-3 pr-6 md:gap-6">
          {/* ✅ Profile Icon */}
          <FaUserCircle
            size={20}
            className="h-[18px] w-[18px] cursor-pointer hover:text-[#8B2A3C] md:h-6 md:w-6"
            onClick={handleProfileClick}
          />

          {/* Cart → ONLY show if NOT admin */}
          {currentUser?.role !== "admin" && (
            <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
              <FaShoppingCart size={20} className="h-[18px] w-[18px] hover:text-[#8B2A3C] md:h-6 md:w-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#8B2A3C] text-[#F3EBDD] text-xs px-1 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      {isCartOpen && currentUser?.role !== "admin" && (
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
