import "@/styles/globals.css";
import { useState, useEffect, createContext } from "react";
import { useRouter } from "next/router";

export const CartContext = createContext();
export const AuthContext = createContext();

export default function App({ Component, pageProps }) {
  const [cartItems, setCartItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter();

  // Load cart and user from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCartItems(JSON.parse(savedCart));

    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsLoggedIn(true);

      const role = savedUser.role?.toLowerCase();
      if (role === "admin" && !router.pathname.startsWith("/admin") && router.pathname !== "/admindashboard") {
        router.replace("/admindashboard");
      }
    }
  }, [router]);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Stock-safe add to cart
  const addToCart = (product, quantity = 1, size = null) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.size === size
      );

      if (existingIndex > -1) {
        const existingItem = prev[existingIndex];
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
        const updated = [...prev];
        updated[existingIndex] = { ...existingItem, quantity: newQuantity };
        return updated;
      } else {
        return [...prev, { ...product, quantity: Math.min(quantity, product.stock), size }];
      }
    });
  };

  // Stock-safe update quantity
  const updateCartItemQuantity = (product, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === product.id && item.size === product.size
          ? { ...item, quantity: Math.min(newQuantity, item.stock) }
          : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (product) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === product.id && item.size === product.size))
    );
  };

  // Login function
  const login = (user) => {
    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentUser(user);
    setIsLoggedIn(true);

    const role = user.role?.toLowerCase();
    if (role === "admin") {
      router.replace("/admindashboard");
    } else {
      router.replace("/profile");
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setIsLoggedIn(false);
    router.replace("/auth");
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      setCartItems, // ✅ provide setCartItems for checkout.js
      addToCart,
      updateCartItemQuantity,
      removeFromCart
    }}>
      <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout }}>
        <Component {...pageProps} />
      </AuthContext.Provider>
    </CartContext.Provider>
  );
}
