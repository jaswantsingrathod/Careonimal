import { FaEnvelope, FaPhone, FaClock } from 'react-icons/fa';

import logoImg from "../assets/careonimal.loggo.png"
export default function Footer() {
  return (
    <footer className="w-full mt-7 border rounded-lg bg-orange-100 text-gray-300 py-8 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-12 pb-8">
         <div className="flex flex-col items-center">
            <img className="h-30 w-auto" src={logoImg} alt="Careonimal Logo" />

            <span className="text-lg font-semibold text-orange-600 mt-2 text-center">
              Careonimal
            </span>
          </div>

          <div className='text-gray-800'>
            <h2 className="text-xl font-extrabold text-black mb-4 border-b-2 border-orange-500 pb-2 inline-block">Connect with us</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-orange-500 min-w-4" />
                <a href="mailto:caronimal@gmail.com" className="hover:text-black transition duration-200">careonimal@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-orange-500 min-w-4" />
                <a href="tel:+916364151684" className="hover:text-black transition duration-200">+91 6364151684</a>
              </li>
              <li className="flex items-center gap-3">
                <FaClock className="text-orange-500 min-w-4" />
                <span className="text-gray-800">Monday to Sunday (24/7 Support)</span>
              </li>
            </ul>
          </div>

          <div className="text-gray-800">
            <h2 className="text-xl font-extrabold text-black mb-4 border-b-2 border-orange-500 pb-2 inline-block">Quick Links</h2>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/services" className="hover:text-orange-400 transition duration-200">Services</a>
              </li>
              <li>
                <a href="/about" className="hover:text-orange-400 transition duration-200">About Us</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-orange-400 transition duration-200">Contact</a>
              </li>
              {/* Adding a placeholder for legal/privacy links for completeness */}
              <li>
                <a href="/privacy" className="hover:text-orange-400 transition duration-200">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-orange-700 p-5  text-center text-xs text-gray-500">
          <p className="tracking-wide">
            &copy; {new Date().getFullYear()} Careonimal. All rights reserved.
          </p>
        </div>
      </div>

      <div className="w-full flex justify-center py-5">
        <p className="lg:text-4xl text-2xl font-semibold  text-orange-400">#𝑳𝒐𝒗𝒊𝒏𝒈𝑪𝒂𝒓𝒆𝑨𝒏𝒚𝒘𝒉𝒆𝒓𝒆</p>
      </div>

    </footer>
  );
}