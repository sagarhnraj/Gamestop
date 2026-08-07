import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-zinc-900 mt-20">

      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid md:grid-cols-4 gap-10">

          <div>

            <h2 className="text-3xl font-bold text-red-500 mb-4">
              GameStop
            </h2>

            <p className="text-gray-400">
              Your one-stop destination for Games, Consoles,
              Accessories and Gaming Setup.
            </p>

          </div>

          <div>

            <h3 className="font-bold mb-4">
              Shop
            </h3>

            <ul className="space-y-3 text-gray-400">

              <li>Games</li>

              <li>Consoles</li>

              <li>Accessories</li>

              <li>Gaming Setup</li>

            </ul>

          </div>

          <div>

            <h3 className="font-bold mb-4">
              Company
            </h3>

            <ul className="space-y-3 text-gray-400">

              <li>About</li>

              <li>Contact</li>

              <li>Support</li>

              <li>Privacy Policy</li>

            </ul>

          </div>

          <div>

            <h3 className="font-bold mb-4">
              Follow Us
            </h3>

            <div className="flex gap-4 text-2xl">

              <FaFacebook />

              <FaInstagram />

              <FaTwitter />

              <FaYoutube />

            </div>

          </div>

        </div>

        <hr className="border-zinc-700 my-10" />

        <p className="text-center text-gray-500">
          © 2026 GameStop. All Rights Reserved.
        </p>

      </div>

    </footer>
  );
}

export default Footer;