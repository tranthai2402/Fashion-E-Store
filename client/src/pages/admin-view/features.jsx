import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFeatureImages,
  addFeatureImage,
  deleteFeatureImage,
  updateFeatureImageStatus,
} from "@/store/common-slice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  ImagePlay,
  Trash2,
  Eye,
  EyeOff,
  UploadCloud,
  Loader2,
  Images,
} from "lucide-react";
import axios from "axios";

function AdminFeatures() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { featureImageList, isLoading } = useSelector(
    (state) => state.commonFeature
  );

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  // ── Upload helpers ─────────────────────────────────────────────────────────
  const uploadAndSave = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File quá lớn",
        description: "Vui lòng chọn ảnh nhỏ hơn 5MB.",
        variant: "destructive",
      });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("my_file", file);
      const res = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        formData
      );
      if (res?.data?.success) {
        const imageUrl = res.data.result.url;
        const result = await dispatch(addFeatureImage(imageUrl));
        if (result?.payload?.success) {
          toast({ title: "Đã thêm ảnh thành công!" });
          dispatch(getFeatureImages());
        }
      }
    } catch (err) {
      toast({
        title: "Lỗi upload",
        description: "Không thể upload ảnh. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadAndSave(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadAndSave(file);
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleToggleStatus = (item) => {
    dispatch(
      updateFeatureImageStatus({ id: item._id, enabled: !item.enabled })
    ).then((res) => {
      if (res?.payload?.success) {
        toast({
          title: item.enabled
            ? "Ảnh đã được ẩn khỏi trang chủ"
            : "Ảnh đã được hiện trên trang chủ",
        });
        dispatch(getFeatureImages());
      }
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này không?")) return;
    dispatch(deleteFeatureImage(id)).then((res) => {
      if (res?.payload?.success) {
        toast({ title: "Đã xóa ảnh" });
        dispatch(getFeatureImages());
      }
    });
  };

  const enabledCount = featureImageList?.filter((i) => i.enabled !== false).length ?? 0;

  return (
    <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ImagePlay className="text-sky-500" />
            Quản lý Feature Images
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ảnh người mẫu/sản phẩm hiển thị ở trang chủ (Hero Section &amp; Banner).
            Đang hiển thị:{" "}
            <span className="font-semibold text-sky-600">{enabledCount}</span> /{" "}
            {featureImageList?.length ?? 0} ảnh
          </p>
        </div>
      </div>

      {/* ── Upload Zone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-sky-400 bg-sky-50 scale-[1.01]"
            : "border-gray-300 bg-gray-50 hover:border-sky-400 hover:bg-sky-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {isUploading ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
            <p className="text-sm text-sky-600 font-medium">Đang upload ảnh…</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-10 w-10 text-gray-400" />
            <p className="text-sm font-medium text-gray-600">
              Kéo &amp; thả ảnh vào đây hoặc{" "}
              <span className="text-sky-500 underline">nhấn để chọn</span>
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, WEBP — tối đa 5MB</p>
          </>
        )}
      </div>

      {/* ── Image Grid ── */}
      {isLoading && !featureImageList?.length ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
        </div>
      ) : featureImageList?.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-20 text-gray-400">
          <Images className="h-12 w-12" />
          <p className="text-sm">Chưa có ảnh nào. Hãy upload ảnh đầu tiên!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featureImageList.map((item, index) => (
            <div
              key={item._id}
              className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                item.enabled !== false
                  ? "border-sky-300 shadow-md"
                  : "border-gray-200 opacity-60"
              }`}
            >
              {/* Image */}
              <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100 relative">
                <img
                  src={item.image}
                  alt={`Feature ${index + 1}`}
                  className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    item.enabled === false 
                      ? "opacity-30 grayscale blur-[1px]" 
                      : "opacity-100"
                  }`}
                />
                
                {item.enabled === false && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-lg border border-white/20">
                      Đã ẩn
                    </span>
                  </div>
                )}
              </div>

              {/* Status badge */}
              <div className="absolute top-2 left-2">
                <Badge
                  className={`text-[10px] px-2 py-0.5 font-medium ${
                    item.enabled !== false
                      ? "bg-sky-500 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {item.enabled !== false ? "Đang hiển thị" : "Đang ẩn"}
                </Badge>
              </div>

              {/* Order number */}
              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-[10px] font-bold text-white">
                {index + 1}
              </div>

              {/* Hover actions */}
              <div className="absolute inset-0 flex items-end justify-center gap-2 bg-black/40 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 gap-1 text-xs"
                  onClick={() => handleToggleStatus(item)}
                >
                  {item.enabled !== false ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" /> Ẩn
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" /> Hiện
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1 text-xs"
                  onClick={() => handleDelete(item._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tips ── */}
      <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-800">
        <p className="font-semibold mb-1">💡 Gợi ý</p>
        <ul className="list-disc list-inside space-y-1 text-sky-700 text-xs">
          <li>Ảnh sẽ hiển thị theo thứ tự từ trên xuống.</li>
          <li>Ảnh nào <strong>Đang ẩn</strong> sẽ không xuất hiện trên trang chủ.</li>
          <li>Nên dùng ảnh người mẫu có tỉ lệ dọc (3:4) để hiển thị đẹp nhất.</li>
          <li>Hero Section (Section 1) chuyển ảnh mỗi 5 giây, Banner chuyển mỗi 12 giây.</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminFeatures;
