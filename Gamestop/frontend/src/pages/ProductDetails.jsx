import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProductDetailsCard from "../components/products/ProductDetailsCard";

function ProductDetails() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">

        <ProductDetailsCard />

      </div>

      <Footer />

    </div>
  );
}

export default ProductDetails;