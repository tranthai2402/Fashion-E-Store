import { useToast } from "@/components/ui/use-toast";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  email: "",
  password: "",
};

const EMAIL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9.]*[a-zA-Z0-9])?@gmail\.com$/;
const USERNAME_REGEX = /^[a-zA-ZÀ-ỹ\s_]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

function validateField(name, value) {
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
      if (v.length > 30) {
        errors.push("Tên người dùng không được quá 30 ký tự");
      }
    }
  }
  if (name === "password") {
    if (!value) {
      errors.push("Vui lòng nhập mật khẩu");
    } else {
      if (value.length < 6) errors.push("Mật khẩu phải có ít nhất 6 ký tự");
      if (!/[a-z]/.test(value)) errors.push("Mật khẩu phải có ít nhất 1 chữ thường");
      if (!/[A-Z]/.test(value)) errors.push("Mật khẩu phải có ít nhất 1 chữ hoa");
      if (!/\d/.test(value)) errors.push("Mật khẩu phải có ít nhất 1 chữ số");
    }
  }
  return errors;
}

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState({ email: [], password: [] });
  const [touched, setTouched] = useState({ email: false, password: false });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleChange(field, value) {
    setFormData({ ...formData, [field]: value });
    if (touched[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, formData[field]) }));
  }

  function onSubmit(event) {
    event.preventDefault();

    // Validate all fields
    const emailErrors = validateField("email", formData.email);
    const passwordErrors = validateField("password", formData.password);
    setFieldErrors({ email: emailErrors, password: passwordErrors });
    setTouched({ email: true, password: true });

    if (emailErrors.length > 0 || passwordErrors.length > 0) {
      toast({
        title: "Vui lòng kiểm tra lại thông tin đăng ký",
        variant: "destructive",
      });
      return;
    }

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
          <label
            className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700"          >
            Mật khẩu
          </label>
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
          {/* Password strength hints */}
          {touched.password && formData.password && fieldErrors.password.length === 0 && (
            <p className="text-[11px] text-green-600 mt-1 flex items-center gap-1">
              <span>✓</span> Mật khẩu hợp lệ
            </p>
          )}
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
