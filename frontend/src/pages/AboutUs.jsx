import Footer from "../components/Footer";
import { Stethoscope, Scissors, Home } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="max-w-5xl mx-auto pt-10 pb-20 px-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-3 text-neutral-900">
          About <span className="text-orange-600">Careonimal</span>
        </h1>
        <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
          We connect pets with loving, trusted care — anytime, anywhere.
          Careonimal ensures every pet receives the attention, warmth, and
          safety they deserve.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-10">
        <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-100">
          <h2 className="text-2xl font-semibold mb-3 text-neutral-900">
            Our Mission
          </h2>
          <p className="text-neutral-700 leading-relaxed">
            Our mission is simple: to make pet care accessible, trustworthy, and
            stress-free. Whether you’re a busy pet parent or a passionate
            pet-care provider, we’re here to bridge the gap with a seamless,
            secure platform.
          </p>
        </div>

        <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-100">
          <h2 className="text-2xl font-semibold mb-3 text-neutral-900">
            Why We Exist
          </h2>
          <p className="text-neutral-700 leading-relaxed">
            Finding reliable pet care shouldn’t be difficult. We created
            Careonimal to bring trust, transparency, and convenience into every
            pet parent’s life — giving them peace of mind no matter where they
            are.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">
            Everything Your Pet Needs
          </h2>
          <p className="text-slate-500 mt-3 font-medium">
            Comprehensive care services locally available.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Vets */}
          <div className="bg-white group p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
              <Stethoscope size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Veterinary</h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              Routine checkups, vaccinations, and emergency care from top-rated
              local clinics.
            </p>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            </div>
          </div>

          {/* Grooming */}
          <div className="bg-white group p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
              <Scissors size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Grooming</h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              Spa days, haircuts, and nail trims. Professional groomers who
              engage with love.
            </p>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            </div>
          </div>

          {/* Boarding */}
          <div className="bg-white group p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
              <Home size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Boarding</h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              Safe, cozy homes for overnight stays. Verified sitters who treat
              your pet like family.
            </p>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl mt-10 shadow-sm border border-orange-100">
        <h2 className="text-2xl font-semibold mb-3 text-orange-600">
          What We Offer
        </h2>
        <ul className="list-disc list-inside space-y-2 text-neutral-700">
          <li>Verified and trusted pet-care providers</li>
          <li>Easy booking for vet, grooming & boarding</li>
          <li>Location-based provider search</li>
          <li>Secure payments and full transparency</li>
          <li>24/7 availability — care when you need it</li>
        </ul>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-3 text-neutral-900">
          Our Promise
        </h2>
        <p className="max-w-2xl mx-auto text-neutral-700 leading-relaxed">
          At Careonimal, pets aren’t just animals — they’re family. We promise
          to always put their safety and happiness first by building a community
          of caring, verified, and passionate providers.
        </p>
      </div>

      <div className="mt-10 flex items-center justify-center">
        <div className="inline-flex items-center gap-3 rounded-full bg-orange-50 px-4 py-2 border border-orange-100">
          <span className="text-orange-600 font-semibold">
            #𝑳𝒐𝒗𝒊𝒏𝒈𝑪𝒂𝒓𝒆𝑨𝒏𝒚𝒘𝒉𝒆𝒓𝒆
          </span>
        </div>
      </div>
      {/* CUSTOMER REVIEWS */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-center mb-6 text-neutral-900">
          What Our Customers Say
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-orange-50 border border-orange-100 shadow-sm">
            <p className="text-neutral-700 text-sm leading-relaxed">
              “CareOnimal made it super easy to find a trusted boarder for my
              dog Bruno. He came back happy and energetic! Highly recommended.”
            </p>
            <p className="mt-3 font-semibold text-orange-600 text-sm">
              — Aditi Sharma
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-orange-50 border border-orange-100 shadow-sm">
            <p className="text-neutral-700 text-sm leading-relaxed">
              “The groomer arrived on time and treated my cat with so much love.
              Booking was quick and hassle-free!”
            </p>
            <p className="mt-3 font-semibold text-orange-600 text-sm">
              — Rohan Patil
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-orange-50 border border-orange-100 shadow-sm">
            <p className="text-neutral-700 text-sm leading-relaxed">
              “Finally a service I can trust! I use CareOnimal for walking and
              daycare. The live location feature is super helpful.”
            </p>
            <p className="mt-3 font-semibold text-orange-600 text-sm">
              — Sneha Kulkarni
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
