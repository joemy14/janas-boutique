import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaChevronDown, FaSearch, FaShoppingBag } from "react-icons/fa";
import CartSidebar from "@/components/CartSidebar";
import SearchSideBar from "@/components/SearchSideBar";
import ThemeToggle from "@/components/ThemeToggle";
import Wordmark from "@/components/Wordmark";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const linkClass = "link-underline transition-colors hover:text-gold";
const iconButtonClass = "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-gold hover:text-gold";

interface DropdownProps {
  label: string;
  items: { href: string; label: string }[];
}

function NavDropdown({ label, items }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const toggle = () => {
    if (open) {
      setClosing(true);
      setTimeout(() => {
        setOpen(false);
        setClosing(false);
      }, 300);
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="relative">
      <button className={`${linkClass} flex cursor-pointer items-center gap-1.5 uppercase`} onClick={toggle}>
        {label}
        <FaChevronDown size={9} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {(open || closing) && (
        <div
          className={`card absolute top-full left-1/2 z-50 mt-3 w-44 -translate-x-1/2 overflow-hidden py-1 shadow-xl ${closing ? "animate-slideUp" : "animate-slideDown"}`}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 font-serif text-base tracking-normal normal-case transition-colors hover:bg-surface-2 hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { cartItems } = useCart();
  const isAdmin = !!currentUser?.isAdmin || currentUser?.role === "admin";
  const hasAdminAccess = isAdmin || currentUser?.role === "staff";

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Collapse the wordmark when scrolling down, show it again near the top.
  const [showTitle, setShowTitle] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const threshold = 150;
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScrollY.current) setShowTitle(false);
      else if (current < threshold) setShowTitle(true);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProfileClick = () => {
    if (!currentUser) router.push("/auth");
    else router.push(isAdmin ? "/admindashboard" : "/profile");
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-line bg-paper/90 text-ink backdrop-blur-md transition-colors">
      {/* Wordmark */}
      <div
        className={`flex justify-center overflow-hidden transition-all duration-500 ${showTitle ? "max-h-24 pt-5 opacity-100" : "max-h-0 pt-0 opacity-0"}`}
      >
        <Link href="/" aria-label="Jana's Boutique home">
          <Wordmark />
        </Link>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        <div className="flex h-9 w-28 items-center">
          <button
            type="button"
            className={iconButtonClass}
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
          >
            <FaSearch size={18} />
          </button>
        </div>

        <div className="flex items-center gap-8 font-display text-sm font-semibold tracking-[0.2em] uppercase">
          <Link href="/tops" className={linkClass}>
            Tops
          </Link>
          <Link href="/bottoms" className={linkClass}>
            Bottoms
          </Link>
          <NavDropdown
            label="Shoes"
            items={[
              { href: "/shoes/sandals", label: "Sandals" },
              { href: "/shoes/heels", label: "Heels" },
              { href: "/shoes/flats", label: "Flats" },
            ]}
          />
          <NavDropdown
            label="Accessories"
            items={[
              { href: "/accessories/handbags", label: "Handbags" },
              { href: "/accessories/earrings", label: "Earrings" },
              { href: "/accessories/necklace", label: "Necklaces" },
              { href: "/accessories/bracelets", label: "Bracelets" },
              { href: "/accessories/rings", label: "Rings" },
            ]}
          />
          <Link href="/dresses" className={linkClass}>
            Dresses
          </Link>
          <Link href="/perfumes" className={linkClass}>
            Perfumes
          </Link>
        </div>

        <div className="flex h-9 w-auto items-center justify-end gap-3">
          <ThemeToggle className="shrink-0" />
          {hasAdminAccess ? (
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              <button
                type="button"
                className={iconButtonClass}
                onClick={() => setIsProfileOpen((open) => !open)}
                aria-label="Account menu"
                aria-expanded={isProfileOpen}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                </svg>
              </button>
              {isProfileOpen && (
                <div className="card animate-slideDown absolute top-full right-0 z-50 mt-3 w-52 p-2 shadow-xl">
                  <Link
                    href="/admindashboard"
                    onClick={() => setIsProfileOpen(false)}
                    className="block rounded-sm px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-2 hover:text-gold"
                  >
                    Admin Dashboard
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className={iconButtonClass}
              onClick={handleProfileClick}
              aria-label="Account"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
              </svg>
            </button>
          )}
          {!isAdmin && (
            <button
              type="button"
              className={`${iconButtonClass} relative shrink-0`}
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
            >
              <FaShoppingBag size={20} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-accent-ink">
                  {cartItems.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {isCartOpen && !isAdmin && <CartSidebar onClose={() => setIsCartOpen(false)} />}
      {isSearchOpen && <SearchSideBar onClose={() => setIsSearchOpen(false)} />}
    </nav>
  );
}
