import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCart,
  addToCart as addCartApi,
  updateQuantity as updateQuantityApi,
  removeFromCart as removeApi,
  clearCart as clearApi,
} from "../services/cartService";

const CartContext = createContext();
const LOCAL_CART_KEY = "gamestop_local_cart";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const getLocalCart = () => {
    try {
      const stored = localStorage.getItem(LOCAL_CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalCart = (items) => {
    setCartItems(items);
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save cart to localStorage", err);
    }
  };

  async function loadCart() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const isLoggedIn = token && token !== "null" && userId && userId !== "null";

    if (isLoggedIn) {
      try {
        const data = await getCart();
        setCartItems(data);
        return;
      } catch (error) {
        console.error("Failed to load backend cart, falling back to local:", error);
      }
    }
    setCartItems(getLocalCart());
  }

  async function addToCart(product) {
    if (!product) return;
    const productId = typeof product === "object" ? (product.productId || product.id) : product;
    if (!productId) return;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const isLoggedIn = token && token !== "null" && userId && userId !== "null";

    if (isLoggedIn) {
      try {
        await addCartApi(productId);
        await loadCart();
        return;
      } catch (error) {
        console.error("Backend addToCart failed, updating local cart:", error);
      }
    }

    // Local cart fallback
    const current = getLocalCart();
    const existingIndex = current.findIndex(
      (item) => (item.product?.productId || item.product?.id) === productId
    );

    let updated;
    if (existingIndex > -1) {
      updated = current.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      const productObj = typeof product === "object" ? product : { productId, name: "Product", price: 0 };
      updated = [
        ...current,
        {
          id: productId,
          quantity: 1,
          product: productObj,
        },
      ];
    }
    saveLocalCart(updated);
  }

  async function increaseQuantity(productId) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const isLoggedIn = token && token !== "null" && userId && userId !== "null";

    const item = cartItems.find(
      (i) => (i.product?.productId || i.product?.id) === productId
    );
    if (!item) return;

    if (isLoggedIn) {
      try {
        await updateQuantityApi(productId, item.quantity + 1);
        await loadCart();
        return;
      } catch (error) {
        console.error("Backend increaseQuantity failed:", error);
      }
    }

    const current = getLocalCart();
    const updated = current.map((i) =>
      (i.product?.productId || i.product?.id) === productId
        ? { ...i, quantity: i.quantity + 1 }
        : i
    );
    saveLocalCart(updated);
  }

  async function decreaseQuantity(productId) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const isLoggedIn = token && token !== "null" && userId && userId !== "null";

    const item = cartItems.find(
      (i) => (i.product?.productId || i.product?.id) === productId
    );
    if (!item) return;

    if (isLoggedIn) {
      try {
        if (item.quantity === 1) {
          await removeApi(productId);
        } else {
          await updateQuantityApi(productId, item.quantity - 1);
        }
        await loadCart();
        return;
      } catch (error) {
        console.error("Backend decreaseQuantity failed:", error);
      }
    }

    const current = getLocalCart();
    if (item.quantity === 1) {
      const updated = current.filter(
        (i) => (i.product?.productId || i.product?.id) !== productId
      );
      saveLocalCart(updated);
    } else {
      const updated = current.map((i) =>
        (i.product?.productId || i.product?.id) === productId
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
      saveLocalCart(updated);
    }
  }

  async function removeFromCart(productId) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const isLoggedIn = token && token !== "null" && userId && userId !== "null";

    if (isLoggedIn) {
      try {
        await removeApi(productId);
        await loadCart();
        return;
      } catch (error) {
        console.error("Backend removeFromCart failed:", error);
      }
    }

    const current = getLocalCart();
    const updated = current.filter(
      (i) => (i.product?.productId || i.product?.id) !== productId
    );
    saveLocalCart(updated);
  }

  async function clearCart() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const isLoggedIn = token && token !== "null" && userId && userId !== "null";

    if (isLoggedIn) {
      try {
        await clearApi();
      } catch (error) {
        console.error("Backend clearCart failed:", error);
      }
    }

    saveLocalCart([]);
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);