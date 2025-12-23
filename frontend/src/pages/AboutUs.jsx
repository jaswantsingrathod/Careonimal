import Footer from "../components/Footer";
import { Heart, ShieldCheck, Star, Users, CheckCircle2 } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen font-sans text-slate-900 selection:bg-orange-200">
      <div className="relative pt-8 pb-24 px-6 overflow-hidde">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-6">
            <Heart className="h-3 w-3 fill-current" />
            Passion for Pets
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 text-slate-900 leading-tight">
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              Careonimal
            </span>
          </h1>

          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            We connect pets with loving, trusted care — anytime, anywhere.
            Ensuring every pet receives the attention, warmth, and safety they
            deserve.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border border-slate-100">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">
              Our Mission
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Our mission is simple: to make pet care accessible, trustworthy,
              and stress-free. Whether you’re a busy pet parent or a passionate
              pet-care provider, we bridge the gap with a seamless, secure
              platform.
            </p>
          </div>

          {/* Why We Exist Card */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border border-slate-100">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
              <Users className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">
              Why We Exist
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Finding reliable pet care shouldn’t be hard. We created Careonimal
              to bring trust, transparency, and convenience into every pet
              parent’s life — giving them peace of mind no matter where they
              are.
            </p>
          </div>
        </div>
      </div>

      {/* WHAT WE OFFER (Feature List) */}
      <div className="py-20 ">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-block px-4 py-1.5 bg-green-50 text-green-700 font-bold text-xs uppercase rounded-full mb-4">
              Values
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-slate-900">
              What We Bring to the Table
            </h2>
            <p className="text-slate-500 text-lg mb-8">
              More than just a platform, we are a promise of quality.
            </p>

            <ul className="space-y-4">
              {[
                "Verified and trusted pet-care providers",
                "Easy booking for vet, grooming & boarding",
                "Location-based provider search",
                "Secure payments and full transparency",
                "24/7 availability — care when you need it",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-slate-700 font-medium"
                >
                  <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual Element */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-red-200 rounded-[2rem] rotate-3 blur-sm"></div>
            <div className="bg-slate-900 p-8 rounded-[2rem] relative text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Our Promise</h3>
              <p className="text-slate-300 leading-relaxed">
                "At Careonimal, pets aren’t just animals — they’re family. We
                promise to always put their safety and happiness first by
                building a community of caring, verified, and passionate
                providers."
              </p>
              <div className="mt-6 font-handwriting text-orange-400 text-xl font-bold">
                #LovingCareAnywhere
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER REVIEWS */}
      <div className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-16 text-slate-900">
            Loved by Pet Parents
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "Finding a trusted boarding place near me was always a worry. Careonimal showed me verified hosts just 2km away. My dog managed to stay happy!",
                author: "Aditi Sharma",
                color: "bg-orange-50 border-orange-100",
              },
              {
                text: "I needed a groomer for my cat urgently. The app instantly showed available professionals nearby with ratings. Booked in seconds!",
                author: "Rohan Patil",
                color: "bg-blue-50 border-blue-100",
              },
              {
                text: "Our dog got sick late at night. Thanks to Careonimal, we found a 24/7 vet clinic right in our neighborhood. The location feature is a lifesaver.",
                author: "Sneha Shetty",
                color: "bg-green-50 border-green-100",
              },
            ].map((review, i) => (
              <div
                key={i}
                className={`p-8 rounded-[2rem] border ${review.color} hover:-translate-y-2 transition-transform duration-300 shadow-sm`}
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="h-4 w-4 text-orange-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 font-medium">
                  "{review.text}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-slate-900 border border-slate-100">
                    {review.author[0]}
                  </div>
                  <p className="font-bold text-sm text-slate-900">
                    {review.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
