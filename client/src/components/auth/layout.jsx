import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <div
        className="hidden lg:flex relative w-1/2 overflow-hidden items-end"
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)",
            }}
          />
        </div>
        <div className="relative z-10 p-12">
          <h2
            className="text-white text-5xl font-bold leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            ECOMMERCE
            <br />
            SHOPPING
          </h2>
          <p
            className="text-white/50 text-xs uppercase tracking-[0.3em] mt-4"          >
            Curated elegance, delivered to you
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-12 lg:px-20">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
