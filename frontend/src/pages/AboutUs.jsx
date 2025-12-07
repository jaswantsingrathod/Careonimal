import Footer from "../components/Footer";

export default function AboutUs() {
  return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-3 text-neutral-900">About <span className="text-orange-600">Careonimal</span></h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            We connect pets with loving, trusted care — anytime, anywhere. From daily walks to
            overnight stays, Careonimal ensures every pet receives the attention, warmth, and safety
            they deserve.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-100">
            <h2 className="text-2xl font-semibold mb-3 text-neutral-900">Our Mission</h2>
            <p className="text-neutral-700 leading-relaxed">
              Our mission is simple: to make pet care accessible, trustworthy, and stress-free.
              Whether you’re a busy pet parent or a passionate pet-care provider, we’re here to
              bridge the gap with a seamless, secure platform.
            </p>
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-100">
            <h2 className="text-2xl font-semibold mb-3 text-neutral-900">Why We Exist</h2>
            <p className="text-neutral-700 leading-relaxed">
              Finding reliable pet care shouldn’t be difficult. We created Careonimal to bring trust,
              transparency, and convenience into every pet parent’s life — giving them peace of mind
              no matter where they are.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl mt-10 shadow-sm border border-orange-100">
          <h2 className="text-2xl font-semibold mb-3 text-orange-600">What We Offer</h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-700">
            <li>Verified and trusted pet-care providers</li>
            <li>Easy booking for vet, grooming & boarding</li>
            <li>Location-based provider search with live geocoding</li>
            <li>Secure payments and full transparency</li>
            <li>24/7 availability — care when you need it</li>
          </ul>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-3 text-neutral-900">Our Promise</h2>
          <p className="max-w-2xl mx-auto text-neutral-700 leading-relaxed">
            At Careonimal, pets aren’t just animals — they’re family. We promise to always put their
            safety and happiness first by building a community of caring, verified, and passionate
            providers.
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-orange-50 px-4 py-2 border border-orange-100">
            <span className="text-orange-600 font-semibold">#𝑳𝒐𝒗𝒊𝒏𝒈𝑪𝒂𝒓𝒆𝑨𝒏𝒚𝒘𝒉𝒆𝒓𝒆</span>
          </div>
        </div>

      
        {/* CUSTOMER REVIEWS */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-center mb-6 text-neutral-900">What Our Customers Say</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-orange-50 border border-orange-100 shadow-sm">
              <p className="text-neutral-700 text-sm leading-relaxed">
                “CareOnimal made it super easy to find a trusted boarder for my dog Bruno. He came
                back happy and energetic! Highly recommended.”
              </p>
              <p className="mt-3 font-semibold text-orange-600 text-sm">— Aditi Sharma</p>
            </div>

            <div className="p-5 rounded-2xl bg-orange-50 border border-orange-100 shadow-sm">
              <p className="text-neutral-700 text-sm leading-relaxed">
                “The groomer arrived on time and treated my cat with so much love. Booking was quick
                and hassle-free!”
              </p>
              <p className="mt-3 font-semibold text-orange-600 text-sm">— Rohan Patil</p>
            </div>

            <div className="p-5 rounded-2xl bg-orange-50 border border-orange-100 shadow-sm">
              <p className="text-neutral-700 text-sm leading-relaxed">
                “Finally a service I can trust! I use CareOnimal for walking and daycare. The live
                location feature is super helpful.”
              </p>
              <p className="mt-3 font-semibold text-orange-600 text-sm">— Sneha Kulkarni</p>
            </div>
          </div>
        </section>
      <Footer />
      </div>
  );
}
