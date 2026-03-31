import { useToast } from "@/components/ui/use-toast";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

const initialState = {
  email: "",
  password: "",
};

const EMAIL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9.]*[a-zA-Z0-9])?@gmail\.com$/;
const USERNAME_REGEX = /^[a-zA-ZÀ-ỹ\s_]+$/;

function validateLoginField(name, value) {
  const errors = [];
  if (name === "email") {
    const v = value.trim();
    if (!v) {
      errors.push("Vui lòng nhập email hoặc tên người dùng");
    } else if (v.includes("@")) {
      if (!EMAIL_REGEX.test(v)) {
        errors.push("Email phải là địa chỉ @gmail.com hợp lệ (ví dụ: example@gmail.com)");
      }
    } else {
      if (!USERNAME_REGEX.test(v)) {
        errors.push("Tên người dùng chỉ được chứa chữ cái, không được có ký tự đặc biệt hoặc số");
      }
      if (v.length < 3) {
        errors.push("Tên người dùng phải có ít nhất 3 ký tự");
      }
    }
  }
  if (name === "password") {
    if (!value) {
      errors.push("Vui lòng nhập mật khẩu");
    }
  }
  return errors;
}

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState({ email: [], password: [] });
  const [touched, setTouched] = useState({ email: false, password: false });
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleChange(field, value) {
    setFormData({ ...formData, [field]: value });
    if (touched[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: validateLoginField(field, value) }));
    }
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors((prev) => ({ ...prev, [field]: validateLoginField(field, formData[field]) }));
  }

  function onSubmit(event) {
    event.preventDefault();

    // Validate all fields
    const emailErrors = validateLoginField("email", formData.email);
    const passwordErrors = validateLoginField("password", formData.password);
    setFieldErrors({ email: emailErrors, password: passwordErrors });
    setTouched({ email: true, password: true });

    if (emailErrors.length > 0 || passwordErrors.length > 0) {
      toast({
        title: "Vui lòng kiểm tra lại thông tin đăng nhập",
        variant: "destructive",
      });
      return;
    }

    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({ title: data?.payload?.message });
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
        CLIENT LOGIN
      </h1>
      <p
        className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-12"      >
        Access your curated experience
      </p>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-1">
          <label
            className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700"          >
            Email / Tên người dùng
          </label>
          <input
            type="text"
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            className={`w-full border-0 border-b bg-transparent py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 transition-colors duration-300 ${
              touched.email && fieldErrors.email.length > 0
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-gray-900"
            }`} />
          {touched.email && fieldErrors.email.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {fieldErrors.email.map((err, i) => (
                <p key={i} className="text-[11px] text-red-500 flex items-center gap-1">
                  <span>⚠</span> {err}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700"            >
              Mật khẩu
            </label>
            <button
              type="button"
              className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-700 hover:text-gray-900 transition-colors"            >
              Quên mật khẩu
            </button>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            className={`w-full border-0 border-b bg-transparent py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 transition-colors duration-300 ${
              touched.password && fieldErrors.password.length > 0
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-gray-900"
            }`} />
          {touched.password && fieldErrors.password.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {fieldErrors.password.map((err, i) => (
                <p key={i} className="text-[11px] text-red-500 flex items-center gap-1">
                  <span>⚠</span> {err}
                </p>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-4 text-xs font-semibold uppercase tracking-[0.3em] hover:bg-gray-800 active:bg-black transition-all duration-300 mt-4"        >
          Login
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

      <button
        type="button"
        onClick={() => {
          window.location.href = "http://localhost:5000/api/auth/google";
        }}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-all duration-300 rounded-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-[12px] uppercase tracking-[0.15em] font-semibold">
          Đăng nhập bằng Google
        </span>
      </button>

      <p
        className="text-center text-[11px] uppercase tracking-[0.15em] text-gray-500 mt-8"      >
        Don't have an account?{" "}
        <Link
          to="/auth/register"
          className="text-gray-900 font-semibold underline underline-offset-4 hover:text-gray-700 transition-colors"
        >
          Create an Account
        </Link>
      </p>
    </div>
  );
}

export default AuthLogin;
