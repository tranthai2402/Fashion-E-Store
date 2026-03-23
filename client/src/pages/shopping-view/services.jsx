import { Link } from "react-router-dom";

const serviceItems = [
  {
    title: "Frequently Asked Questions",
    description:
      "You can also use this area to consult the FAQ's, follow your order and track your return. For beauty related inquiries, please contact our beauty customer service. To consult our job offers, please visit the career page.",
    action: "FAQ",
    link: "#",
  },
  {
    title: "Call Us",
    description:
      "Speak to one of our ambassadors at:\n+84 123 456 789\nMon-Sat 9AM-7PM",
    action: "Call Us",
    link: "tel:+84123456789",
  },
  {
    title: "Email",
    description:
      "We strive to reply to you within 48h during business days.",
    action: "Email Us",
    link: "mailto:support@ecommerce.com",
  },
  {
    title: "Aftersale Services",
    description:
      "Contact us for any questions pertaining to our repair and alteration services.",
    action: "Contact Us",
    link: "#",
  },
  {
    title: "In-Store Appointment",
    description:
      "Book a private appointment with our in-store client advisors to discover the new collection.",
    action: "Make an Appointment",
    link: "#",
  },
  {
    title: "Pick-Up in Store",
    description:
      "Pick up your order in one of our stores at your convenience.",
    action: "More Details",
    link: "#",
  },
  {
    title: "In-Store Item Reservation",
    description:
      "Visit the product detail page to reserve the products you would like to try on in one of our stores.",
    action: "More Details",
    link: "#",
  },
];

function ShoppingServices() {
  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Header */}
      <div className="py-12 text-center border-b border-gray-200">
        <h1 className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-900">
          Client Service
        </h1>
      </div>

      {/* Service Grid */}
      <div className="max-w-5xl mx-auto w-full px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
          {serviceItems.slice(0, 6).map((item) => (
            <div key={item.title} className="flex flex-col">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900 mb-4">
                {item.title}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.1em] leading-[2] text-gray-600 whitespace-pre-line mb-6 flex-1">
                {item.description}
              </p>
              <Link
                to={item.link}
                className="block w-full py-3 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-900 border border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300"
              >
                {item.action}
              </Link>
            </div>
          ))}
        </div>

        {/* Last item — full width single column */}
        {serviceItems.length > 6 && (
          <div className="mt-16 max-w-md">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900 mb-4">
              {serviceItems[6].title}
            </h3>
            <p className="text-[10px] uppercase tracking-[0.1em] leading-[2] text-gray-600 whitespace-pre-line mb-6">
              {serviceItems[6].description}
            </p>
            <Link
              to={serviceItems[6].link}
              className="block w-full py-3 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-900 border border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300"
            >
              {serviceItems[6].action}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShoppingServices;
