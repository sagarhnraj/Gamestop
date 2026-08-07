import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import FeaturedProducts from "../components/home/FeaturedProducts";
import CategorySection from "../components/home/CategorySection";
import NewArrivals from "../components/home/NewArrivals";
import Footer from "../components/layout/Footer";

function Home() {
  return (
    <div className="bg-zinc-950 text-white min-h-screen">

      <Navbar />

      <Hero />

      <FeaturedProducts />

      <CategorySection />

      <NewArrivals />

      <Footer />

    </div>
  );
}

export default Home;