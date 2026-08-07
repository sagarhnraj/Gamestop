import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/products"
        element={<Products />}
      />
       
       <Route
       path="/cart"
       element={<Cart />}
       />

      <Route
        path="/product/:id"
        element={<ProductDetails />}
      />
      <Route path="/checkout" element={<Checkout />} />

       <Route
        path="/payment-success"
        element={<PaymentSuccess />}
       />

      <Route path="/orders" element={<Orders />} />

      <Route path="/profile" element={<Profile />} />

    </Routes>
    
  );
}

export default App;