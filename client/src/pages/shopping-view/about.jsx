import leatherImg from "@/assets/leather.png";
import shoesImg from "@/assets/shoes.png";

const timelineData = [
  {
    year: "2020",
    text: "The brand was founded upon a distinguished vision: to present garments of the highest caliber, seamlessly uniting contemporary style with an exquisite refinement evident in every meticulous detail of design.",
  },
  {
    year: "2021",
    text: "The first collection was launched, receiving enthusiastic acceptance from the fashion community. The first product created in the workshop was a classic leather coat.",
  },
  {
    year: "2023",
    text: "Expanded product categories with footwear, accessories, and clothing for both men and women. Marked a significant turning point in the brand's development journey.",
  },
  {
    year: "2025",
    text: "Launched the e-commerce platform, bringing luxurious shopping experiences and convenience to customers nationwide.",
  },
];

function ShoppingAbout() {
  return (
    <div className="flex flex-col bg-white">
      {/* Founder Section */}
      <section className="py-20 px-6 md:px-10">
        <div className="text-center mb-12">
          <h1
            className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-900 mb-2"
          >
            The Founder
          </h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
            Our Story
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative aspect-video bg-black overflow-hidden group cursor-pointer"
            style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-white/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
              </div>
            </div>
          </div>
          <div className="text-center mt-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 leading-relaxed">
              The brand story
              <br />
              (c) Ecommerce Brand
              <br />
              Fashion House Canada
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-6 md:px-10 bg-white">
        <div className="text-center mb-16">
          <h2
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900"
          >
            The History
          </h2>
        </div>

        <section className="py-10 px-6 md:px-10">
        <div className="max-w-2xl mx-auto">
          <img
            src={leatherImg}
            alt="Brand heritage"
            className="w-full h-auto grayscale"
          />
        </div>
      </section>

        <div className="max-w-3xl mx-auto space-y-16">
          {timelineData.map((item) => (
            <div key={item.year} className="text-center">
              <h3
                className="text-sm font-bold tracking-[0.15em] text-gray-900 mb-5"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {item.year}
              </h3>
              <p className="text-[11px] uppercase tracking-[0.08em] leading-[1.8] text-gray-700 max-w-2xl mx-auto font-medium">
                {item.text}
              </p>
            </div>
            
          ))}
        </div>
      </section>

      {/* Heritage Image */}
      <section className="py-10 px-6 md:px-10">
        <div className="max-w-2xl mx-auto">
          <img 
            src={shoesImg}
            alt="Brand heritage"
            className="w-full h-auto grayscale"
          />
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900">
            Our Values
          </h2>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: "Quality",
              desc: "Every product is rigorously tested to ensure the highest standards before reaching the customer's hands.",
            },
            {
              title: "Creativity",
              desc: "Continuously innovating in design, combining global trends with the brand's unique identity.",
            },
            {
              title: "Commitment",
              desc: "Customer satisfaction is the measure of success. Always transparent and honest in every transaction.",
            },
          ].map((value) => (
            <div key={value.title} className="text-center">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900 mb-4">
                {value.title}
              </h3>
              <p className="text-[11px] uppercase tracking-[0.2em] leading-[2] text-gray-500">
                {value.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 px-6 md:px-10 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <p
            className="text-[11px] font-light italic text-gray-700 leading-relaxed"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            "Thank you for your trust and journey with us on our development journey."
          </p>
          <div className="w-12 h-[1px] bg-gray-300 mx-auto mt-8" />
        </div>
      </section>
    </div>
  );
}

export default ShoppingAbout;
