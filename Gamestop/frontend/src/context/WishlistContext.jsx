import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();
const WISHLIST_STORAGE_KEY = "gamestop_wishlist";

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (err) {
      console.error("Failed to save wishlist:", err);
    }
  }, [wishlist]);

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlist.some(
      (item) => (item.productId || item.id) === productId
    );
  };

  const toggleWishlist = (product) => {
    if (!product) return;
    const productId = product.productId || product.id;
    if (!productId) return;

    if (isInWishlist(productId)) {
      setWishlist((prev) =>
        prev.filter((item) => (item.productId || item.id) !== productId)
      );
    } else {
      setWishlist((prev) => [...prev, product]);
    }
  };

  const removeFromWishlist = (productId) => {
    if (!productId) return;
    setWishlist((prev) =>
      prev.filter((item) => (item.productId || item.id) !== productId)
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
