import { useNavigate } from "react-router-dom";
import Button from "../common/Button";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-red-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col-reverse lg:flex-row items-center justify-between gap-12">

        {/* Left Content */}
        <div className="max-w-2xl">

          <p className="text-red-500 font-semibold uppercase tracking-widest mb-3">
            Welcome to GameStop
          </p>

          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Level Up Your
            <span className="text-red-500"> Gaming </span>
            Experience
          </h1>

          <p className="text-zinc-300 text-lg mb-8">
            Explore the latest PlayStation, Xbox, Nintendo and PC games with unbeatable offers.
          </p>

          <div className="flex gap-4">
            <Button
              text="Shop Now"
              size="lg"
              fullWidth={false}
              onClick={() => navigate("/products")}
            />

            <Button
              text="Explore"
              variant="secondary"
              size="lg"
              fullWidth={false}
              onClick={() => navigate("/products")}
            />
          </div>

        </div>

        {/* Right Image */}

        <div className="flex justify-center">

          <img
            src="https://ik.imagekit.io/stringstackSG/Hero%20banner.png"
            alt="GameStop Hero Banner"
            className="rounded-2xl shadow-2xl w-full max-w-2xl"
          />

        </div>

      </div>
    </section>
  );
}

export default Hero;