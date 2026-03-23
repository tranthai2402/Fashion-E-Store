import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

function ShoppingFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="px-6 md:px-10 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white">
              About Us
            </h3>
            <p className="text-[11px] leading-relaxed text-gray-400">
              Chào mừng bạn đến với cửa hàng của chúng tôi! Chúng tôi chuyên cung cấp các sản phẩm chất lượng cao với dịch vụ tận tâm nhất.
            </p>
            <Link
              to="/shop/about"
              className="text-[11px] uppercase tracking-[0.15em] text-gray-400 hover:text-white transition-colors"
            >
              Learn more &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white">
              Policies
            </h3>
            <ul className="flex flex-col gap-2">
              {["Chính sách bảo hành", "Chính sách đổi trả", "Chính sách vận chuyển", "Điều khoản dịch vụ"].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-[11px] text-gray-400 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Home", path: "/shop/home" },
                { label: "Shop", path: "/shop/listing" },
                { label: "Account", path: "/shop/account" },
                { label: "Search", path: "/shop/search" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-[11px] text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white">
              Connect
            </h3>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={18} strokeWidth={1.5} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a href="https://zalo.me" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <MessageCircle size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 px-6 md:px-10 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
          &copy; {new Date().getFullYear()} Ecommerce. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.15em] text-gray-500">
          <span>Legal</span>
          <span>Privacy</span>
        </div>
      </div>
    </footer>
  );
}

export default ShoppingFooter;
