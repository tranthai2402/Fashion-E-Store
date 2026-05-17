import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, MapPin } from "lucide-react";
import {
  addNewAddress,
  deleteAddress,
  editaAddress,
  fetchAllAddresses,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import AddressForm from "./address-form";
import { useToast } from "../ui/use-toast";

function Address({ setCurrentSelectedAddress, selectedId }) {
  const [showForm, setShowForm] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [editInitialData, setEditInitialData] = useState(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchAllAddresses(user?.id));
  }, [dispatch]);

  async function handleAddAddress(formData) {
    if (addressList.length >= 3 && currentEditedId === null) {
      toast({ title: "Bạn chỉ có thể lưu tối đa 3 địa chỉ", variant: "destructive" });
      return;
    }

    if (currentEditedId !== null) {
      const result = await dispatch(
        editaAddress({ userId: user?.id, addressId: currentEditedId, formData })
      );
      if (result?.payload?.success) {
        dispatch(fetchAllAddresses(user?.id));
        toast({ title: "Cập nhật địa chỉ thành công" });
        handleCloseForm();
      } else {
        toast({ title: result?.payload?.message || "Cập nhật thất bại", variant: "destructive" });
      }
    } else {
      const result = await dispatch(
        addNewAddress({ ...formData, userId: user?.id })
      );
      if (result?.payload?.success) {
        dispatch(fetchAllAddresses(user?.id));
        toast({ title: "Thêm địa chỉ thành công" });
        handleCloseForm();
      } else {
        toast({ title: result?.payload?.message || "Thêm địa chỉ thất bại", variant: "destructive" });
      }
    }
  }

  function handleDeleteAddress(addressInfo) {
    dispatch(deleteAddress({ userId: user?.id, addressId: addressInfo._id })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllAddresses(user?.id));
        toast({ title: "Xoá địa chỉ thành công" });
      }
    });
  }

  function handleEditAddress(addressInfo) {
    setEditInitialData(addressInfo);
    setCurrentEditedId(addressInfo._id);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setCurrentEditedId(null);
    setEditInitialData(null);
  }

  const isFormOpen = showForm || currentEditedId !== null;

  return (
    <div className="space-y-6">
      {/* Address Cards */}
      {addressList && addressList.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addressList.map((singleAddressItem) => (
            <AddressCard
              key={singleAddressItem._id}
              selectedId={selectedId}
              handleDeleteAddress={handleDeleteAddress}
              addressInfo={singleAddressItem}
              handleEditAddress={handleEditAddress}
              setCurrentSelectedAddress={setCurrentSelectedAddress}
            />
          ))}
        </div>
      ) : (
        !isFormOpen && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <MapPin className="h-8 w-8 text-gray-300" />
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
              Chưa có địa chỉ nào được lưu
            </p>
          </div>
        )
      )}

      {/* Add new address button */}
      {!isFormOpen && addressList.length < 3 && (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 border border-dashed border-gray-300 py-4 text-[11px] uppercase tracking-[0.2em] text-gray-500 transition-all hover:border-gray-600 hover:text-gray-800 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Thêm địa chỉ mới
        </button>
      )}

      {/* Address Form */}
      {isFormOpen && (
        <div className="border-t border-gray-100 pt-6">
          <h3 className="mb-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-900">
            {currentEditedId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
          </h3>
          <AddressForm
            initialData={editInitialData}
            onSubmit={handleAddAddress}
            onCancel={handleCloseForm}
            isEditing={currentEditedId !== null}
          />
        </div>
      )}
    </div>
  );
}

export default Address;
