import { Home, Briefcase, Pencil, Trash2, MapPin, Phone, User } from "lucide-react";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
  const isSelected = selectedId?._id === addressInfo?._id;

  // Build the full address string
  const fullAddressLine = [
    addressInfo?.addressDetail || addressInfo?.address,
    addressInfo?.ward,
    addressInfo?.district,
    addressInfo?.province || addressInfo?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const addressTypeLabel =
    addressInfo?.addressType === "office" ? "Văn phòng" : "Nhà riêng";
  const AddressTypeIcon =
    addressInfo?.addressType === "office" ? Briefcase : Home;

  return (
    <div
      onClick={setCurrentSelectedAddress ? () => setCurrentSelectedAddress(addressInfo) : null}
      className={`relative flex flex-col gap-3 border p-4 transition-all duration-200 ${
        setCurrentSelectedAddress ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "border-gray-900 bg-gray-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm"
      }`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center bg-gray-900">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Address Type Badge */}
      <div className="flex items-center gap-1.5">
        <AddressTypeIcon className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
          {addressTypeLabel}
        </span>
      </div>

      {/* Recipient */}
      <div className="flex items-start gap-2">
        <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span className="text-[13px] font-semibold text-gray-900">
          {addressInfo?.fullName || "—"}
        </span>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-2">
        <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span className="text-[12px] text-gray-600">
          {addressInfo?.phone || "—"}
        </span>
      </div>

      {/* Full address */}
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span className="text-[12px] leading-relaxed text-gray-600">
          {fullAddressLine || "—"}
        </span>
      </div>

      {/* Notes */}
      {addressInfo?.notes && (
        <p className="pl-5 text-[11px] italic text-gray-400">
          Ghi chú: {addressInfo.notes}
        </p>
      )}

      {/* Actions */}
      <div className="mt-1 flex gap-2 border-t border-gray-100 pt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditAddress(addressInfo);
          }}
          className="flex flex-1 items-center justify-center gap-1.5 border border-gray-200 py-1.5 text-[10px] font-medium uppercase tracking-widest text-gray-600 transition-all hover:border-gray-900 hover:text-gray-900 cursor-pointer"
        >
          <Pencil className="h-3 w-3" />
          Sửa
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteAddress(addressInfo);
          }}
          className="flex flex-1 items-center justify-center gap-1.5 border border-gray-200 py-1.5 text-[10px] font-medium uppercase tracking-widest text-gray-500 transition-all hover:border-red-400 hover:text-red-500 cursor-pointer"
        >
          <Trash2 className="h-3 w-3" />
          Xoá
        </button>
      </div>
    </div>
  );
}

export default AddressCard;
