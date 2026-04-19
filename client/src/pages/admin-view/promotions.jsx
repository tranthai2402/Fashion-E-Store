import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFormattedDate } from "@/lib/utils";
import {
  fetchAllPromotions,
  deletePromotion,
  createPromotion,
  updatePromotion,
  createVoucher
} from "@/store/admin/promotion-slice";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Calendar as CalendarIcon, X } from "lucide-react";

const initialFormData = {
  name: "",
  description: "",
  type: "automatic",
  startDate: "",
  endDate: "",
  status: "active",
  discountType: "percentage",
  discountValue: 0,
  minOrderValue: 0,
  usageLimit: "",
  usagePerUser: 1,
  isPublic: true,
  applicableProducts: [], // Changed to array of IDs
  code: "" // For code_based
};

function AdminPromotions() {
  const dispatch = useDispatch();
  const { promotions, isLoading } = useSelector((state) => state.adminPromotions);
  const { productList } = useSelector((state) => state.adminProducts);
  const { toast } = useToast();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    dispatch(fetchAllPromotions());
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Bán có chắc muốn xóa chương trình này?")) {
      dispatch(deletePromotion(id)).then((data) => {
        if (data?.payload?.success) {
          toast({ title: "Đã xóa thành công" });
          dispatch(fetchAllPromotions());
        }
      });
    }
  };

  const toLocalISOString = (d) => {
    if (!d) return "";
    const date = new Date(d);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  const handleEdit = (promo) => {
    setCurrentEditedId(promo._id);
    setFormData({
      name: promo.name,
      description: promo.description || "",
      type: promo.type || "automatic",
      startDate: toLocalISOString(promo.startDate),
      endDate: toLocalISOString(promo.endDate),
      status: promo.status || "active",
      discountType: promo.action?.discountType || "percentage",
      discountValue: promo.action?.discountValue || 0,
      minOrderValue: promo.conditions?.minOrderValue || 0,
      usageLimit: promo.usageLimit || "",
      usagePerUser: promo.usagePerUser || 1,
      isPublic: promo.isPublic !== undefined ? promo.isPublic : true,
      applicableProducts: promo.conditions?.applicableProducts || [],
      code: promo.code || "" 
    });
    setOpenDialog(true);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      conditions: {
        minOrderValue: Number(formData.minOrderValue) || 0,
        applicableProducts: formData.applicableProducts || []
      },
      action: {
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
      },
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      usagePerUser: Number(formData.usagePerUser) || 1,
      isPublic: formData.isPublic,
      code: formData.code // Include for update
    };
    
    // Validation for percentage discount
    if (payload.action.discountType === "percentage" && payload.action.discountValue >= 100) {
      toast({
        title: "Lỗi validation",
        description: "Mức giảm phần trăm phải nhỏ hơn 100%",
        variant: "destructive",
      });
      return;
    }

    if (currentEditedId) {
      dispatch(updatePromotion({ id: currentEditedId, formData: payload })).then((res) => {
        if (res?.payload?.success) {
          toast({ title: "Đã cập nhật chiến dịch thành công" });
          dispatch(fetchAllPromotions());
          setOpenDialog(false);
        }
      });
    } else {
      dispatch(createPromotion(payload)).then((res) => {
        if (res?.payload?.success) {
          toast({ title: "Đã tạo chiến dịch thành công" });
          
          if (formData.type === "code_based" && formData.code) {
            dispatch(createVoucher({
              code: formData.code,
              promotionId: res.payload.data._id,
              usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
              usagePerUser: Number(formData.usagePerUser) || 1,
              isPublic: formData.isPublic
            }));
          }
          
          dispatch(fetchAllPromotions());
          setOpenDialog(false);
          setFormData(initialFormData);
        } else {
          toast({ title: res?.payload?.message || "Lỗi tạo chiến dịch", variant: "destructive" });
        }
      });
    }
  };

  const filteredPromotions = promotions && promotions.length > 0 
    ? promotions.filter(promo => {
        const matchesName = promo.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = !dateFilter || (
          (promo.startDate && new Date(promo.startDate).toISOString().split('T')[0] === dateFilter) ||
          (promo.endDate && new Date(promo.endDate).toISOString().split('T')[0] === dateFilter)
        );
        return matchesName && matchesDate;
      })
    : [];

  if (isLoading) return <div>Đang tải...</div>;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Sales & Promotions</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo tên..." 
              className="pl-8 w-[200px]" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="date"
              className="pl-8 w-[170px]" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button 
                onClick={() => setDateFilter("")}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button onClick={() => { setCurrentEditedId(null); setFormData(initialFormData); setOpenDialog(true); }}>
            Thêm Campaign Mới
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Chương Trình</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Giảm giá</TableHead>
              <TableHead>Ngày Bắt Đầu</TableHead>
              <TableHead>Ngày Kết Thúc</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>Lượt dùng</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromotions && filteredPromotions.length > 0 ? (
              filteredPromotions.map((promo) => (
                <TableRow key={promo._id}>
                  <TableCell className="font-medium">{promo.name}</TableCell>
                  <TableCell>
                    {promo.type === "automatic" ? "Tự động" : 
                     promo.type === "code_based" ? "Mã giảm giá" : 
                     promo.type === "flash_sale" ? "Flash Sale" : "Sự kiện"}
                  </TableCell>
                  <TableCell>
                    {promo.action?.discountValue}
                    {promo.action?.discountType === "percentage" ? "%" : "$"}
                  </TableCell>
                  <TableCell>{getFormattedDate(promo.startDate)}</TableCell>
                  <TableCell>{getFormattedDate(promo.endDate)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${promo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {promo.status}
                    </span>
                  </TableCell>
                  <TableCell>{promo.usedCount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(promo)}>Sửa</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(promo._id)}>Xóa</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24 text-gray-500">
                  {searchTerm || dateFilter ? "Không tìm thấy chương trình phù hợp." : "Chưa có chương trình nào."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={openDialog} onOpenChange={setOpenDialog}>
        <SheetContent side="right" className="overflow-y-auto min-w-[400px]">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId ? "Sửa Chương Trình Sale" : "Tạo Chương Trình Sale Mới"}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={onSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Tên Chương Trình (VD: Tết 2024)</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại Sale</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="automatic">Tự động (Auto Apply)</option>
                  <option value="code_based">Có mã giảm giá (Voucher code)</option>
                  <option value="flash_sale">Flash Sale</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Trạng Thái</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Kích hoạt (Active)</option>
                  <option value="draft">Bản nháp (Draft)</option>
                  <option value="disabled">Vô hiệu hóa (Disabled)</option>
                </select>
              </div>
            </div>

            {formData.type === "code_based" && (
              <div className="space-y-2 border p-3 rounded-md bg-gray-50">
                <Label>Mã Voucher (Nhập Code người dùng sẽ dùng)</Label>
                <Input required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="VD: TET2024" />
                {currentEditedId && <p className="text-[10px] text-orange-600">Lưu ý: Thay đổi mã có thể ảnh hưởng đến người dùng đã lưu mã.</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày Bắt Đầu</Label>
                <Input required type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Ngày Kết Thúc</Label>
                <Input required type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại Giảm Giá</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.discountType} 
                  onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                >
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed_amount">Trừ tiền cứng ($)</option>
                  <option value="free_shipping">Miễn phí vận chuyển</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Mức Giảm</Label>
                <Input 
                  required 
                  type="number" 
                  min="0" 
                  max={formData.discountType === "percentage" ? "99" : undefined}
                  value={formData.discountValue} 
                  onChange={(e) => setFormData({...formData, discountValue: e.target.value})} 
                />
                {formData.discountType === "percentage" && Number(formData.discountValue) >= 100 && (
                  <p className="text-[10px] text-red-500 mt-1 font-medium">
                    Mức giảm phần trăm phải nhỏ hơn 100%
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giá Trị Đơn Tối Thiểu ($)</Label>
                <Input type="number" min="0" value={formData.minOrderValue} onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})} placeholder="VD: 100" />
              </div>
              <div className="space-y-2">
                <Label>Lượt dùng tối đa/Khách</Label>
                <Input type="number" min="1" value={formData.usagePerUser} onChange={(e) => setFormData({...formData, usagePerUser: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sản Phẩm Áp Dụng (Để trống nếu áp dụng tất cả)</Label>
              <div className="border rounded-md p-3">
                <Input 
                  placeholder="Tìm sản phẩm..." 
                  className="mb-2" 
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                  {productList && productList.length > 0 ? (
                    productList
                      .filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()))
                      .map(product => (
                        <div key={product._id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                          <Checkbox 
                            id={`prod-${product._id}`}
                            checked={formData.applicableProducts.includes(product._id)}
                            onCheckedChange={(checked) => {
                              const newSelection = checked 
                                ? [...formData.applicableProducts, product._id]
                                : formData.applicableProducts.filter(id => id !== product._id);
                              setFormData({ ...formData, applicableProducts: newSelection });
                            }}
                          />
                          <Label htmlFor={`prod-${product._id}`} className="text-xs cursor-pointer flex-1">
                            {product.title}
                          </Label>
                          <span className="text-[10px] text-gray-400">ID: ...{product._id.slice(-6)}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">Đang tải sản phẩm...</p>
                  )}
                </div>
                {formData.applicableProducts.length > 0 && (
                  <p className="text-[10px] text-sky-600 mt-2 font-medium">Đã chọn {formData.applicableProducts.length} sản phẩm</p>
                )}
              </div>
            </div>

            {formData.type === "code_based" && (
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <input 
                  type="checkbox" 
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                />
                <Label htmlFor="isPublic" className="cursor-pointer">Công khai Voucher (Hiện ở danh sách Checkout)</Label>
              </div>
            )}

            <Button type="submit" className="w-full mt-6">
              {currentEditedId ? "Cập Nhật" : "Lưu Chiến Dịch"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default AdminPromotions;
