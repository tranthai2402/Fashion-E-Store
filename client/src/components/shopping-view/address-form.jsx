import { useState, useEffect, useCallback } from "react";
import { Loader2, Home, Briefcase, Check, AlertCircle, CheckCircle2 } from "lucide-react";

// ─── Regex & Constants ────────────────────────────────────────────────────────
const PHONE_REGEX = /^0\d{9}$/;
// Họ tên: chỉ chữ cái (có dấu tiếng Việt), khoảng trắng. Không số, không ký tự đặc biệt.
const FULLNAME_REGEX = /^[a-zA-ZÀ-ỹÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴáàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ\s]+$/;

const PROVINCES_API = "https://provinces.open-api.vn/api/p/";
const DISTRICTS_API = (code) => `https://provinces.open-api.vn/api/p/${code}?depth=2`;
const WARDS_API = (code) => `https://provinces.open-api.vn/api/d/${code}?depth=2`;

const initialFormData = {
  fullName: "",
  phone: "",
  province: "",
  provinceCode: "",
  district: "",
  districtCode: "",
  ward: "",
  wardCode: "",
  addressDetail: "",
  addressType: "home",
  notes: "",
};

// ─── Per-field validation ─────────────────────────────────────────────────────
function validateField(name, value, formData = {}) {
  switch (name) {
    case "fullName": {
      const v = String(value || "").trim();
      if (!v) return "Vui lòng nhập họ tên người nhận";
      if (v.length < 2) return "Họ tên phải có ít nhất 2 ký tự";
      if (v.length > 80) return "Họ tên không được quá 80 ký tự";
      if (!FULLNAME_REGEX.test(v)) return "Họ tên chỉ được chứa chữ cái, không nhập số hoặc ký tự đặc biệt";
      return null;
    }
    case "phone": {
      const v = String(value || "").trim();
      if (!v) return "Vui lòng nhập số điện thoại";
      if (!/^\d+$/.test(v)) return "Số điện thoại chỉ được nhập chữ số";
      if (v.length !== 10) return "Số điện thoại phải gồm đúng 10 chữ số";
      if (!PHONE_REGEX.test(v)) return "Số điện thoại phải bắt đầu bằng số 0";
      return null;
    }
    case "province":
      return !value ? "Vui lòng chọn tỉnh / thành phố" : null;
    case "district":
      return !value ? "Vui lòng chọn huyện / quận" : null;
    case "ward":
      return !value ? "Vui lòng chọn phường / xã" : null;
    case "addressDetail": {
      const v = String(value || "").trim();
      if (!v) return "Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường...)";
      if (v.length < 5) return "Địa chỉ cụ thể quá ngắn, vui lòng nhập đầy đủ hơn";
      return null;
    }
    default:
      return null;
  }
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
    <CheckCircle2 className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-in fade-in duration-300" />
  );
}

