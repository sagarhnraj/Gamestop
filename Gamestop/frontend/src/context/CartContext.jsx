import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCart,
  addToCart as addCartApi,
  updateQuantity,
  removeFromCart as removeApi,
  clearCart as clearApi,
} from "../services/cartService";

const CartContext = createContext();

export function CartProvider({ children }) {

  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {

    try {

      const data = await getCart();

      setCartItems(data);

    } catch (error) {

      console.error(error);

    }

  }

  async function addToCart(product) {

  console.log("PRODUCT RECEIVED:", product);
  console.log("PRODUCT ID:", product.productId);

  try {

    await addCartApi(product.productId);

    loadCart();

  } catch (error) {

    console.error(error);

  }

}

  async function increaseQuantity(productId) {

    const item = cartItems.find(
      (i) => i.product.productId === productId
    );

    if (!item) return;

    await updateQuantity(
      productId,
      item.quantity + 1
    );

    loadCart();

  }

  async function decreaseQuantity(productId) {

    const item = cartItems.find(
      (i) => i.product.productId === productId
    );

    if (!item) return;

    if (item.quantity === 1) {

      await removeApi(productId);

    } else {

      await updateQuantity(
        productId,
        item.quantity - 1
      );

    }

    loadCart();

  }

  async function removeFromCart(productId) {

    await removeApi(productId);

    loadCart();

  }

  async function clearCart() {

    await clearApi();

    setCartItems([]);

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
      }}
    >
      {children}
    </CartContext.Provider>
  );

}

export const useCart = () => useContext(CartContext);