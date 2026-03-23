import { useToast } from "@/components/ui/use-toast";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    dispatch(registerUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({ title: data?.payload?.message });
        navigate("/auth/login");
      } else {
        toast({ title: data?.payload?.message, variant: "destructive" });
      }
    });
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h1
        className="text-4xl font-bold tracking-tight text-gray-900 mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        CREATE ACCOUNT
      </h1>
      <p
        className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-12"      >
        Join our exclusive community
      </p>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-1">
          <label
            className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700"          >
            Email Address
          </label>
          <input
            type="text"
            placeholder="client@maison.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full border-0 border-b border-gray-300 bg-transparent py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-0 transition-colors duration-300"          />
        </div>

        <div className="space-y-1">
          <label
            className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700"          >
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full border-0 border-b border-gray-300 bg-transparent py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-0 transition-colors duration-300"          />
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-4 text-xs font-semibold uppercase tracking-[0.3em] hover:bg-gray-800 active:bg-black transition-all duration-300 mt-4"        >
          Sign Up
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span
            className="bg-white px-4 text-[11px] uppercase tracking-[0.2em] text-gray-400"          >
            Or
          </span>
        </div>
      </div>

      <p
        className="text-center text-[11px] uppercase tracking-[0.15em] text-gray-500"      >
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="text-gray-900 font-semibold underline underline-offset-4 hover:text-gray-700 transition-colors"
        >
          Login
        </Link>
      </p>
    </div>
  );
}

export default AuthRegister;