function FieldLabel({ label, required }) {
  return (
    <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function StyledInput({ value, onChange, onBlur, placeholder, type = "text", maxLength, hasError, hasSuccess }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        className={`w-full border-0 border-b bg-transparent py-2.5 pr-7 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors duration-200 ${
          hasError
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

function StyledSelect({ value, onChange, onBlur, disabled, children, placeholder, hasError, hasSuccess }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`w-full appearance-none border-0 border-b bg-transparent py-2.5 pr-8 text-[13px] focus:outline-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
          !value ? "text-gray-400" : "text-gray-900"
        } ${
          hasError
            ? "border-red-400 focus:border-red-500"
            : hasSuccess
            ? "border-emerald-400 focus:border-emerald-500"
            : "border-gray-300 focus:border-gray-900"
        }`}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      {/* Chevron icon */}
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {/* Success icon behind chevron */}
      {hasSuccess && !hasError && (
        <CheckCircle2 className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-in fade-in duration-300" />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AddressForm({ initialData = null, onSubmit, onCancel, isEditing = false }) {
  const [formData, setFormData] = useState(
    initialData
      ? {
          fullName: initialData.fullName || "",
          phone: initialData.phone || "",
          province: initialData.province || "",
          provinceCode: initialData.provinceCode || "",
          district: initialData.district || "",
          districtCode: initialData.districtCode || "",
          ward: initialData.ward || "",
          wardCode: initialData.wardCode || "",
          addressDetail: initialData.addressDetail || initialData.address || "",
          addressType: initialData.addressType || "home",
          notes: initialData.notes || "",
        }
      : { ...initialFormData }
  );

  // touched[field] = true means user has interacted with the field
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Province / District / Ward fetch ──────────────────────────────────────
  useEffect(() => {
    fetch(PROVINCES_API)
      .then((r) => r.json())
      .then((data) => { setProvinces(data || []); setApiError(null); })
      .catch(() => setApiError("Không thể tải danh sách tỉnh/thành phố. Kiểm tra kết nối mạng."))
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (!formData.provinceCode) { setDistricts([]); setWards([]); return; }
    setLoadingDistricts(true); setDistricts([]); setWards([]);
    fetch(DISTRICTS_API(formData.provinceCode))
      .then((r) => r.json())
      .then((data) => setDistricts(data?.districts || []))
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistricts(false));
  }, [formData.provinceCode]);

  useEffect(() => {
    if (!formData.districtCode) { setWards([]); return; }
    setLoadingWards(true); setWards([]);
    fetch(WARDS_API(formData.districtCode))
      .then((r) => r.json())
      .then((data) => setWards(data?.wards || []))
      .catch(() => setWards([]))
      .finally(() => setLoadingWards(false));
  }, [formData.districtCode]);

  // ── Per-field touch & error helpers ──────────────────────────────────────
  // Validate all required fields and return error map
  const validateAll = useCallback(() => {
    const requiredFields = ["fullName", "phone", "province", "district", "ward", "addressDetail"];
    const nextErrors = {};
    requiredFields.forEach((f) => {
      const err = validateField(f, formData[f], formData);
      if (err) nextErrors[f] = err;
    });
    return nextErrors;
  }, [formData]);

  // Mark a field as touched and set its error
  function touchField(fieldName, value = formData[fieldName]) {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const err = validateField(fieldName, value, formData);
    setErrors((prev) => ({ ...prev, [fieldName]: err }));
  }

  // Helper: should we show this error?
  function showError(field) {
    return touched[field] ? errors[field] : undefined;
  }

  // Helper: should we show success state?
  function showSuccess(field) {
    return touched[field] && !errors[field] && formData[field];
  }

  // ── Field handlers ────────────────────────────────────────────────────────
  function handleTextChange(field, rawValue) {
    setFormData((prev) => ({ ...prev, [field]: rawValue }));
    // If already touched, re-validate immediately
    if (touched[field]) {
      const err = validateField(field, rawValue, { ...formData, [field]: rawValue });
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  }

  function handleProvinceChange(e) {
    const code = e.target.value;
    const selected = provinces.find((p) => String(p.code) === code);
    const newData = {
      ...formData,
      province: selected?.name || "",
      provinceCode: code,
      district: "", districtCode: "",
      ward: "", wardCode: "",
    };
    setFormData(newData);
    // Validate province + cascade-reset district & ward errors
    setTouched((prev) => ({ ...prev, province: true }));
    const err = validateField("province", code);
    setErrors((prev) => ({ ...prev, province: err, district: undefined, ward: undefined }));
  }

  function handleDistrictChange(e) {
    const code = e.target.value;
    const selected = districts.find((d) => String(d.code) === code);
    setFormData((prev) => ({
      ...prev,
      district: selected?.name || "",
      districtCode: code,
      ward: "", wardCode: "",
    }));
    setTouched((prev) => ({ ...prev, district: true }));
    const err = validateField("district", code);
    setErrors((prev) => ({ ...prev, district: err, ward: undefined }));
  }

  function handleWardChange(e) {
    const code = e.target.value;
    const selected = wards.find((w) => String(w.code) === code);
    setFormData((prev) => ({ ...prev, ward: selected?.name || "", wardCode: code }));
    setTouched((prev) => ({ ...prev, ward: true }));
    const err = validateField("ward", code);
    setErrors((prev) => ({ ...prev, ward: err }));
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    // Touch all required fields to show all errors
    const requiredFields = ["fullName", "phone", "province", "district", "ward", "addressDetail"];
    const allTouched = {};
    requiredFields.forEach((f) => { allTouched[f] = true; });
    setTouched((prev) => ({ ...prev, ...allTouched }));

    const nextErrors = validateAll();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  }

  const canSubmit = Object.keys(validateAll()).length === 0;

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* ── Recipient Info Row ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

        {/* Họ tên */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel label="Họ tên người nhận" required />
          <StyledInput
            value={formData.fullName}
            onChange={(e) => handleTextChange("fullName", e.target.value)}
            onBlur={() => touchField("fullName")}
            placeholder="Nguyễn Văn A"
            maxLength={80}
            hasError={!!showError("fullName")}
            hasSuccess={showSuccess("fullName")}
          />
          <ErrorMsg message={showError("fullName")} />
        </div>

        {/* SĐT */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel label="Số điện thoại" required />
          <StyledInput
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
              handleTextChange("phone", digits);
            }}
            onBlur={() => touchField("phone")}
            placeholder="0xxxxxxxxx"
            maxLength={10}
            hasError={!!showError("phone")}
            hasSuccess={showSuccess("phone")}
          />
          {/* Live character counter */}
          <div className="flex items-start justify-between">
            <ErrorMsg message={showError("phone")} />
            <span className={`ml-auto text-[10px] tabular-nums ${formData.phone.length === 10 ? "text-emerald-500" : "text-gray-400"}`}>
              {formData.phone.length}/10
            </span>
          </div>
        </div>
      </div>

      {/* ── Address Type ── */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel label="Loại địa chỉ" />
        <div className="flex gap-3 pt-0.5">
          {[
            { value: "home", label: "Nhà riêng", Icon: Home },
            { value: "office", label: "Văn phòng", Icon: Briefcase },
          ].map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, addressType: value }))}
              className={`flex items-center gap-2 border px-5 py-2.5 text-[11px] font-medium uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                formData.addressType === value
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-transparent text-gray-500 hover:border-gray-600 hover:text-gray-800"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {formData.addressType === value && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Province ── */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel label="Tỉnh / Thành phố" required />
        {loadingProvinces ? (
          <div className="flex items-center gap-2 py-2.5 text-[13px] text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Đang tải danh sách tỉnh...
          </div>
        ) : (
          <StyledSelect
            value={formData.provinceCode}
            onChange={handleProvinceChange}
            onBlur={() => touchField("province", formData.province)}
            placeholder="-- Chọn tỉnh / thành phố --"
            hasError={!!showError("province")}
            hasSuccess={showSuccess("province")}
          >
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </StyledSelect>
        )}
        <ErrorMsg message={showError("province") || (apiError && !loadingProvinces ? apiError : undefined)} />
      </div>

      {/* ── District ── */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel label="Huyện / Quận" required />
        {loadingDistricts ? (
          <div className="flex items-center gap-2 py-2.5 text-[13px] text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Đang tải danh sách huyện/quận...
          </div>
        ) : (
          <StyledSelect
            value={formData.districtCode}
            onChange={handleDistrictChange}
            onBlur={() => {
              if (formData.provinceCode) touchField("district", formData.district);
            }}
            disabled={!formData.provinceCode || districts.length === 0}
            placeholder={!formData.provinceCode ? "── Chọn tỉnh/thành phố trước ──" : "-- Chọn huyện / quận --"}
            hasError={!!showError("district")}
            hasSuccess={showSuccess("district")}
          >
            {districts.map((d) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </StyledSelect>
        )}
        <ErrorMsg message={showError("district")} />
      </div>

      {/* ── Ward ── */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel label="Phường / Xã" required />
        {loadingWards ? (
          <div className="flex items-center gap-2 py-2.5 text-[13px] text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Đang tải danh sách phường/xã...
          </div>
        ) : (
          <StyledSelect
            value={formData.wardCode}
            onChange={handleWardChange}
            onBlur={() => {
              if (formData.districtCode) touchField("ward", formData.ward);
            }}
            disabled={!formData.districtCode || wards.length === 0}
            placeholder={!formData.districtCode ? "── Chọn huyện/quận trước ──" : "-- Chọn phường / xã --"}
            hasError={!!showError("ward")}
            hasSuccess={showSuccess("ward")}
          >
            {wards.map((w) => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </StyledSelect>
        )}
        <ErrorMsg message={showError("ward")} />
      </div>

      {/* ── Address Detail ── */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel label="Địa chỉ cụ thể" required />
        <StyledInput
          value={formData.addressDetail}
          onChange={(e) => handleTextChange("addressDetail", e.target.value)}
          onBlur={() => touchField("addressDetail")}
          placeholder="Số nhà, tên đường, thôn/xóm..."
          maxLength={200}
          hasError={!!showError("addressDetail")}
          hasSuccess={showSuccess("addressDetail")}
        />
        <div className="flex items-start justify-between">
          <ErrorMsg message={showError("addressDetail")} />
          <span className="ml-auto text-[10px] tabular-nums text-gray-400">
            {formData.addressDetail.length}/200
          </span>
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel label="Ghi chú giao hàng" />
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Giao giờ hành chính, bấm chuông, để trước cửa..."
          rows={2}
          maxLength={300}
          className="w-full resize-none border-b border-gray-300 bg-transparent py-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
        />
        <span className="self-end text-[10px] tabular-nums text-gray-400">
          {formData.notes.length}/300
        </span>
      </div>

      {/* ── Validation Summary (shown on submit attempt with errors) ── */}
      {Object.values(errors).some(Boolean) && Object.values(touched).some(Boolean) && (
        <div className="flex items-start gap-2 rounded-none border border-red-200 bg-red-50 p-3 animate-in fade-in duration-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-[11px] text-red-600">
            Vui lòng kiểm tra và điền đầy đủ các trường được đánh dấu <span className="font-semibold">*</span> trước khi lưu.
          </p>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gray-900 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-all hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang lưu...
            </span>
          ) : isEditing ? (
            "Cập nhật địa chỉ"
          ) : (
            "Lưu địa chỉ"
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-600 transition-all hover:border-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Huỷ
          </button>
        )}
      </div>
    </form>
  );
}

export default AddressForm;
