import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useDispatch, useSelector } from "react-redux";
import { changeUserPassword, updateUserProfile } from "@/store/auth-slice";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";

// ─── Regex & Constants ────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9}$/;
const FULLNAME_REGEX = /^[a-zA-ZÀ-ỹÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴáàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ\s]+$/;
const USERNAME_REGEX = /^[a-zA-ZÀ-ỹ\s_]+$/;

const initialUserFormData = {
  fullName: "",
  userName: "",
  email: "",
  phone: "",
};

const initialPasswordData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizePhone(value) {
  return String(value || "").trim().replace(/[\s-]/g, "");
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ErrorMsg({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
      <p className="text-[11px] leading-tight text-red-500">{message}</p>
    </div>
  );
}

function SuccessIndicator({ show }) {
  if (!show) return null;
  return (
    <CheckCircle2 className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-in fade-in duration-300 pointer-events-none" />
  );
}

function FieldLabel({ label, required }) {
  return (
    <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-1 block">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function StyledInput({ value, onChange, onBlur, placeholder, type = "text", maxLength, hasError, hasSuccess, disabled }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        autoComplete="new-password" // prevent browser autofill overlapping
        className={`w-full border-0 border-b bg-transparent py-2.5 pr-7 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${hasError
            ? "border-red-400 focus:border-red-500"
            : hasSuccess
              ? "border-emerald-400 focus:border-emerald-500"
              : "border-gray-300 focus:border-gray-900"
          }`}
      />
      <SuccessIndicator show={hasSuccess && !hasError} />
    </div>
  );
}

function ShoppingUserProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // ── Profile State ──
  const [formData, setFormData] = useState(initialUserFormData);
  const [profileTouched, setProfileTouched] = useState({});
  const [profileErrors, setProfileErrors] = useState({});
  const [profileFeedback, setProfileFeedback] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // ── Password State ──
  const [passwordData, setPasswordData] = useState(initialPasswordData);
  const [passwordTouched, setPasswordTouched] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // ── 1. Init Data ──
  useEffect(() => {
    setFormData({
      fullName: user?.fullName || "",
      userName: user?.userName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setProfileErrors({});
    setProfileTouched({});
    setProfileFeedback(null);
  }, [user]);

  // ── 2. Profile Validation ──
  const validateProfileField = useCallback((name, value, currentForm) => {
    switch (name) {
      case "fullName": {
        const v = String(value || "").trim();
        if (v && !FULLNAME_REGEX.test(v)) return "Họ tên chỉ được chứa chữ cái, không nhập số hoặc ký tự đặc biệt";
        return null;
      }
      case "userName": {
        const v = String(value || "").trim();
        const hasEmail = String(currentForm?.email || "").trim() !== "";
        if (!v && !hasEmail) return "Cần nhập Tên người dùng hoặc Email";
        if (v && !USERNAME_REGEX.test(v)) return "Chỉ chứa chữ cái (có dấu), khoảng trắng và gạch dưới";
        if (v && v.length < 3) return "Tên người dùng phải có ít nhất 3 ký tự";
        return null;
      }
      case "email": {
        const v = String(value || "").trim();
        const hasUserName = String(currentForm?.userName || "").trim() !== "";
        if (!v && !hasUserName) return "Cần nhập Tên người dùng hoặc Email";
        if (v && !EMAIL_REGEX.test(v)) return "Email phải đúng định dạng @gmail.com";
        return null;
      }
      case "phone": {
        const v = normalizePhone(value);
        if (v && !/^\d+$/.test(v)) return "Số điện thoại chỉ được nhập chữ số";
        if (v && v.length !== 10) return "Số điện thoại phải gồm đúng 10 chữ số";
        if (v && !PHONE_REGEX.test(v)) return "Số điện thoại phải bắt đầu bằng số 0";
        return null;
      }
      default:
        return null;
    }
  }, []);

  const validateAllProfile = useCallback((currentForm) => {
    const fields = ["fullName", "userName", "email", "phone"];
    const nextErrors = {};
    fields.forEach((f) => {
      const err = validateProfileField(f, currentForm[f], currentForm);
      if (err) nextErrors[f] = err;
    });
    return nextErrors;
  }, [validateProfileField]);

  const hasProfileChanges = useMemo(() => {
    if (!user) return false;
    const normalizedPhone = normalizePhone(formData.phone);
    const normalizedUserPhone = normalizePhone(user?.phone || "");
    return (
      String(user.fullName || "") !== String(formData.fullName || "").trim() ||
      String(user.userName || "") !== String(formData.userName || "").trim() ||
      String(user.email || "") !== String(formData.email || "").trim() ||
      normalizedUserPhone !== normalizedPhone
    );
  }, [user, formData]);

  // Touch profile field
  function touchProfileField(field, value = formData[field]) {
    setProfileTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateProfileField(field, value, formData);
    // Special cross-validation logic for username/email requirement
    setProfileErrors((prev) => {
      const newErr = { ...prev, [field]: err };
      if (field === 'email' || field === 'userName') {
        newErr.email = validateProfileField('email', formData.email, { ...formData, [field]: value });
        newErr.userName = validateProfileField('userName', formData.userName, { ...formData, [field]: value });
      }
      return newErr;
    });
  }

  // Helper check profile error
  function showProfileError(field) {
    return profileTouched[field] ? profileErrors[field] : undefined;
  }
  function showProfileSuccess(field) {
    return profileTouched[field] && !profileErrors[field] && String(formData[field]).trim() !== "";
  }

  function handleProfileSubmit(event) {
    event.preventDefault();
    const allTouched = { fullName: true, userName: true, email: true, phone: true };
    setProfileTouched(allTouched);

    const checkErrors = validateAllProfile(formData);
    setProfileErrors(checkErrors);
    setProfileFeedback(null);

    // Filter out undefined/null errors
    const hasAnyError = Object.values(checkErrors).some(err => err);
    if (hasAnyError) return;
    if (!hasProfileChanges) {
      setProfileFeedback({ type: "success", text: "No changes detected." });
      return;
    }

    const payload = {
      fullName: String(formData.fullName || "").trim(),
      userName: String(formData.userName || "").trim(),
      email: String(formData.email || "").trim(),
      phone: normalizePhone(formData.phone),
    };

    setIsSavingProfile(true);
    dispatch(updateUserProfile(payload)).then((data) => {
      setIsSavingProfile(false);
      if (data?.payload?.success) {
        setProfileErrors({});
        setProfileTouched({});
        setProfileFeedback({
          type: "success",
          text: data?.payload?.message || "Cập nhật thông tin thành công",
        });
      } else {
        setProfileFeedback({
          type: "error",
          text: data?.payload?.message || "Lỗi cập nhật",
        });
      }
    });
  }

  // ── 3. Password Validation ──
  const validatePasswordField = useCallback((name, value, currentData) => {
    switch (name) {
      case "currentPassword":
        if (!value) return "Vui lòng nhập mật khẩu hiện tại";
        return null;
      case "newPassword":
        if (!value) return "Vui lòng nhập mật khẩu mới";
        if (value.length < 6) return "Mật khẩu mới phải có ít nhất 6 ký tự";
        return null;
      case "confirmPassword":
        if (!value) return "Vui lòng xác nhận mật khẩu mới";
        if (value !== currentData.newPassword) return "Mật khẩu xác nhận không khớp";
        return null;
      default:
        return null;
    }
  }, []);

  const validateAllPassword = useCallback((currentData) => {
    const fields = ["currentPassword", "newPassword", "confirmPassword"];
    const nextErrors = {};
    fields.forEach((f) => {
      const err = validatePasswordField(f, currentData[f], currentData);
      if (err) nextErrors[f] = err;
    });
    return nextErrors;
  }, [validatePasswordField]);

  function touchPasswordField(field, value = passwordData[field]) {
    setPasswordTouched((prev) => ({ ...prev, [field]: true }));
    const err = validatePasswordField(field, value, passwordData);
    setPasswordErrors((prev) => {
      const newErr = { ...prev, [field]: err };
      if (field === 'newPassword') {
         newErr.confirmPassword = validatePasswordField('confirmPassword', passwordData.confirmPassword, { ...passwordData, newPassword: value });
      }
      return newErr;
    });
  }

  function showPasswordError(field) {
    return passwordTouched[field] ? passwordErrors[field] : undefined;
  }
  function showPasswordSuccess(field) {
    return passwordTouched[field] && !passwordErrors[field] && String(passwordData[field]).trim() !== "";
  }

  function handlePasswordSubmit(event) {
    event.preventDefault();
    const allTouched = { currentPassword: true, newPassword: true, confirmPassword: true };
    setPasswordTouched(allTouched);

    const checkErrors = validateAllPassword(passwordData);
    setPasswordErrors(checkErrors);
    setPasswordFeedback(null);

    const hasAnyError = Object.values(checkErrors).some(err => err);
    if (hasAnyError) return;

    setIsUpdatingPassword(true);
    dispatch(
      changeUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
    ).then((data) => {
      setIsUpdatingPassword(false);
      if (data?.payload?.success) {
        setPasswordData(initialPasswordData);
        setPasswordErrors({});
        setPasswordTouched({});
        setPasswordFeedback({
          type: "success",
          text: data?.payload?.message || "Cập nhật mật khẩu thành công",
        });
      } else {
        setPasswordFeedback({
          type: "error",
          text: data?.payload?.message || "Lỗi cập nhật mật khẩu",
        });
        // Highlight backend error
        if (data?.payload?.message?.toLowerCase().includes("hiện tại")) {
            setPasswordErrors(prev => ({...prev, currentPassword: data.payload.message}))
        }
      }
    });
  }

  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.26em] text-gray-900">
          Cài Đặt Tài Khoản
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 px-5 pb-6 sm:px-6">

        {/* ── Thông Tin Khách Hàng ── */}
        <div className="space-y-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-700 pb-2 border-b border-gray-100">
            Thông Tin Khách Hàng
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5" noValidate>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Họ và tên */}
              <div>
                <FieldLabel label="Họ tên" />
                <StyledInput
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }));
                    if (profileTouched.fullName) touchProfileField("fullName", e.target.value);
                  }}
                  onBlur={() => touchProfileField("fullName")}
                  placeholder="Nguyễn Văn A"
                  hasError={!!showProfileError("fullName")}
                  hasSuccess={showProfileSuccess("fullName")}
                />
                <ErrorMsg message={showProfileError("fullName")} />
              </div>

              {/* Số điện thoại */}
              <div>
                <FieldLabel label="Số điện thoại" />
                <StyledInput
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData((prev) => ({ ...prev, phone: digits }));
                    if (profileTouched.phone) touchProfileField("phone", digits);
                  }}
                  onBlur={() => touchProfileField("phone")}
                  placeholder="0xxxxxxxxx"
                  maxLength={10}
                  hasError={!!showProfileError("phone")}
                  hasSuccess={showProfileSuccess("phone")}
                />
                <div className="flex items-start justify-between">
                  <ErrorMsg message={showProfileError("phone")} />
                  <span className={`ml-auto text-[10px] tabular-nums mt-1 ${formData.phone.length === 10 ? "text-emerald-500" : "text-gray-400"}`}>
                    {formData.phone.length}/10
                  </span>
                </div>
              </div>

              {/* Username */}
              <div>
                <FieldLabel label="Tên người dùng (Tùy chọn nếu có email)" />
                <StyledInput
                  value={formData.userName}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, userName: e.target.value }));
                    if (profileTouched.userName || profileTouched.email) touchProfileField("userName", e.target.value);
                  }}
                  onBlur={() => touchProfileField("userName")}
                  placeholder="nguyenvana_123"
                  hasError={!!showProfileError("userName")}
                  hasSuccess={showProfileSuccess("userName")}
                />
                <ErrorMsg message={showProfileError("userName")} />
              </div>

              {/* Email */}
              <div>
                <FieldLabel label="Email (@gmail.com)" />
                <StyledInput
                  type="email"
                  value={formData.email}
                  disabled={user?.role === 'admin'} // Example, disable if you want
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }));
                    if (profileTouched.email || profileTouched.userName) touchProfileField("email", e.target.value);
                  }}
                  onBlur={() => touchProfileField("email")}
                  placeholder="example@gmail.com"
                  hasError={!!showProfileError("email")}
                  hasSuccess={showProfileSuccess("email")}
                />
                <ErrorMsg message={showProfileError("email")} />
              </div>

            </div>

            {profileFeedback && (
              <div className={`p-3 text-[11px] font-medium border ${profileFeedback.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                {profileFeedback.text}
              </div>
            )}

            <button
              type="submit"
              disabled={!hasProfileChanges || isSavingProfile}
              className="mt-2 w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white text-[10px] font-semibold uppercase tracking-[0.22em] transition-all hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingProfile ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
                </span>
              ) : (
                "Lưu Thông Tin"
              )}
            </button>
          </form>
        </div>

        <Separator className="bg-gray-200" />

        {/* ── Đổi Mật Khẩu ── */}
        <div className="space-y-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-700 pb-2 border-b border-gray-100">
            Đổi Mật Khẩu
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm" noValidate>
            
            <div>
              <FieldLabel label="Mật khẩu hiện tại" />
              <StyledInput
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => {
                  setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }));
                  if (passwordTouched.currentPassword) touchPasswordField("currentPassword", e.target.value);
                }}
                onBlur={() => touchPasswordField("currentPassword")}
                placeholder="Nhập mật khẩu hiện tại"
                hasError={!!showPasswordError("currentPassword")}
                hasSuccess={showPasswordSuccess("currentPassword")}
              />
              <ErrorMsg message={showPasswordError("currentPassword")} />
            </div>

            <div>
              <FieldLabel label="Mật khẩu mới" />
              <StyledInput
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }));
                  if (passwordTouched.newPassword) touchPasswordField("newPassword", e.target.value);
                }}
                onBlur={() => touchPasswordField("newPassword")}
                placeholder="Nhập mật khẩu mới"
                hasError={!!showPasswordError("newPassword")}
                hasSuccess={showPasswordSuccess("newPassword")}
              />
              <ErrorMsg message={showPasswordError("newPassword")} />
            </div>

            <div>
              <FieldLabel label="Xác nhận mật khẩu mới" />
              <StyledInput
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                  if (passwordTouched.confirmPassword) touchPasswordField("confirmPassword", e.target.value);
                }}
                onBlur={() => touchPasswordField("confirmPassword")}
                placeholder="Xác nhận mật khẩu mới"
                hasError={!!showPasswordError("confirmPassword")}
                hasSuccess={showPasswordSuccess("confirmPassword")}
              />
              <ErrorMsg message={showPasswordError("confirmPassword")} />
            </div>

            {passwordFeedback && (
              <div className={`p-3 text-[11px] font-medium border ${passwordFeedback.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                {passwordFeedback.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full mt-2 px-6 py-2.5 bg-gray-900 text-white text-[10px] font-semibold uppercase tracking-[0.22em] transition-all hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingPassword ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang cập nhật...
                </span>
              ) : (
                "Cập Nhật Mật Khẩu"
              )}
            </button>
          </form>
        </div>

      </CardContent>
    </Card>
  );
}

export default ShoppingUserProfile;
