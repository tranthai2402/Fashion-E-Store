import { useToast } from "@/components/ui/use-toast";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

const EMAIL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9.]*[a-zA-Z0-9])?@gmail\.com$/;
const USERNAME_REGEX = /^[a-zA-ZÀ-ỹ\s_]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function validateField(name, value) {
  const errors = [];
  const v = String(value || "").trim();

  if (name === "userName") {
    if (!v) {
      errors.push("Vui lòng nhập tên người dùng");
    } else {
      if (!USERNAME_REGEX.test(v)) {
        errors.push("Tên người dùng chỉ được chứa chữ cái, không được có ký tự đặc biệt hoặc số");
      }
      if (v.length < 3) errors.push("Tên người dùng phải có ít nhất 3 ký tự");
      if (v.length > 30) errors.push("Tên người dùng không được quá 30 ký tự");
    }
  }

  if (name === "email") {
    if (!v) {
      errors.push("Vui lòng nhập email đăng ký");
    } else if (!EMAIL_REGEX.test(v)) {
      errors.push("Email phải là địa chỉ @gmail.com hợp lệ");
    }
  }

  if (name === "password") {
    if (!v) {
      errors.push("Vui lòng nhập mật khẩu");
    } else {
      if (v.length < 8) errors.push("Mật khẩu phải có ít nhất 8 ký tự");
      if (!/[a-z]/.test(v)) errors.push("Cần ít nhất 1 chữ thường");
      if (!/[A-Z]/.test(v)) errors.push("Cần ít nhất 1 chữ hoa");
      if (!/\d/.test(v)) errors.push("Cần ít nhất 1 con số");
      if (!/[@$!%*?&]/.test(v)) errors.push("Cần ít nhất 1 ký tự đặc biệt (@$!%*?&)");
    }
  }
  return errors;
}

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState({ userName: [], email: [], password: [] });
  const [touched, setTouched] = useState({ userName: false, email: false, password: false });
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

    const userNameErrors = validateField("userName", formData.userName);
    const emailErrors = validateField("email", formData.email);
    const passwordErrors = validateField("password", formData.password);

    setFieldErrors({ userName: userNameErrors, email: emailErrors, password: passwordErrors });
    setTouched({ userName: true, email: true, password: true });

    if (userNameErrors.length > 0 || emailErrors.length > 0 || passwordErrors.length > 0) {
      toast({
        title: "Vui lòng kiểm tra lại thông tin",
        variant: "destructive",
      });
      return;
    }

    dispatch(registerUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({ title: data?.payload?.message });
        // Redirect to verify page to show "Check your email" message
        navigate("/auth/verify", { state: { email: formData.email } });
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
      <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-10">
        Join our exclusive community
      </p>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700">
            Username
          </label>
          <input
            type="text"
            placeholder="JohnDoe"
            value={formData.userName}
            onChange={(e) => handleChange("userName", e.target.value)}
            onBlur={() => handleBlur("userName")}
            className={`w-full border-0 border-b bg-transparent py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 transition-colors duration-300 ${
              touched.userName && fieldErrors.userName.length > 0
                ? "border-red-500"
                : "border-gray-200 focus:border-gray-900"
            }`}
          />
          {touched.userName && fieldErrors.userName.length > 0 && (
            <p className="text-[10px] text-red-500 mt-1 uppercase tracking-wider">{fieldErrors.userName[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            className={`w-full border-0 border-b bg-transparent py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 transition-colors duration-300 ${
              touched.email && fieldErrors.email.length > 0
                ? "border-red-500"
                : "border-gray-200 focus:border-gray-900"
            }`}
          />
          {touched.email && fieldErrors.email.length > 0 && (
            <p className="text-[10px] text-red-500 mt-1 uppercase tracking-wider">{fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            className={`w-full border-0 border-b bg-transparent py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 transition-colors duration-300 ${
              touched.password && fieldErrors.password.length > 0
                ? "border-red-500"
                : "border-gray-200 focus:border-gray-900"
            }`}
          />
          {touched.password && fieldErrors.password.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {fieldErrors.password.map((err, i) => (
                <p key={i} className="text-[9px] text-red-500 uppercase tracking-tight flex items-center gap-1">
                  <span>•</span> {err}
                </p>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-4 text-xs font-semibold uppercase tracking-[0.3em] hover:bg-gray-800 active:bg-black transition-all duration-300 mt-2"
        >
          Create Account
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-[10px] uppercase tracking-[0.2em] text-gray-400">Or</span>
        </div>
      </div>

      <p className="text-center text-[11px] uppercase tracking-[0.15em] text-gray-500">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="text-gray-900 font-semibold underline underline-offset-4 hover:text-gray-700 transition-colors ml-1"
        >
          Login
        </Link>
      </p>
    </div>
  );
}

export default AuthRegister;
