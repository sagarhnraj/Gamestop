import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link } from "react-router-dom";

function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <Navbar />

      <div className="flex flex-col items-center justify-center py-32">

        <h1 className="text-6xl mb-6">
          ✅
        </h1>

        <h2 className="text-4xl font-bold">
          Payment Successful
        </h2>

        <p className="mt-4 text-gray-400">
          Thank you for shopping with GameStop.
        </p>

        <Link
          to="/"
          className="mt-10 bg-red-600 px-8 py-4 rounded-xl"
        >
          Continue Shopping
        </Link>

      </div>

      <Footer />

    </div>
  );
}

export default PaymentSuccess;